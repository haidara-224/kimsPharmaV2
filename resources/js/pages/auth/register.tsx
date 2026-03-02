import { Form, Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  Lock, 
  User, 
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Map,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    Adresse: '',
    tel: '',
    description: '',
    nom: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pharmacyImages, setPharmacyImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const logoRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, title: 'Informations générales', icon: <Building2 className="h-5 w-5" /> },
    { id: 2, title: 'Logo et détails', icon: <Camera className="h-5 w-5" /> },
    { id: 3, title: 'Sécurisation du compte', icon: <Lock className="h-5 w-5" /> }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        setIsGettingLocation(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert("Permission de géolocalisation refusée. Veuillez autoriser l'accès à votre position.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Informations de localisation non disponibles.");
            break;
          case error.TIMEOUT:
            alert("La requête de géolocalisation a expiré.");
            break;
          default:
            alert("Une erreur inconnue est survenue lors de la géolocalisation.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (currentStep === 2 && !latitude && !longitude) {
      getGeolocation();
    }
  }, [currentStep]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (errors.logo) {
        setErrors((prev: any) => ({ ...prev, logo: undefined }));
      }
    }
  };

  const handlePharmacyImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews: string[] = [];
      
      let processedCount = 0;
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          processedCount++;
          
          if (processedCount === newFiles.length) {
            setPharmacyImages(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
      
      if (errors.image) {
        setErrors((prev: any) => ({ ...prev, image: undefined }));
      }
    }
  };

  const removeImage = (index: number) => {
    setPharmacyImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch(step) {
      case 1:
        if (!formData.name || !formData.Adresse || !formData.tel) {
          alert('Veuillez remplir tous les champs obligatoires de cette étape');
          return false;
        }
        return true;
        
      case 2:
        if (!logoFile) {
          alert('Veuillez télécharger un logo pour votre pharmacie');
          return false;
        }
        if (pharmacyImages.length === 0) {
          alert('Veuillez télécharger au moins une image de votre pharmacie');
          return false;
        }
        if (!latitude || !longitude) {
          alert('Veuillez obtenir votre localisation GPS');
          return false;
        }
        return true;
        
      case 3:
        if (!formData.nom || !formData.email || !formData.password || !formData.password_confirmation) {
          alert('Veuillez remplir tous les champs obligatoires');
          return false;
        }
        if (formData.password !== formData.password_confirmation) {
          alert('Les mots de passe ne correspondent pas');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progress = (currentStep / steps.length) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setIsLoading(true);
    
    // Créer un FormData pour l'envoi multipart
    const submitFormData = new FormData();
    
    // Ajouter tous les champs textuels
    submitFormData.append('name', formData.name);
    submitFormData.append('Adresse', formData.Adresse);
    submitFormData.append('tel', formData.tel);
    submitFormData.append('nom', formData.nom);
    submitFormData.append('email', formData.email);
    submitFormData.append('password', formData.password);
    submitFormData.append('password_confirmation', formData.password_confirmation);
    
    if (formData.description) {
      submitFormData.append('description', formData.description);
    }
    
    // Ajouter les coordonnées
    submitFormData.append('coordonnees[latitude]', latitude);
    submitFormData.append('coordonnees[longitude]', longitude);
    
    // Ajouter le logo
    if (logoFile) {
      submitFormData.append('logo', logoFile);
    }
    
    // Ajouter les images multiples
    pharmacyImages.forEach((image) => {
      submitFormData.append('image[]', image);
    });
    
    // Soumettre le formulaire via Inertia router
    router.post(store(), submitFormData, {
      forceFormData: true,
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: (errors) => {
        setIsLoading(false);
        setErrors(errors);
        console.error('Erreurs de validation:', errors);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-x-hidden">
      <Head title="Inscription - Pharmacie" />
      
      <div className="flex min-h-screen">
        {/* Section gauche - Image de pharmacie */}
        <div className="hidden lg:block lg:w-1/2 xl:w-7/12 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#702a91]/95 via-[#8b3da8]/90 to-[#fa3143]/85" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#fa3143]/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          {/* Overlay avec contenu */}
          <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-10 xl:p-12 text-white overflow-y-auto">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 lg:mb-10"
              >
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 lg:px-6 py-3 border border-white/20">
                  <Sparkles className="h-5 lg:h-6 w-5 lg:w-6 text-[#fa3143]" />
                  <span className="text-lg lg:text-xl font-bold"> 3SLAB PHARMA</span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                  Transformez votre <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa3143] to-pink-300">
                    pharmacie
                  </span> aujourd'hui
                </h1>
                <p className="text-base lg:text-lg xl:text-xl mb-8 lg:mb-10 opacity-90 max-w-xl leading-relaxed">
                  Rejoignez des centaines de pharmacies qui optimisent leur gestion 
                  quotidienne avec notre plateforme innovante.
                </p>
              </motion.div>

              {/* Indicateurs de points forts avec meilleur design */}
              <div className="space-y-4">
                {[
                  { 
                    icon: <Shield className="h-5 lg:h-6 w-5 lg:w-6" />, 
                    title: "Sécurisé & Conforme",
                    text: "Gestion complète de votre inventaire pharmaceutique" 
                  },
                  { 
                    icon: <Zap className="h-5 lg:h-6 w-5 lg:w-6" />, 
                    title: "Rapide & Efficace",
                    text: "Suivi des prescriptions médicales en temps réel" 
                  },
                  { 
                    icon: <Sparkles className="h-5 lg:h-6 w-5 lg:w-6" />, 
                    title: "Intelligent & Innovant",
                    text: "Analyses et rapports détaillés sur vos performances" 
                  },
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-3 lg:gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-br from-[#fa3143] to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base lg:text-lg mb-1 truncate">{item.title}</h3>
                      <p className="text-xs lg:text-sm opacity-80 line-clamp-2">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Afficher les coordonnées GPS si disponibles */}
              {(latitude && longitude) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 lg:mt-8 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 lg:w-10 h-9 lg:h-10 bg-[#fa3143] rounded-lg flex items-center justify-center">
                      <Map className="h-4 lg:h-5 w-4 lg:w-5" />
                    </div>
                    <span className="font-semibold text-base lg:text-lg">Position détectée</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-black/20 rounded-lg p-3">
                      <span className="opacity-75 block mb-1 text-xs lg:text-sm">Latitude</span>
                      <div className="font-mono font-semibold text-sm lg:text-base truncate">
                        {parseFloat(latitude).toFixed(6)}
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <span className="opacity-75 block mb-1 text-xs lg:text-sm">Longitude</span>
                      <div className="font-mono font-semibold text-sm lg:text-base truncate">
                        {parseFloat(longitude).toFixed(6)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="text-xs lg:text-sm opacity-75 flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-white/20">
              <span className="truncate">3SLAB PHARMA Version 1.0.0</span>
            <span className="truncate">© {new Date().getFullYear()} Tous droits réservés</span>
            </div>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="w-full lg:w-1/2 xl:w-5/12 flex items-center justify-center p-4 lg:p-6 xl:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl mx-auto"
          >
            {/* Bouton retour pour mobile */}
            <Button
              variant="ghost"
              className="lg:hidden mb-6 -ml-2 hover:bg-purple-100"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>

            {/* Logo mobile */}
            <div className="flex justify-center mb-6 lg:hidden">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#702a91] to-[#fa3143] rounded-2xl px-5 py-3">
                <Sparkles className="h-5 w-5 text-white" />
                <span className="text-lg font-bold text-white">3SLAB PHARMA</span>
              </div>
            </div>

            {/* Carte du formulaire avec meilleur design */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl p-4 lg:p-6 xl:p-8 border border-gray-100 max-w-full overflow-hidden">
              <div className="text-center mb-6 lg:mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-3 lg:px-4 py-1.5 lg:py-2 mb-3 lg:mb-4"
                >
                  <Sparkles className="h-3 lg:h-4 w-3 lg:w-4 text-[#702a91]" />
                  <span className="text-xs lg:text-sm font-semibold text-[#702a91]">Inscription Gratuite</span>
                </motion.div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Créez votre compte</h2>
                <p className="text-sm lg:text-base text-gray-600">Complétez les étapes ci-dessous pour commencer</p>
              </div>

              {/* Barre de progression améliorée */}
              <div className="mb-6 lg:mb-10">
                <div className="flex items-center justify-between mb-4 lg:mb-6 relative">
                  <div className="absolute top-7 left-0 right-0 h-0.5 bg-gray-200 -z-10 mx-16 hidden lg:block" />
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center flex-1 relative">
                      <motion.div 
                        initial={false}
                        animate={{
                          scale: currentStep === step.id ? 1.1 : 1,
                        }}
                        className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center mb-2 lg:mb-3 transition-all duration-300 ${
                          currentStep > step.id 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50' 
                            : currentStep === step.id
                            ? 'bg-gradient-to-br from-[#702a91] to-[#fa3143] text-white shadow-lg shadow-purple-500/50'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-5 lg:h-6 w-5 lg:w-6" />
                        ) : (
                          step.icon
                        )}
                      </motion.div>
                      <span className={`text-xs font-medium text-center transition-colors duration-300 line-clamp-2 ${
                        currentStep >= step.id ? 'text-[#702a91]' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative h-1.5 lg:h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="absolute h-full bg-gradient-to-r from-[#702a91] to-[#fa3143] rounded-full"
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                <AnimatePresence mode="wait">
                  {/* Étape 1 - Informations générales */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 lg:space-y-5"
                    >
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <Building2 className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Nom de la pharmacie *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ex: Pharmacie Centrale"
                          className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                        />
                        {errors.name && <InputError message={errors.name} className="mt-1 lg:mt-2" />}
                      </div>

                      <div>
                        <Label htmlFor="Adresse" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <MapPin className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Adresse complète *
                        </Label>
                        <Input
                          id="Adresse"
                          name="Adresse"
                          type="text"
                          required
                          value={formData.Adresse}
                          onChange={handleInputChange}
                          placeholder="Ex: 123 Avenue de la République, Conakry"
                          className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                        />
                        {errors.Adresse && <InputError message={errors.Adresse} className="mt-1 lg:mt-2" />}
                      </div>

                      <div>
                        <Label htmlFor="tel" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <Phone className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Téléphone *
                        </Label>
                        <Input
                          id="tel"
                          name="tel"
                          type="tel"
                          required
                          value={formData.tel}
                          onChange={handleInputChange}
                          placeholder="Ex: +224 622 00 00 00"
                          className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                        />
                        {errors.tel && <InputError message={errors.tel} className="mt-1 lg:mt-2" />}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4 lg:pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 lg:h-12 border-2 border-gray-300 hover:bg-gray-100 rounded-lg lg:rounded-xl font-semibold transition-all text-sm lg:text-base flex-1"
                          onClick={()=>login()}
                        >
                          SE CONNECTER
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="h-10 lg:h-12 bg-gradient-to-r from-[#702a91] to-[#fa3143] hover:shadow-lg hover:shadow-purple-500/50 rounded-lg lg:rounded-xl font-semibold transition-all text-sm lg:text-base flex-1"
                        >
                          Suivant
                          <ChevronRight className="ml-1.5 lg:ml-2 h-4 lg:h-5 w-4 lg:w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Étape 2 - Logo et détails */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 lg:space-y-6"
                    >
                      {/* Logo */}
                      <div>
                        <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-3 lg:mb-4">
                          <Camera className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Logo de la pharmacie *
                        </Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                          <div className="relative group">
                            <div className="w-24 h-24 lg:w-28 lg:h-28 border-2 border-dashed border-gray-300 rounded-lg lg:rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 hover:border-[#702a91] transition-all cursor-pointer overflow-hidden">
                              {logoPreview ? (
                                <img 
                                  src={logoPreview} 
                                  alt="Logo preview" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Camera className="h-8 lg:h-10 w-8 lg:w-10 text-gray-400 group-hover:text-[#702a91] transition-colors" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 w-full min-w-0">
                            <input
                              ref={logoRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => logoRef.current?.click()}
                              className="w-full h-10 lg:h-12 border-2 border-gray-300 hover:border-[#702a91] rounded-lg lg:rounded-xl font-medium transition-all text-sm lg:text-base"
                            >
                              <Upload className="mr-1.5 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                              {logoFile ? 'Changer le logo' : 'Télécharger un logo'}
                            </Button>
                            <p className="text-xs lg:text-sm text-gray-500 mt-1.5 lg:mt-2">
                              PNG, JPG, GIF, SVG jusqu'à 2MB
                            </p>
                          </div>
                        </div>
                        {errors.logo && <InputError message={errors.logo} className="mt-1 lg:mt-2" />}
                      </div>

                      {/* Images de la pharmacie */}
                      <div>
                        <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-3 lg:mb-4">
                          <Camera className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Photos de la pharmacie * (minimum 1)
                        </Label>
                        <input
                          ref={imagesRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePharmacyImagesChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => imagesRef.current?.click()}
                          className="w-full h-10 lg:h-12 border-2 border-dashed border-gray-300 hover:border-[#702a91] rounded-lg lg:rounded-xl font-medium transition-all text-sm lg:text-base"
                        >
                          <Upload className="mr-1.5 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                          Ajouter des photos ({pharmacyImages.length})
                        </Button>
                        
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 lg:gap-3 mt-3 lg:mt-4">
                            {imagePreviews.map((src, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={src} 
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-20 lg:h-24 object-cover rounded-lg lg:rounded-xl border-2 border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-1.5 lg:-top-2 -right-1.5 lg:-right-2 bg-red-500 text-white rounded-full w-5 lg:w-6 h-5 lg:h-6 flex items-center justify-center text-base lg:text-lg font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {errors.image && <InputError message={errors.image} className="mt-1 lg:mt-2" />}
                      </div>

                      {/* Description */}
                      <div>
                        <Label htmlFor="description" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <FileText className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Description (Optionnel)
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Décrivez brièvement votre pharmacie, ses services et spécialités..."
                          className="border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all resize-none text-sm lg:text-base min-h-[80px] lg:min-h-[100px]"
                        />
                      </div>

                      {/* Coordonnées GPS */}
                      <div>
                        <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2 lg:mb-3">
                          <MapPin className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Localisation GPS *
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getGeolocation}
                          className="w-full h-10 lg:h-12 border-2 border-gray-300 hover:border-[#702a91] rounded-lg lg:rounded-xl font-medium transition-all text-sm lg:text-base"
                          disabled={isGettingLocation}
                        >
                          {isGettingLocation ? (
                            <>
                              <Loader2 className="mr-1.5 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5 animate-spin" />
                              Localisation...
                            </>
                          ) : (
                            <>
                              <MapPin className="mr-1.5 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                              {latitude && longitude ? 'Actualiser' : 'Obtenir position'}
                            </>
                          )}
                        </Button>
                        
                        {(latitude && longitude) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 lg:p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg lg:rounded-xl mt-3 lg:mt-4"
                          >
                            <div className="flex items-center gap-2 mb-2 lg:mb-3">
                              <div className="w-7 lg:w-8 h-7 lg:h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Map className="h-3 lg:h-4 w-3 lg:w-4 text-white" />
                              </div>
                              <span className="text-xs lg:text-sm font-semibold text-blue-900">
                                Position enregistrée ✓
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 lg:gap-3">
                              <div className="bg-white rounded-lg p-2 lg:p-3 border border-blue-100">
                                <span className="text-xs text-blue-700 font-medium">Latitude</span>
                                <div className="font-mono text-xs lg:text-sm font-semibold text-gray-800 mt-0.5 truncate">
                                  {parseFloat(latitude).toFixed(6)}
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-2 lg:p-3 border border-blue-100">
                                <span className="text-xs text-blue-700 font-medium">Longitude</span>
                                <div className="font-mono text-xs lg:text-sm font-semibold text-gray-800 mt-0.5 truncate">
                                  {parseFloat(longitude).toFixed(6)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {errors.coordonnees && <InputError message={errors.coordonnees} className="mt-1 lg:mt-2" />}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4 lg:pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="h-10 lg:h-12 border-2 border-gray-300 hover:bg-gray-100 rounded-lg lg:rounded-xl font-semibold transition-all text-sm lg:text-base flex-1"
                        >
                          <ChevronLeft className="mr-1.5 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                          Précédent
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="h-10 lg:h-12 bg-gradient-to-r from-[#702a91] to-[#fa3143] hover:shadow-lg hover:shadow-purple-500/50 rounded-lg lg:rounded-xl font-semibold transition-all text-sm lg:text-base flex-1"
                        >
                          Suivant
                          <ChevronRight className="ml-1.5 lg:ml-2 h-4 lg:h-5 w-4 lg:w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Étape 3 - Sécurisation du compte */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 lg:space-y-5"
                    >
                      <div>
                        <Label htmlFor="nom" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <User className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Nom complet *
                        </Label>
                        <Input
                          id="nom"
                          name="nom"
                          type="text"
                          required
                          value={formData.nom}
                          onChange={handleInputChange}
                          placeholder="Ex: Dr. Jean Dupont"
                          className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                        />
                        {errors.nom && <InputError message={errors.nom} className="mt-1 lg:mt-2" />}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <Mail className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Email professionnel *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="pharmacie@exemple.com"
                          className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                        />
                        {errors.email && <InputError message={errors.email} className="mt-1 lg:mt-2" />}
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <Lock className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Mot de passe *
                        </Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Minimum 8 caractères"
                          className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                        />
                        {errors.password && <InputError message={errors.password} className="mt-1 lg:mt-2" />}
                      </div>

                      <div>
                        <Label htmlFor="password_confirmation" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                          <Lock className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                          Confirmer le mot de passe *
                        </Label>
                        <Input
                          id="password_confirmation"
                          name="password_confirmation"
                          type="password"
                          required
                          value={formData.password_confirmation}
                          onChange={handleInputChange}
                          placeholder="Répétez le mot de passe"
                          className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                        />
                        {errors.password_confirmation && <InputError message={errors.password_confirmation} className="mt-1 lg:mt-2" />}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-4 lg:pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="h-10 lg:h-12 border-2 border-gray-300 hover:bg-gray-100 rounded-lg lg:rounded-xl font-semibold transition-all text-sm lg:text-base flex-1"
                        >
                          <ChevronLeft className="mr-1.5 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                          Précédent
                        </Button>
                        <Button
                          type="submit"
                          className="h-10 lg:h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50 rounded-lg lg:rounded-xl font-semibold transition-all text-sm lg:text-base flex-1"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-1.5 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5 animate-spin" />
                              Création...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-1.5 lg:mr-2 h-4 lg:h-5 w-4 lg:w-5" />
                              Créer mon compte
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-center text-xs lg:text-sm text-gray-600 pt-4 lg:pt-6 border-t border-gray-200">
                  <p>
                    Déjà inscrit ?{' '}
                    <TextLink href={login()} className="text-[#702a91] hover:text-[#fa3143] font-semibold transition-colors">
                      Connectez-vous ici
                    </TextLink>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
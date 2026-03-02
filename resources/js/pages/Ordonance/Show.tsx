import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/phamacie-layout';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  XCircle, 
  Users, 
  Calendar, 
  Phone, 
  Package, 
  DollarSign, 
  AlertCircle,
  FileText,
  CreditCard,
  UserCircle,
  Clock,
  ShoppingCart,
  MapPin,
  Truck,
  FileImage,
  Upload,
  Image as ImageIcon,
  Mail,
  User2,
  User2Icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { BreadcrumbItem, Ordonnance, Pharmacie, Produit, SearchedProduct, User } from '@/types';

interface ShowProps {
  ordonnance: Ordonnance & {
    pharmacie: Pharmacie;
    user: User;
    produits?: Produit[];
  };
  searched_product: SearchedProduct[]; // Note: pluriel pour correspondre au nom Blade
  errors?: Record<string, string>;
}
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard'
    },
    {
        title: 'Ordonnances',
        href: '/dashboard'
    },
];

export default function Show({ ordonnance, searched_product, errors }: ShowProps) {
const [totalGeneral, setTotalGeneral] = useState(Number(ordonnance.total) || 0);
  const [produitsAvecDetails, setProduitsAvecDetails] = useState<
    Array<SearchedProduct & { prix_unitaire_input: number }>
  >([]);
  
const { data, setData, put, processing, errors: formErrors } = useForm({
  ordonnance_id: ordonnance.id,
  produit_id: searched_product.map(p => p.produit_id),
  prix_unitaire: searched_product.map(p => Number(p.prix_unitaire) || 0), // ✅
  quantite: searched_product.map(p => Number(p.quantite) || 1),           // ✅
  feedback: ordonnance.feedback || '',
  status: ordonnance.status || 'en_attente',
  statut_livraison: ordonnance.statut_livraison || 'en_attente',
  frais_livraison: Number(ordonnance.frais_livraison) || 0,                // ✅
  coordonees_livraison: ordonnance.coordonees_livraison || '',
});

useEffect(() => {
  const produits = searched_product.map(prod => ({
    ...prod,
    images: Array.isArray(prod.images)
      ? prod.images
      : prod.images
      ? JSON.parse(prod.images)
      : [],
    prix_unitaire_input: Number(prod.prix_unitaire) || 0,  // ✅ cast ici aussi
  }));

  setProduitsAvecDetails(produits);

  const totalProduits = produits.reduce(
    (sum, p) => sum + (Number(p.prix_unitaire_input) * Number(p.quantite)),
    0
  );

  setTotalGeneral(totalProduits + (Number(ordonnance.frais_livraison) || 0));
}, [searched_product]);
const recalcTotal = () => {
  const totalProduits = data.prix_unitaire.reduce((sum, prix, idx) => {
    const quantite = data.quantite[idx] || 0;
    return sum + prix * quantite;
  }, 0);

  setTotalGeneral(totalProduits + (data.frais_livraison || 0));
};
const handlePrixChange = (index: number, value: string) => {
  const newPrixUnitaire = [...data.prix_unitaire];
  newPrixUnitaire[index] = parseFloat(value) || 0;
  setData('prix_unitaire', newPrixUnitaire);

  const updatedProduits = [...produitsAvecDetails];
  updatedProduits[index] = { ...updatedProduits[index], prix_unitaire_input: newPrixUnitaire[index] };
  setProduitsAvecDetails(updatedProduits);

  const totalProduits = newPrixUnitaire.reduce((sum, prix, idx) =>
    sum + (Number(prix) || 0) * (Number(data.quantite[idx]) || 0), 0
  );
  setTotalGeneral(totalProduits + (Number(data.frais_livraison) || 0));
};

const handleQuantiteChange = (index: number, value: string) => {
  const newQuantite = [...data.quantite];
  newQuantite[index] = parseInt(value) || 1;
  setData('quantite', newQuantite);

  const updatedProduits = [...produitsAvecDetails];
  updatedProduits[index] = { ...updatedProduits[index], quantite: newQuantite[index] };
  setProduitsAvecDetails(updatedProduits);

  const totalProduits = produitsAvecDetails.reduce((sum, p, idx) =>
    sum + (Number(p.prix_unitaire_input) || 0) * (Number(newQuantite[idx]) || 0), 0
  );
  setTotalGeneral(totalProduits + (Number(data.frais_livraison) || 0));
};

const handleFraisLivraisonChange = (value: string) => {
  const frais = parseFloat(value) || 0;
  setData('frais_livraison', frais);

  const totalProduits = produitsAvecDetails.reduce((sum, p, idx) =>
    sum + (Number(p.prix_unitaire_input) || 0) * (Number(data.quantite[idx]) || 0), 0
  );
  setTotalGeneral(totalProduits + frais);
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  put(`/serched-product/${ordonnance.id}`, {
    onSuccess: () => toast.success('Prix mis à jour avec succès'),
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });
};
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/ordonance/feedback/${ordonnance.id}`, {
      onSuccess: () => {
        toast.success('Feedback envoyé avec succès');
      },
      onError: () => {
        toast.error('Erreur lors de l\'envoi du feedback');
      }
    });
  };

  const handleStatusChange = (status: Ordonnance['status']) => {
    setData('status', status);
    put(`/ordonance/${status}/${ordonnance.id}`, {
      onSuccess: () => {
        toast.success(`Statut changé en ${getStatusText(status)}`);
      },
      onError: () => {
        toast.error('Erreur lors du changement de statut');
      }
    });
  };

  const handleLivraisonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/dashboard/ordonnances/${ordonnance.id}/livraison`, {
      onSuccess: () => {
        toast.success('Informations de livraison mises à jour');
      },
      onError: () => {
        toast.error('Erreur lors de la mise à jour');
      }
    });
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'approuve': return 'Approuvé';
      case 'en_attente': return 'En attente';
      case 'rejete': return 'Rejeté';
      case 'comment': return 'En commentaire';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approuve': return 'bg-green-100 text-green-800 border-green-200';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejete': return 'bg-red-100 text-red-800 border-red-200';
      case 'comment': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLivraisonStatusText = (status: string) => {
    switch(status) {
      case 'livre': return 'Livré';
      case 'en_cours': return 'En cours';
      case 'en_attente': return 'En attente';
      default: return status;
    }
  };

  const getLivraisonStatusColor = (status: string) => {
    switch(status) {
      case 'livre': return 'bg-green-100 text-green-800 border-green-200';
      case 'en_cours': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalProduit = (index: number) => {
    const produit = produitsAvecDetails[index];
    if (!produit) return 0;
    return produit.prix_unitaire_input * data.quantite[index];
  };

  return (
     <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="" />
                   <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ordonnance #{ordonnance.numero}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(ordonnance.status)}>
                  {getStatusText(ordonnance.status)}
                </Badge>
                <Badge className={getLivraisonStatusColor(ordonnance.statut_livraison)}>
                  <Truck className="h-3 w-3 mr-1" />
                  {getLivraisonStatusText(ordonnance.statut_livraison)}
                </Badge>
              </div>
            </div>
          </div>
          
          {ordonnance.fichier && (
            <Button
              variant="outline"
              className="border-teal-500 text-teal-600 hover:bg-teal-50"
              onClick={() => ordonnance.fichier && window.open(ordonnance.fichier, '_blank')}
            >
              <FileImage className="h-4 w-4 mr-2" />
              Voir l'ordonnance
            </Button>
          )}
        </div>

        {/* Erreurs globales */}
        <AnimatePresence>
          {(errors && Object.keys(errors).length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Onglets */}
        <Tabs defaultValue="produits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4">
            <TabsTrigger value="produits">
              <Package className="h-4 w-4 mr-2" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="informations">
              <FileText className="h-4 w-4 mr-2" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="livraison">
              <Truck className="h-4 w-4 mr-2" />
              Livraison
            </TabsTrigger>
            <TabsTrigger value="actions">
              <MessageSquare className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Onglet Produits */}
          <TabsContent value="produits">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6" />
                    Produits à commander
                  </CardTitle>
                  <CardDescription>
                    Définissez les prix unitaires et quantités pour chaque produit
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {produitsAvecDetails.map((produit, index) => {
                      const errorPrix = formErrors?.[`prix_unitaire.${index}`];
                      const errorQuantite = formErrors?.[`quantite.${index}`];
                      const totalProduit = calculateTotalProduit(index);

                      return (
                        <motion.div
                          key={produit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border-teal-100 hover:border-teal-300 transition-colors">
                            <CardContent className="pt-6">
                              <div className="flex flex-col lg:flex-row gap-6">
                                {/* Informations produit */}
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-semibold text-lg text-gray-900">
                                        {produit.nom}
                                      </h4>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {produit.categorie && (
                                          <Badge variant="outline" className="text-xs">
                                            {produit.categorie}
                                          </Badge>
                                        )}
                                        {produit.sous_categorie && (
                                          <Badge variant="secondary" className="text-xs">
                                            {produit.sous_categorie}
                                          </Badge>
                                        )}
                                        {produit.forme_dosage && (
                                          <Badge variant="outline" className="text-xs">
                                            {produit.forme_dosage}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {produit.images && produit.images.length > 0 && (
                                      <div className="flex gap-2">
                                        {produit.images.slice(0, 2).map((img, imgIndex) => (
                                          <div
                                            key={imgIndex}
                                            className="w-16 h-16 rounded-lg overflow-hidden border"
                                          >
                                            <img
                                              src={img}
                                              alt={`${produit.nom} ${imgIndex + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Prix et quantité */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div className="space-y-2">
                                      <Label htmlFor={`prix_${produit.id}`}>
                                        <DollarSign className="h-4 w-4 inline mr-1" />
                                        Prix unitaire (GNF)
                                      </Label>
                                      <Input
                                        id={`prix_${produit.id}`}
                                        type="number"
                                        min="0"
                                       name="prix_unitaire[]" 
                                        value={data.prix_unitaire[index] || ''}
                                        onChange={(e) => handlePrixChange(index, e.target.value)}
                                        className={errorPrix ? 'border-red-500' : ''}
                                        placeholder="Prix en GNF"
                                      />
                                      {errorPrix && (
                                        <p className="text-sm text-red-500">{errorPrix}</p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor={`quantite_${produit.id}`}>
                                        <Package className="h-4 w-4 inline mr-1" />
                                        Quantité
                                      </Label>
                                      <Input
                                        id={`quantite_${produit.id}`}
                                        type="number"
                                        min="1"
                                        value={data.quantite[index] || 1}
                                        onChange={(e) => handleQuantiteChange(index, e.target.value)}
                                        className={errorQuantite ? 'border-red-500' : ''}
                                      />
                                      {errorQuantite && (
                                        <p className="text-sm text-red-500">{errorQuantite}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Total produit */}
                                <div className="lg:w-48">
                                  <Card className="bg-teal-50 border-teal-200">
                                    <CardContent className="p-4">
                                      <div className="space-y-2">
                                        <p className="text-sm text-gray-500">Total produit</p>
                                        <motion.p 
                                          key={totalProduit}
                                          initial={{ scale: 1.1 }}
                                          animate={{ scale: 1 }}
                                          className="text-2xl font-bold text-teal-700"
                                        >
                                          {formatCurrency(totalProduit)}
                                        </motion.p>
                                        <div className="text-sm text-gray-600">
                                          <p>{data.quantite[index]} × {formatCurrency(produit.prix_unitaire_input)}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}

                    {/* Frais de livraison */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: produitsAvecDetails.length * 0.1 }}
                    >
                      <Card className="border-blue-100">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="frais_livraison" className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Frais de livraison (GNF)
                              </Label>
                              <Input
                                id="frais_livraison"
                                type="number"
                                min="0"
                                value={data.frais_livraison || ''}
                                onChange={(e) => handleFraisLivraisonChange(e.target.value)}
                                placeholder="Frais optionnels"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-sm text-gray-500">Inclus dans le total</p>
                                <p className="text-lg font-semibold text-blue-600">
                                  {formatCurrency(data.frais_livraison || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Total général */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (produitsAvecDetails.length + 1) * 0.1 }}
                    >
                      <Card className="bg-linear-to-r from-teal-50 to-blue-50 border-teal-200">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Total Général</h3>
                              <p className="text-gray-600">
                                {produitsAvecDetails.length} produit(s)
                                {data.frais_livraison ? ' + livraison' : ''}
                              </p>
                            </div>
                            <div className="text-center sm:text-right">
                              <motion.p 
                                key={totalGeneral}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-4xl font-bold text-teal-700"
                              >
                                {formatCurrency(totalGeneral)}
                              </motion.p>
                              <p className="text-sm text-gray-500 mt-1">GNF</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="text-sm text-gray-500">
                    Le patient sera notifié des modifications de prix
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-teal-600 hover:bg-teal-700 px-8"
                    disabled={processing}
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Enregistrer les prix et quantités
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* Onglet Informations */}
          <TabsContent value="informations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations patient */}
              <Card>
                <CardHeader className="bg-teal-50">
                  <CardTitle className="flex items-center gap-2">
                    <User2 className="h-5 w-5" />
                    Informations Patient
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <UserCircle className="h-5 w-5 text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-semibold">{ordonnance.patient}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <Calendar className="h-5 w-5 text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Âge</p>
                        <p className="font-semibold">{ordonnance.age_patient || 'Non spécifié'} ans</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <Calendar className="h-5 w-5 text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Date de l'ordonnance</p>
                        <p className="font-semibold">{formatDate(ordonnance.date_ord)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations client */}
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <User2Icon className="h-5 w-5" />
                    Informations Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <UserCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Nom</p>
                        <p className="font-semibold">{ordonnance.user.nom}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-semibold">{ordonnance.user.tel}</p>
                      </div>
                    </div>
                    
                    {ordonnance.user.email && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold">{ordonnance.user.email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informations pharmacie */}
              <Card className="lg:col-span-2">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Informations Pharmacie
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Numéro ordonnance</p>
                          <p className="font-semibold text-lg">{ordonnance.numero}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Total initial</p>
                          <p className="font-semibold">{formatCurrency(ordonnance.total)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Statut</p>
                          <Badge className={getStatusColor(ordonnance.status)}>
                            {getStatusText(ordonnance.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Pharmacie</p>
                          <p className="font-semibold">{ordonnance.pharmacie.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Téléphone pharmacie</p>
                          <p className="font-semibold">{ordonnance.pharmacie.tel}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Adresse</p>
                          <p className="font-semibold">{ordonnance.pharmacie.adresse}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Livraison */}
          <TabsContent value="livraison">
            <form onSubmit={handleLivraisonSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-6 w-6" />
                    Informations de Livraison
                  </CardTitle>
                  <CardDescription>
                    Gérez les détails de livraison pour cette commande
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Statut livraison */}
                  <div className="space-y-4">
                    <Label>Statut de livraison</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['en_attente', 'en_cours', 'livre'] as const).map((statut) => (
                        <motion.div key={statut} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            variant={data.statut_livraison === statut ? 'default' : 'outline'}
                            className={`w-full h-14 ${
                              data.statut_livraison === statut 
                                ? statut === 'livre' ? 'bg-green-600 hover:bg-green-700' 
                                : statut === 'en_cours' ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-yellow-600 hover:bg-yellow-700'
                                : ''
                            }`}
                            onClick={() => setData('statut_livraison', statut)}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            {getLivraisonStatusText(statut)}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Coordonnées livraison */}
                  <div className="space-y-2">
                    <Label htmlFor="coordonees_livraison" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Coordonnées de livraison
                    </Label>
                    <Textarea
                      id="coordonees_livraison"
                      value={data.coordonees_livraison}
                      onChange={(e) => setData('coordonees_livraison', e.target.value)}
                      placeholder="Adresse complète, instructions spéciales..."
                      rows={3}
                      className="focus:border-teal-500"
                    />
                  </div>

                  {/* Frais livraison */}
                  <div className="space-y-2">
                    <Label htmlFor="frais_livraison_input" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Frais de livraison (GNF)
                    </Label>
                    <Input
                      id="frais_livraison_input"
                      type="number"
                      min="0"
                      disabled
                      value={data.frais_livraison || ''}
                      onChange={(e) => setData('frais_livraison', parseFloat(e.target.value) || 0)}
                      placeholder="Montant des frais de livraison"
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  {/* <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Mettre à jour la livraison
                  </Button> */}
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* Onglet Actions */}
          <TabsContent value="actions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Feedback au Patient
                  </CardTitle>
                  <CardDescription>
                    Laissez un message ou des instructions
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleFeedbackSubmit}>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="feedback">Message</Label>
                        <Textarea
                          id="feedback"
                          value={data.feedback}
                          onChange={(e) => setData('feedback', e.target.value)}
                          placeholder="Écrivez votre feedback ici..."
                          rows={4}
                          className="focus:border-teal-500"
                        />
                        {formErrors?.feedback && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.feedback}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      variant="outline"
                      className="border-teal-500 text-teal-600 hover:bg-teal-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le Feedback
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Changement statut */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Changer le Statut
                  </CardTitle>
                  <CardDescription>
                    Modifiez l'état de cette ordonnance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="button"
                          variant={ordonnance.status === 'approuve' ? 'default' : 'outline'}
                          className={`w-full h-16 ${
                            ordonnance.status === 'approuve' 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'border-green-500 text-green-600 hover:bg-green-50'
                          }`}
                          onClick={() => handleStatusChange('approuve')}
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Approuver
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="button"
                          variant={ordonnance.status === 'comment' ? 'default' : 'outline'}
                          className={`w-full h-16 ${
                            ordonnance.status === 'comment' 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                          }`}
                          onClick={() => handleStatusChange('comment')}
                        >
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Commenter
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="button"
                          variant={ordonnance.status === 'rejete' ? 'default' : 'outline'}
                          className={`w-full h-16 ${
                            ordonnance.status === 'rejete' 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'border-red-500 text-red-600 hover:bg-red-50'
                          }`}
                          onClick={() => handleStatusChange('rejete')}
                        >
                          <XCircle className="h-5 w-5 mr-2" />
                          Rejeter
                        </Button>
                      </motion.div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Statut actuel</h4>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-full ${getStatusColor(ordonnance.status).split(' ')[0]}`}>
                          {ordonnance.status === 'approuve' && <CheckCircle className="h-5 w-5" />}
                          {ordonnance.status === 'comment' && <MessageSquare className="h-5 w-5" />}
                          {ordonnance.status === 'rejete' && <XCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{getStatusText(ordonnance.status)}</p>
                          <p className="text-sm text-gray-500">Dernière mise à jour</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
            </AppLayout>
 
  );
}
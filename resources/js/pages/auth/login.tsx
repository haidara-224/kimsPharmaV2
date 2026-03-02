import { Form, Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Mail, 
  Lock, 
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Zap,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Récupérer les erreurs et messages flash
    const page = usePage<{ errors?: Record<string, string>; flash?: { error?: string } }>();
    const errors = page.props.errors || {};
    const flashError = page.props.flash?.error;

    useEffect(() => {
        if (flashError) {
            toast.error(flashError);
        }
    }, [flashError]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const formData = new FormData(e.target as HTMLFormElement);
        
        router.post(store(), formData, {
            onSuccess: () => {
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-x-hidden">
            <Head title="Connexion - Pharmacie" />
            
            <div className="flex min-h-screen">
                {/* Section gauche - Image et contenu */}
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
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#fa3143]/20 rounded-full blur-3xl animate-pulse delay-1000" />
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
                                    <span className="text-lg lg:text-xl font-bold">3SLAB PHARMA</span>
                                </div>
                            </motion.div>
                            
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                                    Bienvenue sur <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa3143] to-pink-300">
                                       3SLAB PHARMA
                                    </span>
                                </h1>
                                <p className="text-base lg:text-lg xl:text-xl mb-8 lg:mb-10 opacity-90 max-w-xl leading-relaxed">
                                    Gérez votre pharmacie efficacement avec notre plateforme tout-en-un. 
                                    Reconnectez-vous pour accéder à vos outils de gestion.
                                </p>
                            </motion.div>

                            {/* Indicateurs de points forts */}
                            <div className="space-y-4">
                                {[
                                    { 
                                        icon: <Shield className="h-5 lg:h-6 w-5 lg:w-6" />, 
                                        title: "Accès Sécurisé",
                                        text: "Connexion chiffrée et authentification sécurisée" 
                                    },
                                    { 
                                        icon: <Zap className="h-5 lg:h-6 w-5 lg:w-6" />, 
                                        title: "Rapide & Intuitif",
                                        text: "Interface optimisée pour une gestion fluide" 
                                    },
                                    { 
                                        icon: <CheckCircle className="h-5 lg:h-6 w-5 lg:w-6" />, 
                                        title: "Gestion Complète",
                                        text: "Suivez vos stocks, ventes et prescriptions en temps réel" 
                                    },
                                ].map((item, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                                        className="flex items-start gap-3 lg:gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
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
                        </div>

                        <div className="text-xs lg:text-sm opacity-75 flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-white/20">
                            <span className="truncate">3SLAB PHARMA Version 1.0.0</span>
                            <span className="truncate">© {new Date().getFullYear()} Tous droits réservés</span> 
                        </div>
                    </div>
                </div>

                {/* Section droite - Formulaire de connexion */}
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
                                <span className="text-lg font-bold text-white">3SLAB KIMS PHARMA</span>
                            </div>
                        </div>

                        {/* Carte du formulaire */}
                        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl p-4 lg:p-6 xl:p-8 border border-gray-100 max-w-full overflow-hidden">
                            <div className="text-center mb-6 lg:mb-8">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-3 lg:px-4 py-1.5 lg:py-2 mb-3 lg:mb-4"
                                >
                                    <Sparkles className="h-3 lg:h-4 w-3 lg:w-4 text-[#702a91]" />
                                    <span className="text-xs lg:text-sm font-semibold text-[#702a91]">
                                        Plateforme Pharmacie
                                    </span>
                                </motion.div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                    Connectez-vous
                                </h2>
                                <p className="text-sm lg:text-base text-gray-600">
                                    Accédez à votre espace personnel
                                </p>
                            </div>

                            {status && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <p className="text-sm font-medium text-green-800">{status}</p>
                                    </div>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                                <div className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <Label htmlFor="email" className="text-gray-700 font-semibold text-sm flex items-center gap-2 mb-2">
                                            <Mail className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                                            Email professionnel *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            placeholder="pharmacie@exemple.com"
                                            className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Mot de passe */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <Label htmlFor="password" className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                                                <Lock className="h-3.5 lg:h-4 w-3.5 lg:w-4 text-[#702a91]" />
                                                Mot de passe *
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs lg:text-sm text-[#702a91] hover:text-[#fa3143] font-medium transition-colors"
                                                >
                                                    Mot de passe oublié ?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required
                                                autoComplete="current-password"
                                                placeholder="Votre mot de passe"
                                                className="h-10 lg:h-12 border-2 border-gray-200 focus:border-[#702a91] focus:ring-2 focus:ring-[#702a91]/20 rounded-lg lg:rounded-xl transition-all text-sm lg:text-base pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#702a91] transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" />
                                                ) : (
                                                    <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember me */}
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            className="border-2 border-gray-300 data-[state=checked]:bg-[#702a91] data-[state=checked]:border-[#702a91]"
                                        />
                                        <Label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                                            Se souvenir de moi
                                        </Label>
                                    </div>

                                    {/* Bouton de connexion */}
                                    <Button
                                        type="submit"
                                        className="w-full h-10 lg:h-12 bg-gradient-to-r from-[#702a91] to-[#fa3143] hover:shadow-lg hover:shadow-purple-500/50 rounded-lg lg:rounded-xl font-semibold transition-all text-sm lg:text-base mt-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Spinner className="mr-2 h-4 w-4" />
                                                Connexion...
                                            </>
                                        ) : (
                                            'Se connecter'
                                        )}
                                    </Button>
                                </div>

                                {/* Lien d'inscription */}
                                {canRegister && (
                                    <div className="text-center text-xs lg:text-sm text-gray-600 pt-4 lg:pt-6 border-t border-gray-200">
                                        <p>
                                            Pas encore de compte ?{' '}
                                            <TextLink 
                                                href={register()} 
                                                className="text-[#702a91] hover:text-[#fa3143] font-semibold transition-colors inline-flex items-center gap-1"
                                            >
                                                <UserPlus className="h-3.5 w-3.5" />
                                                Créer un compte
                                            </TextLink>
                                        </p>
                                    </div>
                                )}
                            </form>

                            {/* Informations supplémentaires */}
                            <div className="mt-6 lg:mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-purple-100">
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-[#702a91] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs lg:text-sm text-gray-700 font-medium mb-1">
                                            Connexion sécurisée
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Votre session est protégée par chiffrement SSL 256-bit
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
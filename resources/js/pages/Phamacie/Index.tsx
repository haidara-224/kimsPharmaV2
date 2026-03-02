import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
    Store,
    MapPin,
    Phone,
    Clock,
    Image as ImageIcon,
    Upload,
    X,
    Edit,
    Save,
    Trash2,
    Users,
    Settings,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Power,
    Camera,
    Loader2,
   
    Navigation,
   
    Calendar,
} from 'lucide-react';

import { BreadcrumbItem, Pharmacie, User } from '@/types';
import AppLayout from '@/layouts/phamacie-layout';

import TeamManagement from '@/components/TeamManagement';
import QuickStatCard from '@/components/QuickStatCard';

interface IndexProps {
    pharmacie: Pharmacie;
    images: string[] | null;
    users: User[];
    roles: { id: number; name: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard'
    },
    {
        title: 'Paramétrages',
        href: ''
    },
];



const normalizeImages = (imgs: any): string[] => {
    if (!imgs) return [];

    if (Array.isArray(imgs)) {
        return imgs.map(img => {
            if (typeof img === 'string') {
                return img.replace(/^\/?storage\//, '');
            }
            return img;
        });
    }

    if (typeof imgs === 'string') {
        try {
        
            let cleanStr = imgs
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .replace(/\\\//g, '/');

            const parsed = JSON.parse(cleanStr);
            if (Array.isArray(parsed)) {
                return parsed.map(img => img.replace(/^\/?storage\//, ''));
            }
            return [imgs.replace(/^\/?storage\//, '')];
        } catch {
            return [imgs.replace(/^\/?storage\//, '')];
        }
    }

    return [];
};

const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/storage/')) return imagePath;
    return `/storage/${imagePath.replace(/^\/?storage\//, '')}`;
};



export default function Index({ pharmacie, images, users, roles }: IndexProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const form = useForm({
        Pharmacie: pharmacie.name || '',
        Adresse: pharmacie.adresse || '',
        Telephone: pharmacie.tel || '',
        description: pharmacie.description || '',

        logo: null as File | null,
        image: [] as File[],
        deleted_images: '' as string,
    });

    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        pharmacie.logo ? getImageUrl(pharmacie.logo) : null
    );
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
        normalizeImages(images || pharmacie.image).map(img => getImageUrl(img))
    );
    const [deletedImages, setDeletedImages] = useState<string[]>([]);


    const [statut, setStatut] = useState(pharmacie.statut || 'inactive');
    const [disponibilite, setDisponibilite] = useState(pharmacie.disponibilite || 'closed');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);


    const stats = {
        totalImages: galleryPreviews.length,
        hasLogo: !!logoPreview,
        lastUpdate: new Date(pharmacie.updated_at).toLocaleDateString('fr-FR'),
        created: new Date(pharmacie.created_at).toLocaleDateString('fr-FR'),
    };

    // Récupérer et afficher les messages flash
    const page = usePage<{ flash?: { success?: string; error?: string } }>();
    const flashSuccess = page.props.flash?.success;
    const flashError = page.props.flash?.error;

    useEffect(() => {
        if (flashSuccess) {
            toast.success(flashSuccess);
        }
    }, [flashSuccess]);

    useEffect(() => {
        if (flashError) {
            toast.error(flashError);
        }
    }, [flashError]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        form.setData(name as keyof typeof form.data, value);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setGalleryImages(prev => [...prev, ...files]);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setGalleryPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };


    const handleRemoveGalleryImage = (index: number) => {
        const imageToRemove = galleryPreviews[index];


        if (imageToRemove.startsWith('/storage/')) {
            setDeletedImages(prev => [...prev, imageToRemove]);
        }


        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));


        if (galleryImages[index]) {
            setGalleryImages(prev => prev.filter((_, i) => i !== index));
        }
    };


    const handleStatusChange = async (newStatus: string) => {
        setIsUpdatingStatus(true);

        router.put(`/paramettrage/${pharmacie.id}/update-status`, {
            statut: newStatus
        }, {
            onSuccess: () => {
                setStatut(newStatus);
                toast.success(`Statut mis à jour avec succès`);
            },
            onError: () => {
                toast.error("Erreur lors de la mise à jour du statut");
            },
            onFinish: () => {
                setIsUpdatingStatus(false);
            }
        });
    };


    const handleDisponibiliteChange = async (newDispo: string) => {
        setIsUpdatingStatus(true);

        router.put(`/paramettrage/${pharmacie.id}/update-disponibilite`, {
            disponibilite: newDispo
        }, {
            onSuccess: () => {
                setDisponibilite(newDispo);
                toast.success(`Disponibilité mise à jour avec succès`);
            },
            onError: () => {
                toast.error("Erreur lors de la mise à jour de la disponibilité");
            },
            onFinish: () => {
                setIsUpdatingStatus(false);
            }
        });
    };

  
    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create FormData manually to ensure proper serialization
        const formData = new FormData();
        
        // Add method for PUT request (required for form submission)
        formData.append('_method', 'PUT');
        
        // Add text fields
        formData.append('Pharmacie', form.data.Pharmacie);
        formData.append('Adresse', form.data.Adresse);
        formData.append('Telephone', form.data.Telephone);
        formData.append('description', form.data.description);
        
        // Add files
        if (logo) {
            formData.append('logo', logo);
        }
        
        // Add gallery images
        if (galleryImages.length) {
            galleryImages.forEach((file, index) => {
                formData.append(`image[${index}]`, file);
            });
        }
        
        // Add deleted images
        if (deletedImages.length) {
            formData.append('deleted_images', JSON.stringify(deletedImages));
        }
        
        console.log('Submitting form with data:', Object.fromEntries(formData));

        // Use router.post with manual FormData and _method spoofing
        router.post(`/paramettrage/update/${pharmacie.id}`, formData, {
            preserveState: true,
            onSuccess: () => {
                toast.success('Pharmacie mise à jour avec succès');
                setIsEditing(false);
                setLogo(null);
                setGalleryImages([]);
                setDeletedImages([]);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error("Erreur lors de la mise à jour");
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };


    const handleCancel = () => {
        form.setData({
            Pharmacie: pharmacie.name || '',
            Adresse: pharmacie.adresse || '',
            Telephone: pharmacie.tel || '',
            description: pharmacie.description || '',
        });
        setLogoPreview(pharmacie.logo ? getImageUrl(pharmacie.logo) : null);
        setLogo(null);
        setGalleryPreviews(normalizeImages(images || pharmacie.image).map(img => getImageUrl(img)));
        setGalleryImages([]);
        setDeletedImages([]);
        setIsEditing(false);
    };

   
    const handleDelete = () => {
        router.delete(`/paramettrage/delete/${pharmacie.id}`, {

            onError: () => {
                toast.error("Erreur lors de la suppression");
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramétrages - Pharmacie" />

            <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto px-4 py-8">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/10">
                                    <Settings className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        Paramétrages
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        Gérez les informations et les paramètres de votre pharmacie
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} size="lg" className="gap-2">
                                        <Edit className="h-5 w-5" />
                                        Modifier
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={handleCancel} size="lg" className="gap-2">
                                            <X className="h-5 w-5" />
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            size="lg"
                                            className="gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Sauvegarde...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5" />
                                                    Sauvegarder
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Cartes de statistiques rapides */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        <QuickStatCard
                            title="Images"
                            value={stats.totalImages}
                            icon={ImageIcon}
                            color="blue"
                            delay={0.1}
                        />
                        <QuickStatCard
                            title="Logo"
                            value={stats.hasLogo ? 'Oui' : 'Non'}
                            icon={Camera}
                            color="green"
                            delay={0.2}
                        />
                        <QuickStatCard
                            title="Créée le"
                            value={stats.created}
                            icon={Calendar}
                            color="purple"
                            delay={0.3}
                        />
                        <QuickStatCard
                            title="Dernière modif"
                            value={stats.lastUpdate}
                            icon={Clock}
                            color="yellow"
                            delay={0.4}
                        />
                    </motion.div>

                    {/* Tabs principales */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 lg:w-150">
                            <TabsTrigger value="general" className="gap-2">
                                <Store className="h-4 w-4" />
                                <span className="hidden sm:inline">Général</span>
                            </TabsTrigger>
                            <TabsTrigger value="images" className="gap-2">
                                <ImageIcon className="h-4 w-4" />
                                <span className="hidden sm:inline">Images</span>
                            </TabsTrigger>
                            <TabsTrigger value="status" className="gap-2">
                                <Power className="h-4 w-4" />
                                <span className="hidden sm:inline">Statut</span>
                            </TabsTrigger>
                            <TabsTrigger value="team" className="gap-2">
                                <Users className="h-4 w-4" />
                                <span className="hidden sm:inline">Équipe</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Onglet Général */}
                        <TabsContent value="general">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informations générales</CardTitle>
                                        <CardDescription>
                                            Modifiez les informations de base de votre pharmacie
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          
                                            <div className="space-y-2">
                                                <Label htmlFor="Pharmacie" className="flex items-center gap-2">
                                                    <Store className="h-4 w-4" />
                                                    Nom de la pharmacie
                                                </Label>
                                                <Input
                                                    id="Pharmacie"
                                                    name="Pharmacie"
                                                    value={form.data.Pharmacie}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="Ex: Pharmacie Centrale"
                                                    className={!isEditing ? 'bg-muted' : ''}
                                                />
                                            </div>

                                            {/* Téléphone */}
                                            <div className="space-y-2">
                                                <Label htmlFor="Telephone" className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Téléphone
                                                </Label>
                                                <Input
                                                    id="Telephone"
                                                    name="Telephone"
                                                    value={form.data.Telephone}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="Ex: +221 77 123 45 67"
                                                    className={!isEditing ? 'bg-muted' : ''}
                                                />
                                            </div>

                                            {/* Adresse */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="Adresse" className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    Adresse
                                                </Label>
                                                <Input
                                                    id="Adresse"
                                                    name="Adresse"
                                                    value={form.data.Adresse}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="Ex: 123 Rue Principale, Dakar"
                                                    className={!isEditing ? 'bg-muted' : ''}
                                                />
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="description" className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Description
                                                </Label>
                                                <Textarea
                                                    id="description"
                                                    name="description"
                                                    value={form.data.description}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditing}
                                                    placeholder="Décrivez votre pharmacie..."
                                                    rows={4}
                                                    className={!isEditing ? 'bg-muted' : ''}
                                                />
                                            </div>
                                        </div>

                                        {/* Coordonnées (affichage seulement) */}
                                        {pharmacie.coordonnees && (
                                            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Navigation className="h-4 w-4 text-primary" />
                                                    <span className="font-medium">Coordonnées GPS:</span>
                                                    <span className="text-muted-foreground">{pharmacie.coordonnees}</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        {/* Onglet Images */}
                        <TabsContent value="images">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Logo */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Logo</CardTitle>
                                        <CardDescription>
                                            Le logo de votre pharmacie (sera affiché dans l'en-tête)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <Avatar className="h-24 w-24 border-4 border-background">
                                                    <AvatarImage src={logoPreview || ''} />
                                                    <AvatarFallback className="bg-primary/10">
                                                        <Store className="h-8 w-8 text-primary" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                {isEditing && (
                                                    <Label
                                                        htmlFor="logo-upload"
                                                        className="absolute -bottom-2 -right-2 cursor-pointer bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
                                                    >
                                                        <Camera className="h-4 w-4" />
                                                        <input
                                                            id="logo-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleLogoChange}
                                                        />
                                                    </Label>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground">
                                                    Format recommandé: 200x200px. Types acceptés: PNG, JPG, JPEG. Max: 2MB
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Galerie d'images */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Galerie d'images</CardTitle>
                                        <CardDescription>
                                            Images de votre pharmacie (intérieur, extérieur, etc.)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {galleryPreviews.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                                                {galleryPreviews.map((preview, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="relative group aspect-square rounded-lg overflow-hidden border-2 hover:border-primary transition-colors"
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`Galerie ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {isEditing && (
                                                            <button
                                                                onClick={() => handleRemoveGalleryImage(index)}
                                                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed mb-6">
                                                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                <p className="text-muted-foreground">
                                                    Aucune image dans la galerie
                                                </p>
                                            </div>
                                        )}

                                        {isEditing && (
                                            <div className="mt-4">
                                                <Label
                                                    htmlFor="gallery-upload"
                                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Ajouter des images
                                                    <input
                                                        id="gallery-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                        onChange={handleGalleryChange}
                                                    />
                                                </Label>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Types acceptés: PNG, JPG, JPEG. Max: 2MB par image
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        {/* Onglet Statut */}
                        <TabsContent value="status">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {/* Statut de la pharmacie */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Power className="h-5 w-5" />
                                            Statut de la pharmacie
                                        </CardTitle>
                                        <CardDescription>
                                            Active ou désactive l'affichage de votre pharmacie
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {statut === 'active' ? (
                                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-6 w-6 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="font-medium">
                                                        {statut === 'active' ? 'Pharmacie active' : 'Pharmacie inactive'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {statut === 'active'
                                                            ? 'Votre pharmacie est visible par les clients'
                                                            : 'Votre pharmacie est masquée'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={statut === 'active'}
                                                onCheckedChange={(checked) =>
                                                    handleStatusChange(checked ? 'active' : 'inactive')
                                                }
                                                disabled={isUpdatingStatus}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Disponibilité */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            Disponibilité
                                        </CardTitle>
                                        <CardDescription>
                                            Indiquez si votre pharmacie est ouverte
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {disponibilite === 'open' ? (
                                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-6 w-6 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="font-medium">
                                                        {disponibilite === 'open' ? 'Pharmacie ouverte' : 'Pharmacie fermée'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {disponibilite === 'open'
                                                            ? 'Vous acceptez les commandes'
                                                            : 'Vous n\'acceptez pas les commandes'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={disponibilite === 'open'}
                                                onCheckedChange={(checked) =>
                                                    handleDisponibiliteChange(checked ? 'open' : 'closed')
                                                }
                                                disabled={isUpdatingStatus}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>


                                <Card className="md:col-span-2 border-destructive/20">
                                    <CardHeader>
                                        <CardTitle className="text-destructive flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5" />
                                            Zone de danger
                                        </CardTitle>
                                        <CardDescription>
                                            Actions irréversibles sur votre pharmacie
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="gap-2">
                                                    <Trash2 className="h-4 w-4" />
                                                    Supprimer la pharmacie
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action est irréversible. Elle supprimera définitivement votre pharmacie
                                                        et toutes les données associées.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        <TabsContent value="team">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <TeamManagement
                                    pharmacie={pharmacie}
                                    users={users ?? []}
                                    roles={roles ?? []}
                                />
                            </motion.div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}


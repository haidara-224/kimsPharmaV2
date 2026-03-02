import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Package,
  Search,
  X,
  Check,
  Upload,
  Image as ImageIcon,
  Grid3x3,
  List,
  Filter,
  Plus,
  Save,
  Sparkles,
  Pill,
  Syringe,
  Tablet,

  Droplet,
  Box,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Record<number, string>; 
  existingProducts: number[];
  pharmacieId: number;
}

export function ProductManagerModal({ 
  open, 
  onOpenChange, 
  products, 
  existingProducts,
  pharmacieId 
}: ProductManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>(existingProducts);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const itemsPerPage = 12;

  // État pour le formulaire de création
  const [newProduct, setNewProduct] = useState({
    produit: '',
    categorie: '',
    sous_categorie: '',
    forme: '',
    dosage: '',
    images: [] as File[], // tableau pour plusieurs fichiers
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Transformer products en tableau pour plus de facilité
  const productsArray = useMemo(() => {
    return Object.entries(products).map(([id, name]) => ({
      id: parseInt(id),
      name: name as string
    }));
  }, [products]);

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    let filtered = productsArray;

    // Filtre de recherche
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre "sélectionnés uniquement"
    if (showSelectedOnly) {
      filtered = filtered.filter(p => selectedProducts.includes(p.id));
    }

    return filtered;
  }, [productsArray, searchTerm, showSelectedOnly, selectedProducts]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showSelectedOnly]);

  // Gérer la sélection/désélection d'un produit
  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Sélectionner/désélectionner tous les produits visibles
  const toggleAllVisible = () => {
    const visibleIds = paginatedProducts.map(p => p.id);
    const allVisibleSelected = visibleIds.every(id => selectedProducts.includes(id));

    if (allVisibleSelected) {
      setSelectedProducts(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      const newSelected = [...new Set([...selectedProducts, ...visibleIds])];
      setSelectedProducts(newSelected);
    }
  };

  // Gérer le changement d'image (plusieurs fichiers possibles)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setNewProduct(prev => ({ ...prev, images: [...prev.images, ...fileArray] }));
      const previews = fileArray.map(file => URL.createObjectURL(file));
      setImagePreview(prev => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => {
      const imgs = [...prev.images];
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
    setImagePreview(prev => {
      // revoke the URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Soumettre les produits sélectionnés (ajouts et suppressions)
const handleSubmitSelection = () => {
  // On envoie toujours la liste complète des produits sélectionnés.
  // Le backend se charge de mettre à jour l'enregistrement en conséquence,
  // y compris la suppression des produits décochés.
  setIsSubmitting(true);

  router.post('/produit/create', { products: selectedProducts }, {
    onSuccess: () => {
      toast.success("La liste des produits a été mise à jour pour votre pharmacie.");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Une erreur est survenue lors de la mise à jour.");
    },
    onFinish: () => {
      setIsSubmitting(false);
    }
  });
};
 
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.produit || !newProduct.categorie) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsCreating(true);
    
    const formData = new FormData();
    formData.append('produit', newProduct.produit);
    formData.append('categorie', newProduct.categorie);
    if (newProduct.sous_categorie) formData.append('sous_categorie', newProduct.sous_categorie);
    if (newProduct.forme) formData.append('forme', newProduct.forme);
    if (newProduct.dosage) formData.append('dosage', newProduct.dosage);
    if (newProduct.images.length > 0) {
      newProduct.images.forEach((img) => formData.append('images[]', img));
    }

    router.post('/produits/produit/create', formData, {
      onSuccess: () => {
        toast.success("Le produit a été créé avec succès.");
        setNewProduct({
          produit: '',
          categorie: '',
          sous_categorie: '',
          forme: '',
          dosage: '',
          images: [],
        });
        setImagePreview([]);
        setActiveTab('select');
      },
      onError: () => {
        toast.error("Une erreur est survenue lors de la création.");
      },
      onFinish: () => {
        setIsCreating(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-225 p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Gestion des produits
              </DialogTitle>
              <DialogDescription>
                Sélectionnez des produits existants ou créez-en de nouveaux pour votre pharmacie
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} sélectionné{selectedProducts.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select" className="gap-2">
                <Check className="h-4 w-4" />
                Sélectionner des produits
              </TabsTrigger>
              <TabsTrigger value="create" className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un nouveau produit
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="select" className="flex-1 p-6 pt-4">
            {/* Barre de recherche et filtres */}
            <div className="space-y-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                  className={showSelectedOnly ? 'bg-primary/10 border-primary' : ''}
                  title="Voir uniquement les produits sélectionnés"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
                </Button>
              </div>

              {/* Boutons d'action rapide */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllVisible}
                    className="text-xs"
                  >
                    {paginatedProducts.every(p => selectedProducts.includes(p.id))
                      ? 'Tout désélectionner'
                      : 'Tout sélectionner'
                    }
                  </Button>
                  <Badge variant="outline" className="text-xs">
                    {filteredProducts.length} produits trouvés
                  </Badge>
                </div>
              </div>
            </div>

            {/* Liste des produits */}
            <ScrollArea className="h-100 pr-4">
              <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {paginatedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.02 }}
                        className={`
                          relative p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${selectedProducts.includes(product.id)
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-transparent bg-card hover:border-muted'
                          }
                        `}
                        onClick={() => toggleProduct(product.id)}
                      >
                        <div className="absolute top-3 right-3">
                          <div className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${selectedProducts.includes(product.id)
                              ? 'border-primary bg-primary text-white'
                              : 'border-muted-foreground'
                            }
                          `}>
                            {selectedProducts.includes(product.id) && (
                              <Check className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="font-medium text-sm truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {paginatedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer
                          ${selectedProducts.includes(product.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:border-muted'
                          }
                        `}
                        onClick={() => toggleProduct(product.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                          </div>
                        </div>
                        {selectedProducts.includes(product.id) && (
                          <Badge variant="secondary" className="mr-2">
                            Sélectionné
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {paginatedProducts.length === 0 && (
                <div className="h-75 flex flex-col items-center justify-center text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Aucun produit trouvé</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm 
                      ? "Aucun produit ne correspond à votre recherche"
                      : "Vous n'avez pas encore de produits dans cette catégorie"
                    }
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="p-6 pt-4">
            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Upload d'image */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Image du produit</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex flex-wrap gap-2">
                      {imagePreview.length > 0 ? (
                        imagePreview.map((src, idx) => (
                          <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border-2">
                            <img
                              src={src}
                              alt={`Aperçu ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-1" />
                          <span className="text-xs">Aperçu</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou WEBP (max. 2MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nom du produit <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={newProduct.produit}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, produit: e.target.value }))}
                    placeholder="Ex: Paracétamol"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Catégorie <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={newProduct.categorie}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, categorie: e.target.value }))}
                    placeholder="Ex: Antalgique"
                    list="categories"
                    required
                  />
                  <datalist id="categories">
                    {PREDEFINED_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sous-catégorie</label>
                  <Input
                    value={newProduct.sous_categorie}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sous_categorie: e.target.value }))}
                    placeholder="Ex: Antipyrétique"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forme</label>
                  <Input
                    value={newProduct.forme}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, forme: e.target.value }))}
                    placeholder="Ex: Comprimé"
                    list="formes"
                  />
                  <datalist id="formes">
                    {PREDEFINED_FORMES.map(forme => (
                      <option key={forme} value={forme} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Dosage</label>
                <Input
                  value={newProduct.dosage}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="Ex: 500mg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab('select')}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className="gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Créer le produit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="p-6 pt-4 border-t bg-muted/50 flex justify-between items-center">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmitSelection}
            disabled={isSubmitting || selectedProducts.length === 0}
            className="gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Sauvegarder les produits ({selectedProducts.length})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Constantes pour les listes déroulantes
const PREDEFINED_CATEGORIES = [
  'Antalgiques',
  'Antibiotiques',
  'Anti-inflammatoires',
  'Antihistaminiques',
  'Antiviraux',
  'Antifongiques',
  'Antiparasitaires',
  'Antidiabétiques',
  'Antihypertenseurs',
  'Anticoagulants',
  'Vitamines',
  'Compléments alimentaires',
  'Dermatologie',
  'Ophtalmologie',
  'ORL',
  'Gastro-entérologie',
  'Cardiologie',
  'Neurologie',
  'Psychiatrie',
  'Pédiatrie',
];

const PREDEFINED_FORMES = [
  'Comprimé',
  'Gélule',
  'Sirop',
  'Injectable',
  'Solution buvable',
  'Pommade',
  'Crème',
  'Gel',
  'Collyre',
  'Suppositoire',
  'Inhalateur',
  'Patch',
  'Poudre',
];
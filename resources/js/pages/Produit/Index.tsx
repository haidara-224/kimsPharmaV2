import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  Search,
  Plus,
  Filter,
  Grid3x3,
  List,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

import { BreadcrumbItem, Produit } from '@/types';
import AppLayout from '@/layouts/phamacie-layout';
import { ProductManagerModal } from './ProductManagerModal';


const cleanImagePath = (path: string): string => {
  if (!path) return '';
  
  // Enlève les guillemets si présents
  let cleanPath = path.replace(/^["']|["']$/g, '');
  
  // Remplace les backslashes échappés par des slashes normaux
  cleanPath = cleanPath.replace(/\\\//g, '/').replace(/\\\\/g, '\\');
  
  // Enlève /storage/ au début si présent
  cleanPath = cleanPath.replace(/^\/?storage\//, '');
  
  // Enlève les slashs multiples
  cleanPath = cleanPath.replace(/\/+/g, '/');
  
  return cleanPath;
};


const normalizeImages = (imgs: Produit['images']): string[] => {
  if (!imgs) return [];
  
  // Si c'est déjà un tableau
  if (Array.isArray(imgs)) {
    return imgs.map(img => cleanImagePath(img));
  }

  // Si c'est une string
  if (typeof imgs === 'string') {
    try {
      // Nettoyer la string des backslashes échappés
      let cleanStr = (imgs as string)
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\\//g, '/');
      
      // Essayer de parser comme JSON
      const parsed = JSON.parse(cleanStr);
      
      if (Array.isArray(parsed)) {
        return parsed.map(img => cleanImagePath(img));
      }
      
      return [cleanImagePath(parsed)];
      
    } catch (e) {
      // Si le parse échoue, essayer d'extraire manuellement
      try {
        const matches = (imgs as string).match(/"([^"]+)"/g);
        if (matches) {
          return matches.map(m => m.replace(/"/g, '')).map(img => cleanImagePath(img));
        }
      } catch (regexError) {
        // Ignorer
      }
      
      // En dernier recours
      return [cleanImagePath(imgs as string)];
    }
  }
  
  return [];
};

/**
 * Construit l'URL complète pour une image
 */
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Nettoyer le chemin
  const cleanPath = cleanImagePath(imagePath);
  

  return `/storage/${cleanPath}`;
};


interface IndexProps {
  products: Record<number, string>;
  pharmacieProductsDetails: Produit[];
  price:number;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard'
  },
  {
    title: 'Produits',
    href: ''
  },
];



export default function Index({ products, pharmacieProductsDetails }: IndexProps) {
  const { auth } = usePage().props as any;
  const pharmacieId = auth.user.pharmacie.id;

  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // IDs des produits existants
  const existingProducts = pharmacieProductsDetails.map(p => p.id);


const existingPrices = pharmacieProductsDetails.reduce((acc: Record<number, number>, p) => {
  acc[p.id] = p.price
  return acc
}, {})

  const stats = {
    totalProducts: pharmacieProductsDetails.length,
    categories: new Set(pharmacieProductsDetails.map(p => p.categorie)).size,
    withImages: pharmacieProductsDetails.filter(p => {
      const images = normalizeImages(p.images);
      return images.length > 0;
    }).length,
    recentAdded: pharmacieProductsDetails.filter(p => {
      const date = new Date(p.created_at || '');
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length,
  };

  // Catégories uniques
  const categories = ['all', ...new Set(pharmacieProductsDetails.map(p => p.categorie))];

  // Filtrage des produits
  const filteredProducts = pharmacieProductsDetails.filter(product => {
    const matchesSearch = product.produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sous_categorie?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Gestion des Produits" />
      
      <ProductManagerModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        products={products}
        existingProducts={existingProducts}
          existingPrices={existingPrices}
        pharmacieId={pharmacieId}
      />

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
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Gestion des Produits
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      Gérez efficacement votre inventaire de produits pharmaceutiques
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsModalOpen(true)} 
                size="lg" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5" />
                Gérer les produits
              </Button>
            </div>
          </motion.div>

          {/* Statistiques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Total Produits"
              value={stats.totalProducts}
              icon={ShoppingBag}
              trend={`+${stats.recentAdded}`}
              color="blue"
              delay={0.1}
            />
            <StatCard
              title="Catégories"
              value={stats.categories}
              icon={Grid3x3}
              trend="disponibles"
              color="green"
              delay={0.2}
            />
            <StatCard
              title="Ajouts récents"
              value={stats.recentAdded}
              icon={TrendingUp}
              trend="7 jours"
              color="purple"
              delay={0.3}
            />
            <StatCard
              title="Avec images"
              value={stats.withImages}
              icon={ImageIcon}
              trend={`${Math.round((stats.withImages / stats.totalProducts) * 100)}%`}
              color="yellow"
              delay={0.4}
            />
          </motion.div>

          {/* Filtres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6 border"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher un produit par nom, catégorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.filter(c => c !== 'all').map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-10 w-10"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Résumé des filtres */}
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <span>{filteredProducts.length} produit(s) trouvé(s)</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Recherche: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-foreground">
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    Catégorie: {selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-foreground">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </motion.div>

          {/* Liste des produits */}
          <AnimatePresence mode="wait">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border"
              >
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedCategory !== 'all' 
                    ? "Aucun produit ne correspond à vos critères de recherche."
                    : "Vous n'avez pas encore de produits dans votre pharmacie."}
                </p>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter des produits
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === 'grid' ? (
                  <ProductsGrid products={paginatedProducts} />
                ) : (
                  <ProductsList products={paginatedProducts} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {filteredProducts.length > 0 && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex justify-center"
            >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// ==================== COMPOSANT STATCARD ====================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  delay: number;
}

const StatCard = ({ title, value, icon: Icon, trend, color, delay }: StatCardProps) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border"
    >
      <div className={`h-1.5 bg-gradient-to-r ${colors[color]}`} />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${colors[color]} bg-opacity-10`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <Badge variant="outline" className="bg-white/50">
            {trend}
          </Badge>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </motion.div>
  );
};

// ==================== COMPOSANT PRODUCTS GRID ====================

const ProductsGrid = ({ products }: any) => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Gestion du carousel d'images
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (hoveredProduct) {
      const product = products.find((p: Produit) => p.id === hoveredProduct);
      if (product) {
        const images = normalizeImages(product.images);
        if (images.length > 1) {
          interval = setInterval(() => {
            setCurrentImageIndex(prev => ({
              ...prev,
              [hoveredProduct]: ((prev[hoveredProduct] || 0) + 1) % images.length
            }));
          }, 1500);
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hoveredProduct, products]);

  const handleImageError = (productId: number, imagePath: string) => {
    setImageErrors(prev => ({ ...prev, [`${productId}-${imagePath}`]: true }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product: Produit, index: number) => {
        const images = normalizeImages(product.images);
        const currentIndex = currentImageIndex[product.id] || 0;
        const hasMultipleImages = images.length > 1;
        const currentImagePath = images[currentIndex];
        const hasError = currentImagePath && imageErrors[`${product.id}-${currentImagePath}`];

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            onHoverStart={() => setHoveredProduct(product.id)}
            onHoverEnd={() => {
              setHoveredProduct(null);
              setCurrentImageIndex(prev => ({ ...prev, [product.id]: 0 }));
            }}
            className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border"
          >
            {/* Container d'image */}
            <div className="relative h-48 bg-gradient-to-br from-primary/5 to-primary/10">
              {images.length > 0 && currentImagePath && !hasError ? (
                <>
                  <img
                    src={getImageUrl(currentImagePath)}
                    alt={product.produit}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => handleImageError(product.id, currentImagePath)}
                  />
                  
                  {/* Indicateur de multiples images */}
                  {hasMultipleImages && (
                    <>
                      <div className="absolute top-2 right-2 flex gap-1">
                        {images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              idx === currentIndex 
                                ? 'bg-white w-3' 
                                : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-sm gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {images.length}
                        </Badge>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon className="h-12 w-12 text-primary/30" />
                </div>
              )}
            </div>

            {/* Informations produit */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{product.produit}</h3>
                  <p className="text-sm text-muted-foreground">{product.categorie}</p>
                </div>
                <Badge variant="outline" className="text-xs ml-2 shrink-0">
                  {product.forme || 'N/A'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Dosage</p>
                  <p className="text-sm font-medium">{product.dosage || 'Non spécifié'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Prix</p>
                  <p className="text-sm font-medium text-primary">
                    {product.price > 0 ? `${product.price.toFixed(2)} GNF` : 'Non défini'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ==================== COMPOSANT PRODUCTS LIST ====================

const ProductsList = ({ products }: any) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (productId: number, imagePath: string) => {
    setImageErrors(prev => ({ ...prev, [`${productId}-${imagePath}`]: true }));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Produit
              </th>
              
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Images
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sous-catégorie
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Forme
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Dosage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {products.map((product: Produit, index: number) => {
              const images = normalizeImages(product.images);

              return (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {images.length > 0 && !imageErrors[`${product.id}-${images[0]}`] ? (
                          <img
                            src={getImageUrl(images[0])}
                            alt={product.produit}
                            className="h-10 w-10 object-cover"
                            onError={() => handleImageError(product.id, images[0])}
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium">{product.produit}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {images.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {images.slice(0, 3).map((img, idx) => (
                          <div key={idx} className="relative group/img">
                            {!imageErrors[`${product.id}-${img}`] ? (
                              <img
                                src={getImageUrl(img)}
                                alt={`${product.produit} - ${idx + 1}`}
                                className="h-8 w-8 rounded object-cover border-2 hover:border-primary transition-all"
                                onError={() => handleImageError(product.id, img)}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            {idx === 2 && images.length > 3 && (
                              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center text-white text-xs font-medium">
                                +{images.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.price > 0 ? (
                      <span className="font-medium">{product.price.toFixed(2)} GNF</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary">{product.categorie}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.sous_categorie || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.forme || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {product.dosage || '-'}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  const getVisiblePages = () => {
    if (totalPages <= 5) return pages;
    if (currentPage <= 3) return pages.slice(0, 5);
    if (currentPage >= totalPages - 2) return pages.slice(totalPages - 5);
    return pages.slice(currentPage - 3, currentPage + 2);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {visiblePages[0] > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            className="h-9 w-9"
          >
            1
          </Button>
          {visiblePages[0] > 2 && <span className="text-muted-foreground">...</span>}
        </>
      )}
      
      {visiblePages.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
          className="h-9 w-9"
        >
          {page}
        </Button>
      ))}
      
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="text-muted-foreground">...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="h-9 w-9"
          >
            {totalPages}
          </Button>
        </>
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
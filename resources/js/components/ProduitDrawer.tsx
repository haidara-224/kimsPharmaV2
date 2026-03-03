import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Edit, Package, Tag, Pill, FlaskConical, ImageIcon, FileText, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Produit } from '@/types';

interface Props {
  produit: Produit | null; open: boolean;
  onClose: () => void; onEdit: (p:Produit) => void;
}

export function ProduitDrawer({ produit: p, open, onClose, onEdit }: Props) {
  const [imgIndex, setImgIndex] = useState(0);
  if (!p) return null;
  const images = p.images ?? [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose}/>
          <motion.div
            initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}}
            transition={{type:'spring',damping:30,stiffness:300}}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-50 overflow-y-auto">

            {/* Header */}
            <div className="sticky top-0 bg-background border-b z-10 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/30">
                  <Package className="h-5 w-5 text-purple-600"/>
                </div>
                <div>
                  <h2 className="font-bold text-base leading-tight line-clamp-1">{p.produit}</h2>
                  <Badge className="bg-purple-100 text-purple-700 border-0 text-xs mt-0.5">{p.categorie}</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(p)}>
                  <Edit className="h-4 w-4"/>
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5"/>
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Galerie images */}
              <section>
                {images.length > 0 ? (
                  <div className="space-y-2">
                    <div className="relative h-56 bg-muted rounded-xl overflow-hidden">
                      <img src={`/storage/${images[imgIndex]}`} alt={p.produit}
                        className="w-full h-full object-cover"/>
                      {images.length > 1 && (
                        <>
                          <button onClick={() => setImgIndex(i => (i-1+images.length)%images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
                            <ChevronLeft className="h-4 w-4"/>
                          </button>
                          <button onClick={() => setImgIndex(i => (i+1)%images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors">
                            <ChevronRight className="h-4 w-4"/>
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_,i) => (
                              <button key={i} onClick={() => setImgIndex(i)}
                                className={`h-1.5 rounded-full transition-all ${i===imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}/>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div className="flex gap-2">
                        {images.map((img,i) => (
                          <button key={i} onClick={() => setImgIndex(i)}
                            className={`h-14 w-14 rounded-lg overflow-hidden border-2 transition-all ${i===imgIndex?'border-purple-500':'border-transparent'}`}>
                            <img src={`/storage/${img}`} alt="" className="w-full h-full object-cover"/>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-44 bg-muted/40 rounded-xl flex flex-col items-center justify-center text-muted-foreground/40">
                    <ImageIcon className="h-10 w-10 mb-2"/>
                    <p className="text-sm">Aucune image</p>
                  </div>
                )}
              </section>

              {/* Informations */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Informations</h3>
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                  {[
                    {icon:Tag,         label:'Catégorie',      value:p.categorie},
                    {icon:Tag,         label:'Sous-catégorie', value:p.sous_categorie},
                    {icon:Pill,        label:'Forme',          value:p.forme},
                    {icon:FlaskConical,label:'Dosage',         value:p.dosage},
                  ].map(({icon:Icon,label,value}) => value ? (
                    <div key={label} className="flex items-center gap-3">
                      <div className="p-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <Icon className="h-3.5 w-3.5 text-purple-600"/>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </section>

              {/* Statistiques */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Statistiques</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 text-center">
                    <FileText className="h-5 w-5 text-blue-600 mx-auto mb-1"/>
                    <p className="text-xl font-bold text-blue-600">{(p as any).ordonances_count ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Ordonnances</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 text-center">
                    <Building2 className="h-5 w-5 text-emerald-600 mx-auto mb-1"/>
                    <p className="text-xl font-bold text-emerald-600">{(p as any).pharmacies_count ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Pharmacies</p>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
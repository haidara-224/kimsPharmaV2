import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Edit, Trash2, Package, ImageIcon, Tag, Pill, FlaskConical, FileText, Building2 } from 'lucide-react';
import { Produit } from '@/types';

interface Props {
  produits: Produit[];
  onView: (p:Produit) => void;
  onEdit: (p:Produit) => void;
  onDelete: (p:Produit) => void;
}

const CAT_COLORS: Record<string,string> = {
  default: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
};
const getCatColor = (cat: string) => CAT_COLORS[cat] ?? CAT_COLORS.default;

export function ProduitsGrid({ produits, onView, onEdit, onDelete }: Props) {
  if (produits.length === 0) return (
    <div className="text-center py-16 text-muted-foreground">
      <Package className="h-12 w-12 mx-auto mb-3 opacity-20"/>
      <p>Aucun produit trouvé</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {produits.map((p, i) => (
        <motion.div key={p.id}
          initial={{opacity:0, y:16}} animate={{opacity:1, y:0}}
          transition={{delay:i*0.04}} whileHover={{y:-4, transition:{duration:0.15}}}>
          <Card className="border-0 shadow-md overflow-hidden group cursor-pointer h-full flex flex-col"
            onClick={() => onView(p)}>

            {/* Image / placeholder */}
            <div className="relative h-44 bg-linear-to-br from-purple-50 to-slate-100 dark:from-purple-950/20 dark:to-slate-800 overflow-hidden">
              {p.images && p.images.length > 0 ? (
                <>
                  <img src={`/storage/${p.images[0]}`} alt={p.produit}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  {/* Nb images */}
                  {p.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ImageIcon className="h-3 w-3"/> {p.images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40">
                  <Package className="h-12 w-12 mb-1"/>
                  <p className="text-xs">Pas d'image</p>
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md"
                  onClick={e => { e.stopPropagation(); onView(p); }}>
                  <Eye className="h-3.5 w-3.5"/>
                </Button>
                <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md"
                  onClick={e => { e.stopPropagation(); onEdit(p); }}>
                  <Edit className="h-3.5 w-3.5"/>
                </Button>
                <Button size="icon" variant="destructive" className="h-8 w-8 shadow-md"
                  onClick={e => { e.stopPropagation(); onDelete(p); }}>
                  <Trash2 className="h-3.5 w-3.5"/>
                </Button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-2">
                <Badge className={`text-xs border-0 ${getCatColor(p.categorie)}`}>{p.categorie}</Badge>
              </div>
              <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-2">{p.produit}</h3>
              {p.sous_categorie && (
                <p className="text-xs text-muted-foreground mb-2">{p.sous_categorie}</p>
              )}

              <div className="mt-auto pt-3 border-t space-y-1.5">
                {p.forme && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Pill className="h-3 w-3 text-purple-400"/>
                    <span>{p.forme}</span>
                  </div>
                )}
                {p.dosage && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FlaskConical className="h-3 w-3 text-blue-400"/>
                    <span>{p.dosage}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    {(p as any).ordonances_count !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3"/> {(p as any).ordonances_count}
                      </span>
                    )}
                    {(p as any).pharmacies_count !== undefined && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3"/> {(p as any).pharmacies_count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">#{p.id}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
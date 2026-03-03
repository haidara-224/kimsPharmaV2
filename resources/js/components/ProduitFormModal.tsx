import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, ImageIcon, Trash2, Package, Save, Loader2 } from 'lucide-react';
import { Produit } from '@/types';

interface Props {
    open: boolean; produit: Produit | null; onClose: () => void;
}

interface ImagePreview { file?: File; url: string; isExisting: boolean; path?: string; }

export function ProduitFormModal({ open, produit, onClose }: Props) {
    const isEdit = !!produit;
    const [isProcessing, setProcessing] = useState(false);
    const [form, setForm] = useState({ produit: '', categorie: '', sous_categorie: '', forme: '', dosage: '' });
    const [new_images, setImages] = useState<ImagePreview[]>([]);
    const [deletedPaths, setDeletedPaths] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setErrors({});
            setDeletedPaths([]);
            if (produit) {
                setForm({
                    produit: produit.produit ?? '',
                    categorie: produit.categorie ?? '',
                    sous_categorie: produit.sous_categorie ?? '',
                    forme: produit.forme ?? '',
                    dosage: produit.dosage ?? '',
                });
                setImages((produit.images ?? []).map(path => ({
                    url: `/storage/${path}`, isExisting: true, path,
                })));
            } else {
                setForm({ produit: '', categorie: '', sous_categorie: '', forme: '', dosage: '' });
                setImages([]);
            }
        }
    }, [open, produit]);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        const remaining = 4 - new_images.length;
        if (remaining <= 0) { toast.error('Maximum 4 images autorisées'); return; }
        const toAdd = Array.from(files).slice(0, remaining);
        const previews: ImagePreview[] = toAdd.map(file => ({
            file, url: URL.createObjectURL(file), isExisting: false,
        }));
        setImages(prev => [...prev, ...previews]);
    };

    const removeImage = (index: number) => {
        const img = new_images[index];
        if (img.isExisting && img.path) setDeletedPaths(prev => [...prev, img.path!]);
        if (!img.isExisting && img.url) URL.revokeObjectURL(img.url);
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const newErrors: Record<string, string> = {};
        if (!form.produit.trim()) newErrors.produit = 'Nom requis';
        if (!form.categorie.trim()) newErrors.categorie = 'Catégorie requise';
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

        setProcessing(true);
        const data = new FormData();
        Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });

        // Nouvelles images
        new_images.filter(img => !img.isExisting && img.file).forEach(img => {
           data.append('new_images[]', img.file!)
        });
        // Images supprimées (pour l'edit)
        deletedPaths.forEach(path => data.append('deleted_images[]', path));
if (isEdit) {
  data.append('_method', 'PUT');

  router.post(
    `/dashboard/Administration/Dashboard/produits/${produit!.id}`,
    data,
    {
      forceFormData: true,
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => { 
        toast.success('Produit modifié'); 
        onClose(); 
      },
      onError: (e: any) => { 
        setErrors(e as any); 
        toast.error('Erreur de validation'); 
      },
      onFinish: () => setProcessing(false),
    }
  );
} else {
            router.post(
                `/dashboard/Administration/Dashboard/produits`,
                data,
                {
                    forceFormData: true,
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Produit créé');
                        onClose();
                    },
                    onError: (e: any) => {
                        setErrors(e as any);
                        toast.error('Erreur de validation');
                    },
                    onFinish: () => setProcessing(false),
                }
            );
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-background rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b bg-linear-to-r from-purple-600 to-purple-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white text-lg">
                                        {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
                                    </h2>
                                    <p className="text-white/70 text-xs mt-0.5">
                                        {isEdit ? `Édition de ${produit!.produit}` : 'Remplissez les informations'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}
                                className="text-white hover:bg-white/20 h-8 w-8">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto p-6 space-y-5 flex-1">

                            {/* Nom + Catégorie */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                                        Nom du produit *
                                    </Label>
                                    <Input value={form.produit} onChange={e => setForm(f => ({ ...f, produit: e.target.value }))}
                                        placeholder="ex: Paracétamol" className={errors.produit ? 'border-red-400' : ''} />
                                    {errors.produit && <p className="text-xs text-red-500 mt-1">{errors.produit}</p>}
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                                        Catégorie *
                                    </Label>
                                    <Input value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
                                        placeholder="ex: Analgésique" className={errors.categorie ? 'border-red-400' : ''} />
                                    {errors.categorie && <p className="text-xs text-red-500 mt-1">{errors.categorie}</p>}
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                                        Sous-catégorie
                                    </Label>
                                    <Input value={form.sous_categorie} onChange={e => setForm(f => ({ ...f, sous_categorie: e.target.value }))}
                                        placeholder="ex: Anti-douleur" />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                                        Forme
                                    </Label>
                                    <Input value={form.forme} onChange={e => setForm(f => ({ ...f, forme: e.target.value }))}
                                        placeholder="ex: Comprimé, Sirop…" />
                                </div>
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                                        Dosage
                                    </Label>
                                    <Input value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                                        placeholder="ex: 500mg, 250ml…" />
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Images ({new_images.length}/4)
                                    </Label>
                                    {new_images.length < 4 && (
                                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs"
                                            onClick={() => fileRef.current?.click()}>
                                            <Upload className="h-3 w-3" /> Ajouter
                                        </Button>
                                    )}
                                </div>

                                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                                    onChange={e => handleFiles(e.target.files)} />

                                {new_images.length === 0 ? (
                                    <button onClick={() => fileRef.current?.click()}
                                        className="w-full h-32 border-2 border-dashed border-muted-foreground/25 hover:border-purple-400 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-purple-600">
                                        <ImageIcon className="h-8 w-8" />
                                        <p className="text-sm">Cliquer pour ajouter des images</p>
                                        <p className="text-xs opacity-60">JPG, PNG, WEBP — max 2Mo — max 4 images</p>
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-4 gap-2">
                                        {new_images.map((img, i) => (
                                            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
                                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                                    <button onClick={() => removeImage(i)}
                                                        className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                {img.isExisting && (
                                                    <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                        actuel
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {new_images.length < 4 && (
                                            <button onClick={() => fileRef.current?.click()}
                                                className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-purple-400 flex items-center justify-center text-muted-foreground hover:text-purple-600 transition-colors">
                                                <Upload className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t bg-muted/20 flex justify-end gap-3">
                            <Button variant="outline" onClick={onClose} disabled={isProcessing}>Annuler</Button>
                            <Button onClick={handleSubmit} disabled={isProcessing}
                                className="gap-2 bg-purple-600 hover:bg-purple-700 min-w-30">
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isProcessing ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Créer'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
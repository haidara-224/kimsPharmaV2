import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';
import { Produit } from '@/types';

interface Props {
  produit: Produit | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function DeleteProduitDialog({ produit, open, onOpenChange, onConfirm, isProcessing }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => {
      // Empêcher la fermeture pendant le traitement
      if (isProcessing) return;
      onOpenChange(v);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" /> Supprimer le produit
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <span>Vous allez supprimer </span>
              <strong>{produit?.produit}</strong>.
              {produit?.images && produit.images.length > 0 && (
                <span className="block mt-1 text-amber-600">
                  ⚠ {produit.images.length} image{produit.images.length > 1 ? 's' : ''} sera
                  {produit.images.length > 1 ? 'ont' : ''} également supprimée
                  {produit.images.length > 1 ? 's' : ''}.
                </span>
              )}
              <span className="block mt-1 text-muted-foreground">
                Cette action est irréversible.
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isProcessing}
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // empêcher la fermeture auto du AlertDialog
              onConfirm();
            }}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 gap-2"
          >
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Suppression…</>
              : <><Trash2 className="h-4 w-4" /> Supprimer</>
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
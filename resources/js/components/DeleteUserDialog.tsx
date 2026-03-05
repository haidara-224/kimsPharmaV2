import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { User } from '@/types';

interface Props {
  user: User | null; open: boolean;
  onOpenChange: (v:boolean) => void;
  onConfirm: () => void; isProcessing: boolean;
}

export function DeleteUserDialog({ user, open, onOpenChange, onConfirm, isProcessing }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={v => { if (!isProcessing) onOpenChange(v); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5"/> Supprimer l'utilisateur
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>Vous allez supprimer le compte de <strong>{user?.nom}</strong> ({user?.email}).</p>
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg p-3 mt-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5"/>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Toutes les données liées à ce compte seront définitivement perdues.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={e => { e.preventDefault(); onConfirm(); }}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 gap-2">
            {isProcessing
              ? <><Loader2 className="h-4 w-4 animate-spin"/> Suppression…</>
              : <><Trash2 className="h-4 w-4"/> Supprimer définitivement</>
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
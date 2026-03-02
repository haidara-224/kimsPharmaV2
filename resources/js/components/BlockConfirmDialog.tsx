import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Pharmacie } from '@/types';
import { Ban, Unlock, Loader2 } from 'lucide-react';

interface BlockConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacie: Pharmacie | null;
  onConfirm: () => void;
  isProcessing: boolean;
}

export function BlockConfirmDialog({
  open,
  onOpenChange,
  pharmacie,
  onConfirm,
  isProcessing,
}: BlockConfirmDialogProps) {
  const isBlocking = pharmacie?.is_blocked === false;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className={`flex items-center gap-2 ${isBlocking ? 'text-orange-600' : 'text-green-600'}`}>
            {isBlocking ? <Ban className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
            {isBlocking ? 'Confirmer le blocage' : 'Confirmer le déblocage'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              {isBlocking ? (
                <>
                  Êtes-vous sûr de vouloir bloquer la pharmacie{' '}
                  <span className="font-semibold">{pharmacie?.name}</span> ?
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir débloquer la pharmacie{' '}
                  <span className="font-semibold">{pharmacie?.name}</span> ?
                </>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {isBlocking
                ? "Une pharmacie bloquée ne peut plus se connecter ni recevoir de commandes."
                : "La pharmacie pourra à nouveau se connecter et recevoir des commandes."}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
          <Button
            variant={isBlocking ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isBlocking ? 'Blocage...' : 'Déblocage...'}
              </>
            ) : (
              isBlocking ? 'Bloquer' : 'Débloquer'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
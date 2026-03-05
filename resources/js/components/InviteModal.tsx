import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Shield, Send, Loader2, Mail, User } from 'lucide-react';

export function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm]         = useState({ name:'', email:'' });
  const [errors, setErrors]     = useState<Record<string,string>>({});
  const [isProcessing, setProcessing] = useState(false);

 const handleSubmit = () => {
  const errs: Record<string,string> = {};

  if (!form.name.trim())  errs.name  = 'Nom requis';
  if (!form.email.trim()) errs.email = 'Email requis';
  else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';

  if (Object.keys(errs).length) { 
    setErrors(errs); 
    return; 
  }

  setProcessing(true);

  router.post('/dashboard/Administration/Dashboard/invite/', form, {
    preserveState: true,
    preserveScroll: true,

    onSuccess: () => {
      toast.success('Invitation envoyée avec succès');
      setForm({ name:'', email:'' });
      setErrors({});
      onClose();
    },

    onError: (e: any) => {
      setErrors(e as any);
      toast.error("Erreur lors de l'invitation");
    },

    onFinish: () => setProcessing(false),
  });
};

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}/>

          <motion.div
            initial={{opacity:0,scale:0.95,y:20}}
            animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:0.95,y:20}}
            transition={{type:'spring',damping:30,stiffness:300}}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-linear-to-r from-indigo-600 to-indigo-500 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <Shield className="h-6 w-6 text-white"/>
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">Inviter un Super Admin</h2>
                  <p className="text-white/70 text-sm mt-0.5">
                    Un compte sera créé avec les droits admin
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}
                className="text-white hover:bg-white/20 h-8 w-8">
                <X className="h-5 w-5"/>
              </Button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Info box */}
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                  Si l'email existe déjà, le rôle Super Admin lui sera attribué. Sinon, un nouveau compte sera créé avec un mot de passe aléatoire.
                </p>
              </div>

              {/* Champ Nom */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Nom complet
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({...f, name:e.target.value}))}
                    placeholder="Jean Dupont"
                    className={`pl-10 ${errors.name ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Champ Email */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Adresse email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({...f, email:e.target.value}))}
                    placeholder="admin@exemple.com"
                    className={`pl-10 ${errors.email ? 'border-red-400' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={isProcessing}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 min-w-32.5">
                {isProcessing
                  ? <><Loader2 className="h-4 w-4 animate-spin"/> Envoi…</>
                  : <><Send className="h-4 w-4"/> Envoyer l'invitation</>
                }
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
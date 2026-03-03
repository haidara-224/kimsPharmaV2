import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  X, FileText, User, Building2, Truck, Package,
  Calendar, MessageSquare, CheckCircle2, XCircle,
  Clock, FilePlus, CreditCard, MapPin,
} from 'lucide-react';
import { Ordonnance } from '@/types';

interface Props {
  ordonnance: Ordonnance | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (o: Ordonnance, s: string) => void;
  isProcessing: boolean;
}

const STATUS_CFG: Record<string,{label:string;color:string;bg:string;icon:any}> = {
  pending:   {label:'En attente', color:'text-amber-600',   bg:'bg-amber-100',   icon:Clock       },
  processed: {label:'Traitée',    color:'text-emerald-600', bg:'bg-emerald-100', icon:CheckCircle2},
  rejected:  {label:'Rejetée',    color:'text-red-600',     bg:'bg-red-100',     icon:XCircle     },
  to_create: {label:'À créer',    color:'text-blue-600',    bg:'bg-blue-100',    icon:FilePlus    },
  comment:   {label:'Commentée',  color:'text-purple-600',  bg:'bg-purple-100',  icon:MessageSquare},
};

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', {maximumFractionDigits:0}).format(n);

export function OrdonnanceDrawer({ ordonnance: o, open, onClose, onStatusChange, isProcessing }: Props) {
  if (!o) return null;
  const st = STATUS_CFG[o.status] ?? STATUS_CFG.pending;
  const StIcon = st.icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose} />

          {/* Drawer */}
          <motion.div
            initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
            transition={{ type:'spring', damping:30, stiffness:300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b z-10 p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${st.bg}`}>
                  <StIcon className={`h-5 w-5 ${st.color}`} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{o.numero}</h2>
                  <Badge className={`border-0 ${st.bg} ${st.color} text-xs mt-0.5`}>
                    {st.label}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
            </div>

            <div className="p-5 space-y-6">

              {/* Patient */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" /> Patient
                </h3>
                <div className="bg-muted/30 rounded-xl p-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Nom complet</p>
                    <p className="font-semibold mt-0.5">{o.patient}</p>
                  </div>
                  {o.age_patient && (
                    <div>
                      <p className="text-xs text-muted-foreground">Âge</p>
                      <p className="font-semibold mt-0.5">{o.age_patient} ans</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Prescrit par</p>
                    <p className="font-semibold mt-0.5">{o.user?.nom ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date ord.</p>
                    <p className="font-semibold mt-0.5">
                      {o.date_ord ? new Date(o.date_ord).toLocaleDateString('fr-FR') : '—'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Pharmacie */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" /> Pharmacie
                </h3>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="font-semibold">{o.pharmacie?.name ?? '—'}</p>
                  {o.pharmacie?.adresse && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{o.pharmacie.adresse}
                    </p>
                  )}
                  {o.pharmacie?.tel && (
                    <p className="text-sm text-muted-foreground mt-1">📞 {o.pharmacie.tel}</p>
                  )}
                </div>
              </section>

              {/* Livraison */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" /> Livraison
                </h3>
                <div className="bg-muted/30 rounded-xl p-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Mode</p>
                    <p className="font-semibold mt-0.5">{o.statut_livraison}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Frais</p>
                    <p className="font-semibold mt-0.5">
                      {o.frais_livraison ? fmt(Number(o.frais_livraison)) + ' GNF' : 'Gratuit'}
                    </p>
                  </div>
                  {o.coordonees_livraison && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">Coordonnées</p>
                      <p className="font-mono text-sm mt-0.5">{o.coordonees_livraison}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Montant */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5" /> Facturation
                </h3>
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sous-total produits</span>
                    <span className="font-medium">{fmt(Number(o.total) - Number(o.frais_livraison ?? 0))} GNF</span>
                  </div>
                  {o.frais_livraison && Number(o.frais_livraison) > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Frais de livraison</span>
                      <span className="font-medium">{fmt(Number(o.frais_livraison))} GNF</span>
                    </div>
                  )}
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg text-primary">{fmt(Number(o.total))} GNF</span>
                  </div>
                </div>
              </section>

              {/* Commentaire / Feedback */}
              {(o.commentaire || o.feedback) && (
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" /> Notes
                  </h3>
                  <div className="space-y-2">
                    {o.commentaire && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3">
                        <p className="text-xs text-amber-600 font-medium mb-1">Commentaire</p>
                        <p className="text-sm">{o.commentaire}</p>
                      </div>
                    )}
                    {o.feedback && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3">
                        <p className="text-xs text-blue-600 font-medium mb-1">Feedback</p>
                        <p className="text-sm">{o.feedback}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Actions statut */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Changer le statut
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                    const Ic = cfg.icon;
                    return (
                      <Button key={key} variant="outline" size="sm"
                        disabled={o.status === key || isProcessing}
                        onClick={() => onStatusChange(o, key)}
                        className={`gap-2 justify-start ${o.status===key ? `${cfg.bg} ${cfg.color} border-transparent` : ''}`}>
                        <Ic className={`h-4 w-4 ${cfg.color}`} />
                        <span className={o.status===key ? cfg.color : ''}>{cfg.label}</span>
                        {o.status===key && <span className="ml-auto text-xs opacity-60">actuel</span>}
                      </Button>
                    );
                  })}
                </div>
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
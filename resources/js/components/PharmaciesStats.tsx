import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Building2, CheckCircle2, XCircle, Clock, Ban, DoorOpen } from 'lucide-react';
import { Pharmacie } from '@/types';

export function PharmaciesStats({ pharmacies }: { pharmacies: Pharmacie[] }) {
  const total    = pharmacies.length;
  const actives  = pharmacies.filter(p => p.statut === 'active').length;
  const ouvertes = pharmacies.filter(p => p.disponibilite === 'open').length;
  const bloquees = pharmacies.filter(p => p.is_blocked).length;
  const inactives = pharmacies.filter(p => p.statut === 'inactive').length;

  const stats = [
    { label: 'Total',     value: total,    icon: Building2,    color: 'from-primary to-primary/70',   bg: 'bg-primary/10',                   text: 'text-primary',    pct: 100 },
    { label: 'Actives',   value: actives,  icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600', pct: Math.round((actives / (total || 1)) * 100) },
    { label: 'Ouvertes',  value: ouvertes, icon: DoorOpen,     color: 'from-blue-500 to-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/20',   text: 'text-blue-600',   pct: Math.round((ouvertes / (total || 1)) * 100) },
    { label: 'Inactives', value: inactives,icon: XCircle,      color: 'from-slate-400 to-slate-500',  bg: 'bg-slate-50 dark:bg-slate-800',    text: 'text-slate-500',  pct: Math.round((inactives / (total || 1)) * 100) },
    { label: 'Bloquées',  value: bloquees, icon: Ban,          color: 'from-red-500 to-red-600',      bg: 'bg-red-50 dark:bg-red-950/20',     text: 'text-red-600',    pct: Math.round((bloquees / (total || 1)) * 100) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
    >
      {stats.map((s, i) => (
        <motion.div key={s.label}
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
          <Card className="overflow-hidden border-0 shadow-md">
            <div className={`h-1 bg-gradient-to-r ${s.color}`} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-5 w-5 ${s.text}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{s.pct}%</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div className={`h-full bg-gradient-to-r ${s.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { FileText, Clock, CheckCircle2, XCircle, FilePlus, MessageSquare, TrendingUp, Banknote } from 'lucide-react';

interface Stats {
  total:number; pending:number; processed:number; rejected:number;
  to_create:number; comment:number; ca_total:number; ca_mois:number;
  en_pharmacie:number; livraison_express:number; livraison_standard:number; livraison_gratuite:number;
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits:0 }).format(n);

export function OrdonnancesStats({ stats }: { stats: Stats }) {
  const cards = [
    { label:'Total',      value: stats.total,     icon:FileText,      color:'from-slate-500 to-slate-600',   bg:'bg-slate-50 dark:bg-slate-800',          text:'text-slate-600',   pct:100 },
    { label:'En attente', value: stats.pending,    icon:Clock,         color:'from-amber-500 to-amber-600',   bg:'bg-amber-50 dark:bg-amber-950/20',        text:'text-amber-600',   pct:Math.round((stats.pending/(stats.total||1))*100) },
    { label:'Traitées',   value: stats.processed,  icon:CheckCircle2,  color:'from-emerald-500 to-emerald-600',bg:'bg-emerald-50 dark:bg-emerald-950/20',   text:'text-emerald-600', pct:Math.round((stats.processed/(stats.total||1))*100) },
    { label:'Rejetées',   value: stats.rejected,   icon:XCircle,       color:'from-red-500 to-red-600',       bg:'bg-red-50 dark:bg-red-950/20',            text:'text-red-600',     pct:Math.round((stats.rejected/(stats.total||1))*100) },
    { label:'À créer',    value: stats.to_create,  icon:FilePlus,      color:'from-blue-500 to-blue-600',     bg:'bg-blue-50 dark:bg-blue-950/20',          text:'text-blue-600',    pct:Math.round((stats.to_create/(stats.total||1))*100) },
    { label:'Commentées', value: stats.comment,    icon:MessageSquare, color:'from-purple-500 to-purple-600', bg:'bg-purple-50 dark:bg-purple-950/20',      text:'text-purple-600',  pct:Math.round((stats.comment/(stats.total||1))*100) },
    { label:'CA total',   value: fmt(stats.ca_total) + ' GNF', icon:Banknote, color:'from-indigo-500 to-indigo-600', bg:'bg-indigo-50 dark:bg-indigo-950/20', text:'text-indigo-600', pct:null },
    { label:'CA ce mois', value: fmt(stats.ca_mois) + ' GNF',  icon:TrendingUp, color:'from-teal-500 to-teal-600',  bg:'bg-teal-50 dark:bg-teal-950/20',    text:'text-teal-600',   pct:null },
  ];

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
      className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((c, i) => (
        <motion.div key={c.label}
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
          transition={{ delay: i*0.05 }} whileHover={{ y:-3, transition:{duration:0.15} }}>
          <Card className="overflow-hidden border-0 shadow-md">
            <div className={`h-1 bg-gradient-to-r ${c.color}`} />
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${c.bg}`}>
                  <c.icon className={`h-4 w-4 ${c.text}`} />
                </div>
                {c.pct !== null && (
                  <span className="text-xs text-muted-foreground font-medium">{c.pct}%</span>
                )}
              </div>
              <p className="text-lg font-bold leading-tight">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
              {c.pct !== null && (
                <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div className={`h-full bg-gradient-to-r ${c.color} rounded-full`}
                    initial={{ width:0 }} animate={{ width:`${c.pct}%` }}
                    transition={{ duration:0.8, delay:0.3+i*0.05 }} />
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
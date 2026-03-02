import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Truck, Building2 } from 'lucide-react';

interface StatusDonutCardsProps {
  ordonnancesStats: {
    processed: number; pending: number; rejected: number;
    to_create: number; comment: number;
  };
  livraisonsStats: {
    en_pharmacie: number; livraison_gratuite: number;
    livraison_express: number; livraison_standard: number;
  };
  pharmaciesStats: {
    active: number; inactive: number;
    open: number; closed: number; blocked: number;
  };
}

const TooltipContent = ({ active, payload }: any) =>
  active && payload?.length ? (
    <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value}</p>
    </div>
  ) : null;

function DonutCard({
  title, icon: Icon, data, accent,
}: {
  title: string; icon: any;
  data: { name: string; value: number; color: string }[];
  accent: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${accent}`} />
      <CardHeader className="pb-0 pt-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-[120px] w-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={34} outerRadius={52}
                  paddingAngle={3} dataKey="value">
                  {data.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<TooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <div className="text-xs text-right shrink-0">
                  <span className="font-bold">{item.value}</span>
                  <span className="text-muted-foreground ml-1">
                    ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1.5 border-t">
              Total : <strong>{total}</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusDonutCards({
  ordonnancesStats, livraisonsStats, pharmaciesStats,
}: StatusDonutCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Statuts ordonnances */}
      <DonutCard
        title="Statut des ordonnances"
        icon={FileText}
        accent="from-green-500 to-green-600"
        data={[
          { name: 'Traitées',    value: ordonnancesStats.processed, color: '#22c55e' },
          { name: 'En attente',  value: ordonnancesStats.pending,   color: '#f59e0b' },
          { name: 'Rejetées',    value: ordonnancesStats.rejected,  color: '#ef4444' },
          { name: 'À créer',     value: ordonnancesStats.to_create, color: '#3b82f6' },
          { name: 'Commentaire', value: ordonnancesStats.comment,   color: '#a855f7' },
        ]}
      />

      {/* Mode de livraison */}
      <DonutCard
        title="Mode de livraison"
        icon={Truck}
        accent="from-sky-500 to-sky-600"
        data={[
          { name: 'En Pharmacie',     value: livraisonsStats.en_pharmacie,       color: '#0ea5e9' },
          { name: 'Gratuite',         value: livraisonsStats.livraison_gratuite,  color: '#22c55e' },
          { name: 'Express',          value: livraisonsStats.livraison_express,   color: '#f59e0b' },
          { name: 'Standard',         value: livraisonsStats.livraison_standard,  color: '#a855f7' },
        ]}
      />

      {/* Statuts pharmacies */}
      <DonutCard
        title="Statut des pharmacies"
        icon={Building2}
        accent="from-blue-500 to-blue-600"
        data={[
          { name: 'Actives & ouvertes', value: pharmaciesStats.open,     color: '#22c55e' },
          { name: 'Fermées',            value: pharmaciesStats.closed,   color: '#94a3b8' },
          { name: 'Inactives',          value: pharmaciesStats.inactive, color: '#f59e0b' },
          { name: 'Bloquées',           value: pharmaciesStats.blocked,  color: '#ef4444' },
        ]}
      />
    </motion.div>
  );
}
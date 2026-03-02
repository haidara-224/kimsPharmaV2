import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Medal } from 'lucide-react';

interface Props {
  pharmacies: {
    id: number; nom: string; adresse: string;
    statut: string; disponibilite: string; count: number;
  }[];
}

const medals = ['text-yellow-500','text-slate-400','text-amber-600','text-slate-400','text-slate-400'];

export function TopPharmaciesCard({ pharmacies }: Props) {
  const max = pharmacies[0]?.count || 1;

  const statutStyle = (s: string) => ({
    'Active':    'border-green-400 text-green-600',
    'Inactive':  'border-yellow-400 text-yellow-600',
    'Bloquée':   'border-red-400 text-red-500',
  }[s] ?? 'border-slate-300 text-slate-500');

  const dispoStyle = (d: string) => d === 'open'
    ? 'border-emerald-400 text-emerald-600'
    : 'border-slate-300 text-slate-400';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="border-0 shadow-lg h-full">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Top pharmacies
          </CardTitle>
          <CardDescription>Par volume d'ordonnances traitées</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {pharmacies.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
          )}
          {pharmacies.map((p, i) => (
            <div key={p.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Medal className={`h-4 w-4 shrink-0 ${medals[i]}`} />
                  <span className="text-sm font-medium truncate">{p.nom}</span>
                  <Badge variant="outline" className={`text-xs shrink-0 ${statutStyle(p.statut)}`}>
                    {p.statut}
                  </Badge>
                  <Badge variant="outline" className={`text-xs shrink-0 ${dispoStyle(p.disponibilite)}`}>
                    {p.disponibilite === 'open' ? 'Ouvert' : 'Fermé'}
                  </Badge>
                </div>
                <span className="text-sm font-bold tabular-nums shrink-0">{p.count} ord.</span>
              </div>
              <p className="text-xs text-muted-foreground pl-6 truncate">{p.adresse}</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((p.count / max) * 100)}%` }}
                  transition={{ duration: 0.9, delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
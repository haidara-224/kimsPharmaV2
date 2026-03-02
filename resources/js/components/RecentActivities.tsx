import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Building2, FileText, Clock, ArrowRight, CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

interface Activity {
  id: number; type: string; action: string;
  name: string; time: string; status: string; total?: number;
}

const statusCfg = {
  success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20' },
  warning: { icon: AlertCircle,  color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  error:   { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950/20' },
  info:    { icon: Info,         color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/20' },
} as const;

const typeIcon: Record<string, any> = { pharmacie: Building2, ordonnance: FileText };

export function RecentActivities({ activities }: { activities: Activity[] }) {
  return (
    <Card className="border-0 shadow-lg h-full">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Activités récentes
            </CardTitle>
            <CardDescription>Dernières actions sur la plateforme</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-6 space-y-2">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune activité récente</p>
            )}
            {activities.map((a, i) => {
              const cfg = statusCfg[a.status as keyof typeof statusCfg] ?? statusCfg.info;
              const StatusIcon = cfg.icon;
              const TypeIcon = typeIcon[a.type] ?? Clock;
              return (
                <motion.div
                  key={`${a.type}-${a.id}`}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${cfg.bg} shrink-0`}>
                    <TypeIcon className={`h-4 w-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-medium">{a.action}</p>
                      <Badge variant="outline" className="text-xs">{a.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{a.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`h-3 w-3 ${cfg.color}`} />
                        <span className="text-xs text-muted-foreground">{a.time}</span>
                      </div>
                      {a.total != null && a.total > 0 && (
                        <span className="text-xs font-semibold text-amber-600">
                          {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(a.total)} GNF
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
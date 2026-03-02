import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  Building2, 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  Package
} from 'lucide-react';
import { Pharmacie } from '@/types';

interface PharmaciesStatsProps {
  pharmacies: Pharmacie[];
}

export function PharmaciesStats({ pharmacies }: PharmaciesStatsProps) {
  const stats = {
    total: pharmacies.length,
    actives: pharmacies.filter(p => p.statut === 'active').length,
    inactives: pharmacies.filter(p => p.statut === 'inactive').length,
    ouvertes: pharmacies.filter(p => p.disponibilite === 'open').length,
    fermees: pharmacies.filter(p => p.disponibilite === 'closed').length,
    bloquees: pharmacies.filter(p => p.is_blocked).length,
 
  };

  const statCards = [
    {
      title: 'Pharmacies actives',
      value: stats.actives,
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      textColor: 'text-green-600 dark:text-green-400',
      percentage: Math.round((stats.actives / stats.total) * 100) || 0,
    },
    {
      title: 'Pharmacies inactives',
      value: stats.inactives,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      textColor: 'text-red-600 dark:text-red-400',
      percentage: Math.round((stats.inactives / stats.total) * 100) || 0,
    },
    {
      title: 'Pharmacies ouvertes',
      value: stats.ouvertes,
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      percentage: Math.round((stats.ouvertes / stats.total) * 100) || 0,
    },
    {
      title: 'Pharmacies bloquées',
      value: stats.bloquees,
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      percentage: Math.round((stats.bloquees / stats.total) * 100) || 0,
    },

    {
      title: 'Total',
      value: stats.total,
      icon: Building2,
      color: 'from-primary to-primary/60',
      bgColor: 'bg-primary/10',
      textColor: 'text-primary',
      percentage: 100,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -4 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                {stat.percentage !== undefined && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {stat.percentage}%
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{stat.value.toLocaleString()}</h3>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
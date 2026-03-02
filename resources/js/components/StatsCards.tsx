import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Building2, FileText, Package, TrendingUp, TrendingDown, Minus, Euro } from 'lucide-react';

interface StatsCardsProps {
  pharmacies:  number;
  ordonnances: number;
  produits:    number;
  chiffreAffaires: number;
  caThisMonth:     number;
  caLastMonth:     number;
  growthStats: { pharmacies: number; ordonnances: number; produits: number };
}

const GrowthBadge = ({ value }: { value: number | null }) => {
  if (value === null) return null;
  if (value > 0) return (
    <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
      <TrendingUp className="h-3 w-3" /> +{value}%
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-1 text-xs text-red-500 font-semibold">
      <TrendingDown className="h-3 w-3" /> {value}%
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
};

export function StatsCards({
  pharmacies, ordonnances, produits,
  chiffreAffaires, caThisMonth, caLastMonth,
  growthStats,
}: StatsCardsProps) {

  const caGrowth = caLastMonth > 0
    ? Math.round(((caThisMonth - caLastMonth) / caLastMonth) * 100)
    : (caThisMonth > 0 ? 100 : 0);

  const stats = [
    {
      title: 'Pharmacies',
      value: pharmacies.toLocaleString('fr-FR'),
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      textColor: 'text-blue-600',
      growth: growthStats.pharmacies,
      desc: 'établissements enregistrés',
    },
    {
      title: 'Ordonnances',
      value: ordonnances.toLocaleString('fr-FR'),
      icon: FileText,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      textColor: 'text-green-600',
      growth: growthStats.ordonnances,
      desc: 'prescriptions traitées',
    },
    {
      title: 'Produits',
      value: produits.toLocaleString('fr-FR'),
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      textColor: 'text-purple-600',
      growth: growthStats.produits,
      desc: 'médicaments référencés',
    },
    {
      title: 'Chiffre d\'affaires',
      value: new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'GNF', maximumFractionDigits: 0 }).format(chiffreAffaires),
      icon: Euro,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      textColor: 'text-amber-600',
      growth: caGrowth,
      desc: 'ordonnances approuvées',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className={`h-1.5 bg-gradient-to-r ${stat.color}`} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <GrowthBadge value={stat.growth} />
              </div>
              <p className="text-2xl font-bold leading-tight">{stat.value}</p>
              <p className="text-sm font-medium mt-1">{stat.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
              <p className="text-xs text-muted-foreground mt-2 italic">vs mois précédent</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
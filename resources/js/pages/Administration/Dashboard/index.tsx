import { motion } from 'framer-motion';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from "@/layouts/app-layout";
import { WelcomeHeader }      from '@/components/WelcomeHeader';
import { StatsCards }         from '@/components/StatsCards';
import { ChartsSection }      from '@/components/ChartsSection';
import { RecentActivities }   from '@/components/RecentActivities';
import { QuickActions }       from '@/components/QuickActions';
import { StatusDonutCards }   from '@/components/StatusDonutCards';
import { TopPharmaciesCard }  from '@/components/TopPharmaciesCard';
import { CategoriesCard }     from '@/components/CategoriesCard';
import { WeeklyActivityCard } from '@/components/WeeklyActivityCard';

// ── Types alignés sur les migrations ────────────────────────────────────────

/** status: enum(['pending','processed','rejected','to_create','comment']) */
interface OrdonnancesStats {
  processed: number;
  pending:   number;
  rejected:  number;
  to_create: number;
  comment:   number;
}

/** statut_livraison: enum(['En Pharmacie','Livraison Gratuite','Livraison express','Livraison Standard']) */
interface LivraisonsStats {
  en_pharmacie:       number;
  livraison_gratuite: number;
  livraison_express:  number;
  livraison_standard: number;
}

/** statut: enum(['active','inactive']) | disponibilite: enum(['open','closed']) | is_blocked: bool */
interface PharmaciesStats {
  active:   number;  // statut = active AND is_blocked = false
  inactive: number;  // statut = inactive
  open:     number;  // disponibilite = open
  closed:   number;  // disponibilite = closed
  blocked:  number;  // is_blocked = true
}

interface TopPharmacie {
  id:            number;
  nom:           string;  // name en BDD, renommé côté PHP
  adresse:       string;
  statut:        'Active' | 'Inactive' | 'Bloquée';  // calculé côté PHP
  disponibilite: 'open' | 'closed';
  count:         number;
}

interface Activity {
  id:     number;
  type:   'pharmacie' | 'ordonnance';
  action: string;
  name:   string;
  time:   string;
  status: 'success' | 'error' | 'warning' | 'info';  // normalisé côté PHP
  total?: number;
}

interface DashboardProps {
  pharmacies:      number;
  ordonnances:     number;
  produits:        number;
  chiffreAffaires: number;
  caThisMonth:     number;
  caLastMonth:     number;
  growthStats: {
    pharmacies:  number;
    ordonnances: number;
    produits:    number;
  };
  monthlyStats: {
    pharmacies:  Record<string, number>;  // clé YYYY-MM
    ordonnances: Record<string, number>;
    produits:    Record<string, number>;
  };
  ordonnancesStats: OrdonnancesStats;
  livraisonsStats:  LivraisonsStats;
  pharmaciesStats:  PharmaciesStats;
  topPharmacies:    TopPharmacie[];
  recentActivities: Activity[];
  weeklyData:       { day: string; ordonnances: number; pharmacies: number; ca: number }[];
  categoriesStats:  { name: string; value: number }[];
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function Dashboard(props: DashboardProps) {
  const [timeRange, setTimeRange] = useState<'6months' | '12months'>('12months');

  const {
    pharmacies, ordonnances, produits,
    chiffreAffaires, caThisMonth, caLastMonth,
    growthStats, monthlyStats,
    ordonnancesStats, livraisonsStats, pharmaciesStats,
    topPharmacies, recentActivities, weeklyData, categoriesStats,
  } = props;

  return (
    <AppLayout>
      <Head title="Dashboard Administration" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 space-y-8">

          <WelcomeHeader />

          {/* KPI Cards */}
          <StatsCards
            pharmacies={pharmacies}
            ordonnances={ordonnances}
            produits={produits}
            growthStats={growthStats}
            chiffreAffaires={chiffreAffaires}
            caThisMonth={caThisMonth}
            caLastMonth={caLastMonth}
          />

          {/* Donuts — ordonnances / livraisons / pharmacies */}
          <StatusDonutCards
            ordonnancesStats={ordonnancesStats}
            livraisonsStats={livraisonsStats}
            pharmaciesStats={pharmaciesStats}
          />

          {/* Évolution mensuelle */}
          <ChartsSection
            monthlyStats={monthlyStats}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          {/* Activité 7 jours + Classement pharmacies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyActivityCard data={weeklyData} />
            <TopPharmaciesCard  pharmacies={topPharmacies} />
          </div>

          {/* Activités récentes + Catégories + Actions rapides */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentActivities activities={recentActivities} />
            </div>
            <div className="space-y-6">
              <CategoriesCard categories={categoriesStats} />
              <QuickActions />
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
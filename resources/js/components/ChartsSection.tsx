import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, BarChart3 } from 'lucide-react';
import { MonthlyChart } from './MonthlyChart';

interface ChartsSectionProps {
  monthlyStats: {
    pharmacies: Record<string, number>;
    ordonnances: Record<string, number>;
    produits: Record<string, number>;
  };
  timeRange: '6months' | '12months';
  onTimeRangeChange: (range: '6months' | '12months') => void;
}

const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];

export function ChartsSection({ monthlyStats, timeRange, onTimeRangeChange }: ChartsSectionProps) {
  const prepareChartData = () => {
    const count = timeRange === '6months' ? 6 : 12;
    const now = new Date();
    const labels: string[] = [];
    const pharmaciesData: number[] = [];
    const ordonnancesData: number[] = [];
    const produitsData: number[] = [];

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(MONTH_NAMES[d.getMonth()]);
      pharmaciesData.push(monthlyStats.pharmacies[key]  ?? 0);
      ordonnancesData.push(monthlyStats.ordonnances[key] ?? 0);
      produitsData.push(monthlyStats.produits[key]     ?? 0);
    }

    return {
      labels,
      datasets: [
        { name: 'Pharmacies',  data: pharmaciesData,  color: '#3b82f6' },
        { name: 'Ordonnances', data: ordonnancesData, color: '#22c55e' },
        { name: 'Produits',    data: produitsData,    color: '#a855f7' },
      ],
    };
  };

  const chartData = prepareChartData();
  const totals = {
    pharmacies:  Object.values(monthlyStats.pharmacies).reduce((a, b) => a + b, 0),
    ordonnances: Object.values(monthlyStats.ordonnances).reduce((a, b) => a + b, 0),
    produits:    Object.values(monthlyStats.produits).reduce((a, b) => a + b, 0),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Évolution mensuelle
              </CardTitle>
              <CardDescription>
                Statistiques des {timeRange === '6months' ? '6' : '12'} derniers mois
              </CardDescription>
            </div>
            <Tabs value={timeRange} onValueChange={(v: any) => onTimeRangeChange(v)}>
              <TabsList>
                <TabsTrigger value="6months" className="gap-1">
                  <Calendar className="h-3 w-3" /> 6 mois
                </TabsTrigger>
                <TabsTrigger value="12months" className="gap-1">
                  <Calendar className="h-3 w-3" /> 12 mois
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6 mb-6">
            {[
              { label: 'Pharmacies',  total: totals.pharmacies,  color: 'bg-blue-500' },
              { label: 'Ordonnances', total: totals.ordonnances, color: 'bg-green-500' },
              { label: 'Produits',    total: totals.produits,    color: 'bg-purple-500' },
            ].map(({ label, total, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm">{label}</span>
                <span className="text-sm font-bold text-muted-foreground">({total})</span>
              </div>
            ))}
          </div>
          <div className="h-[380px]">
            <MonthlyChart data={chartData} type="area" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
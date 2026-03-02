import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const PALETTE = ['#3b82f6','#22c55e','#a855f7','#f59e0b','#ef4444','#0ea5e9'];

export function CategoriesCard({ categories }: { categories: { name: string; value: number }[] }) {
  const max = categories[0]?.value || 1;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-muted/20 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-primary" />
            Catégories de produits
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {categories.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">Aucune donnée</p>
          )}
          {categories.map((cat, i) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium truncate max-w-[140px]">{cat.name}</span>
                <span className="text-muted-foreground tabular-nums">{cat.value}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((cat.value / max) * 100)}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08 }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Package, Tag, Layers, Pill, FlaskConical, ImageIcon } from 'lucide-react';

interface Stats {
  total:number; categories:number; avec_forme:number; avec_dosage:number;
  top_categories: {name:string; count:number}[];
}

const PALETTE = ['bg-purple-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-red-500','bg-pink-500'];

export function ProduitsStats({ stats }: { stats: Stats }) {
  const cards = [
    {label:'Total produits',   value:stats.total,      icon:Package,    color:'from-purple-500 to-purple-600', bg:'bg-purple-50 dark:bg-purple-950/20',  text:'text-purple-600'},
    {label:'Catégories',       value:stats.categories, icon:Tag,        color:'from-blue-500 to-blue-600',     bg:'bg-blue-50 dark:bg-blue-950/20',      text:'text-blue-600'},
    {label:'Avec forme',       value:stats.avec_forme, icon:Pill,       color:'from-emerald-500 to-emerald-600',bg:'bg-emerald-50 dark:bg-emerald-950/20',text:'text-emerald-600'},
    {label:'Avec dosage',      value:stats.avec_dosage,icon:FlaskConical,color:'from-amber-500 to-amber-600',  bg:'bg-amber-50 dark:bg-amber-950/20',    text:'text-amber-600'},
  ];

  const maxCount = Math.max(...stats.top_categories.map(c=>c.count), 1);

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      {/* KPI Cards */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c,i) => (
          <motion.div key={c.label}
            initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            transition={{delay:i*0.06}} whileHover={{y:-3,transition:{duration:0.15}}}>
            <Card className="overflow-hidden border-0 shadow-md">
              <div className={`h-1 bg-gradient-to-r ${c.color}`}/>
              <div className="p-4">
                <div className={`p-2 rounded-lg ${c.bg} w-fit mb-3`}>
                  <c.icon className={`h-5 w-5 ${c.text}`}/>
                </div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top catégories */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-blue-500"/>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-muted-foreground"/>
            <p className="text-sm font-semibold">Top catégories</p>
          </div>
          <div className="space-y-3">
            {stats.top_categories.map((cat, i) => (
              <div key={cat.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium truncate max-w-[150px]">{cat.name}</span>
                  <span className="text-muted-foreground tabular-nums">{cat.count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${PALETTE[i % PALETTE.length]}`}
                    initial={{width:0}}
                    animate={{width:`${Math.round((cat.count/maxCount)*100)}%`}}
                    transition={{duration:0.7,delay:0.3+i*0.08}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
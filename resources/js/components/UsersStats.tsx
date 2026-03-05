import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Shield, Users, CheckCircle2, Ban } from 'lucide-react';

interface Stats { total_admins:number; total_users:number; actifs:number; bloques:number; }

export function UsersStats({ stats }: { stats: Stats }) {
  const cards = [
    { label:'Super Admins', value:stats.total_admins, icon:Shield,       color:'from-indigo-500 to-indigo-600', bg:'bg-indigo-50 dark:bg-indigo-950/20',   text:'text-indigo-600'  },
    { label:'Utilisateurs', value:stats.total_users,  icon:Users,        color:'from-slate-500 to-slate-600',   bg:'bg-slate-50 dark:bg-slate-800',         text:'text-slate-600'   },
    { label:'Actifs',       value:stats.actifs,        icon:CheckCircle2, color:'from-emerald-500 to-emerald-600',bg:'bg-emerald-50 dark:bg-emerald-950/20', text:'text-emerald-600' },
    { label:'Bloqués',      value:stats.bloques,       icon:Ban,          color:'from-red-500 to-red-600',       bg:'bg-red-50 dark:bg-red-950/20',          text:'text-red-600'     },
  ];
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c,i) => (
        <motion.div key={c.label}
          initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
          transition={{delay:i*0.07}} whileHover={{y:-3,transition:{duration:0.15}}}>
          <Card className="overflow-hidden border-0 shadow-md">
            <div className={`h-1 bg-linear-to-r ${c.color}`}/>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${c.bg}`}>
                  <c.icon className={`h-5 w-5 ${c.text}`}/>
                </div>
              </div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
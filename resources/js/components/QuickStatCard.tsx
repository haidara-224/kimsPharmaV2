import { motion } from "framer-motion";

interface QuickStatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  delay: number;
}

const QuickStatCard = ({ title, value, icon: Icon, color, delay }: QuickStatCardProps) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border"
    >
      <div className={`h-1 bg-linear-to-r ${colors[color]}`} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={`p-2 rounded-lg bg-linear-to-r ${colors[color]} bg-opacity-10`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
};
export default QuickStatCard;
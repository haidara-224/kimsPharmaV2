import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  FileText, 
  Package, 
  UserPlus,
  Settings,
  Download,
  Upload,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Link } from '@inertiajs/react';

const actions = [
  {
    title: 'Nouvelle pharmacie',
    description: 'Ajouter une pharmacie',
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-600',
    href: '/admin/pharmacies/create',
  },
  {
    title: 'Nouveau produit',
    description: 'Ajouter un médicament',
    icon: Package,
    color: 'from-green-500 to-green-600',
    bg: 'bg-green-50 dark:bg-green-950/20',
    textColor: 'text-green-600',
    href: '/admin/produits/create',
  },
  {
    title: 'Gérer les rôles',
    description: 'Permissions et accès',
    icon: Shield,
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    textColor: 'text-purple-600',
    href: '/admin/roles',
  },
  {
    title: 'Exporter les données',
    description: 'Rapports statistiques',
    icon: Download,
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    textColor: 'text-amber-600',
    href: '#',
  },
];

export function QuickActions() {
  return (
    <Card className="border-0 shadow-lg h-full">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Actions rapides
        </CardTitle>
        <CardDescription>
          Tâches courantes et raccourcis
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`p-2 rounded-lg ${action.bg}`}>
                      <action.icon className={`h-5 w-5 ${action.textColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Statistiques supplémentaires */}
        <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Croissance rapide</h4>
          <p className="text-xs text-muted-foreground mb-3">
            +127% d'activité ce mois-ci
          </p>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: '75%' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
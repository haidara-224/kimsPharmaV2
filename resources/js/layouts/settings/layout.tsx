import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem } from '@/types';

interface NavItemWithDescription extends NavItem {
  description: string;
}
import {
  User,
  Lock,
  Shield,
  Palette,
  ArrowLeft,
  Settings,
  Bell,
  Globe,
  CreditCard,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const sidebarNavItems: NavItemWithDescription[] = [
  {
    title: 'Profile',
    href: edit(),
    icon: User,
    description: 'Gérez vos informations personnelles',
  },
  {
    title: 'Password',
    href: editPassword(),
    icon: Lock,
    description: 'Modifiez votre mot de passe',
  },
  {
    title: 'Two-Factor Auth',
    href: show(),
    icon: Shield,
    description: 'Sécurisez votre compte',
  },
  {
    title: 'Appearance',
    href: editAppearance(),
    icon: Palette,
    description: 'Personnalisez l\'apparence',
  },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
  const { isCurrentUrl } = useCurrentUrl();
  const [isHovered, setIsHovered] = useState<number | null>(null);

  // When server-side rendering, we only render the layout on the client...
  if (typeof window === 'undefined') {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header avec bouton retour */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="h-10 w-10 rounded-full hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <Heading
                  title="Paramètres"
                  description="Gérez votre profil et les paramètres de votre compte"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Settings className="h-3 w-3" />
                v1.0.0
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-80 mb-6 lg:mb-0"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden">
              {/* En-tête de la sidebar */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Menu des paramètres</h3>
                    <p className="text-xs text-muted-foreground">
                      {sidebarNavItems.length} sections disponibles
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2" aria-label="Settings">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-1"
                >
                  {sidebarNavItems.map((item, index) => {
                    const isActive = isCurrentUrl(item.href);
                    const isItemHovered = isHovered === index;

                    return (
                      <motion.div
                        key={`${toUrl(item.href)}-${index}`}
                        variants={itemVariants}
                        onHoverStart={() => setIsHovered(index)}
                        onHoverEnd={() => setIsHovered(null)}
                      >
                        <Link href={item.href}>
                          <div
                            className={cn(
                              'relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                              {
                                'bg-primary/10 text-primary': isActive,
                                'hover:bg-muted/50': !isActive,
                                'scale-[1.02]': isItemHovered && !isActive,
                              }
                            )}
                          >
                            {/* Indicateur de section active */}
                            {isActive && (
                              <motion.div
                                layoutId="activeIndicator"
                                className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}

                            {/* Icône avec animation */}
                            <div
                              className={cn(
                                'p-2 rounded-lg transition-colors',
                                isActive
                                  ? 'bg-primary/10'
                                  : 'bg-muted/30 group-hover:bg-muted/50'
                              )}
                            >
                              {item.icon ? (
                                <item.icon
                                  className={cn(
                                    'h-4 w-4 transition-transform',
                                    isItemHovered && 'scale-110',
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                  )}
                                />
                              ) : null}
                            </div>

                            {/* Texte et description */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  'text-sm font-medium transition-colors',
                                  isActive ? 'text-primary' : 'text-foreground'
                                )}
                              >
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.description}
                              </p>
                            </div>

                            {/* Flèche indicative */}
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 transition-all',
                                isActive
                                  ? 'text-primary opacity-100'
                                  : 'text-muted-foreground opacity-0 group-hover:opacity-50',
                                isItemHovered && 'translate-x-1'
                              )}
                            />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </nav>

              {/* Footer de la sidebar */}
              <div className="p-4 border-t bg-muted/20">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border"
            >
              <h4 className="text-sm font-medium mb-2">Besoin d'aide ?</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Consultez notre documentation ou contactez le support
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Centre d'aide
              </Button>
            </motion.div>
          </motion.aside>

          {/* Séparateur pour mobile */}
          <Separator className="my-6 lg:hidden" />

          {/* Contenu principal */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1"
          >
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border overflow-hidden">
              {/* En-tête de la section active */}
              <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-xl font-semibold">
                  {sidebarNavItems.find(item => isCurrentUrl(item.href))?.title || 'Paramètres'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {sidebarNavItems.find(item => isCurrentUrl(item.href))?.description}
                </p>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <section className="max-w-2xl space-y-6">
                  {children}
                </section>
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}

// Composant Badge local (à importer depuis shadcn/ui normalement)
const Badge = ({ children, variant = 'default', className = '', ...props }: any) => {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    outline: 'border border-border bg-transparent',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
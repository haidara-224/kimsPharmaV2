import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import {
  Shield,
  Loader2,
  Check,
  X,
  AlertCircle,
  UserCog,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Users,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  Save,
} from 'lucide-react';

import { User } from '@/types';

interface Role {
  id: number;
  name: string;
  guard_name?: string;
  description?: string;
}

interface UserRoleModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate?: (updatedUser: User) => void;
  roles: { id: number; name: string }[];
}


export function UserRoleModal({ user, open, onOpenChange, onUserUpdate, roles }: UserRoleModalProps) {

  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronise les rôles sélectionnés avec ceux déjà attribués à l'utilisateur à chaque ouverture du modal
  useEffect(() => {
    if (open && user && Array.isArray(user.roles)) {
      setSelectedRoles(user.roles.map((r: any) => r.id));
    } else if (open) {
      setSelectedRoles([]);
    }
  }, [open, user]);

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedRoles(roles.map(r => r.id));
  };

  const handleDeselectAll = () => {
    setSelectedRoles([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // envoyer au serveur les ids de rôles choisis
      const response = await router.post(`/users/${user.id}/roles`, {
        roles: selectedRoles,
      }, {
        preserveState: true,
        onSuccess: (page) => {
          // la réponse JSON inclut les nouveaux rôles
          const updatedRoles = roles.filter(r => selectedRoles.includes(r.id));
          const updatedUser = { ...user, roles: updatedRoles };
          if (onUserUpdate) {
            onUserUpdate(updatedUser);
          }
          toast.success( "Rôles mis à jour avec succès");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Erreur lors de la mise à jour des rôles");
        }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la mise à jour des rôles");
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'pharmacy':
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case 'manager':
        return <UserCog className="h-4 w-4 text-purple-500" />;
      case 'assistant':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400';
      case 'pharmacy':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
      case 'manager':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400';
      case 'assistant':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400';
      case 'viewer':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Gestion des rôles</DialogTitle>
              <DialogDescription>
                Gérez les permissions et accès de l'utilisateur
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* Informations utilisateur */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg mb-6">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.nom?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.nom}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {user.user_type || 'Membre'}
            </Badge>
          </div>

              {/* Actions rapides */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Permissions
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Tout sélectionner
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="h-8 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Tout désélectionner
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {roles.map((role) => {
                    const isSelected = selectedRoles.includes(role.id);
                    const roleColor = getRoleColor(role.name);
                    
                    return (
                      <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                          relative p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent hover:border-muted bg-muted/20'
                          }
                        `}
                        onClick={() => handleRoleToggle(role.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleRoleToggle(role.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getRoleIcon(role.name)}
                              <span className="font-medium capitalize">{role.name}</span>
                              {isSelected && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Activé
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {role.name || `Accès et permissions pour le rôle ${role.name}`}
                            </p>
                            
                            {/* Tags de permissions (optionnel) */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                                lecture
                              </span>
                              {role.name === 'admin' && (
                                <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                                  écriture
                                </span>
                              )}
                              {role.name === 'admin' && (
                                <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                                  suppression
                                </span>
                              )}
                              {role.name === 'manager' && (
                                <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                                  gestion équipe
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Indicateur de sélection animé */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 text-primary"
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Résumé des sélections */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {selectedRoles.length} rôle{selectedRoles.length > 1 ? 's' : ''} sélectionné{selectedRoles.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {selectedRoles.map(roleId => {
                      const role = roles.find(r => r.id === roleId);
                      return role ? (
                        <Badge 
                          key={roleId} 
                          variant="outline"
                          className="capitalize text-xs"
                        >
                          {role.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
        </div>

        <div className="p-6 pt-4 border-t bg-muted/50 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2 min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default UserRoleModal;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2, Search, Send, UserPlus, Users, Shield, Settings } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "./ui/dialog";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { Pharmacie, User } from "@/types";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import UserRoleModal from "./UserRoleModal";


interface TeamManagementProps {
  pharmacie: Pharmacie;
  users: User[];
  roles: { id: number; name: string }[];
}

const TeamManagement = ({ pharmacie, users, roles }: TeamManagementProps) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // initialize with a safe empty array in case props are missing
  const [usersList, setUsersList] = useState<User[]>(users || []);

  // Mettre à jour la liste quand les props changent
  useEffect(() => {
    setUsersList(users || []);
  }, [users]);

  // ensure we don't call filter on undefined
  const filteredUsers = (usersList || []).filter(user =>
    user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    router.post(`/paramettrage/invite/${pharmacie.id}`, {
      email: inviteEmail,
      name: inviteName
    }, {
      onSuccess: () => {
        toast.success("Invitation envoyée avec succès");
        setIsInviteModalOpen(false);
        setInviteEmail('');
        setInviteName('');
      },
      onError: (errors) => {
        toast.error("Erreur lors de l'envoi de l'invitation");
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion de l'équipe
              </CardTitle>
              <CardDescription>
                Gérez les membres de votre équipe et leurs accès
              </CardDescription>
            </div>
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Inviter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un membre</DialogTitle>
                  <DialogDescription>
                    Envoyez une invitation à un nouveau membre de l'équipe
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Ex: Jean Dupont"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="exemple@email.com"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Liste des membres */}
          {filteredUsers.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10">
                          {user.nom?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.nom}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {Array.isArray(user.roles)
                          ? user.roles.map(r => r.name).join(', ')
                          : String(user.roles) || "Aucun rôle"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openRoleModal(user)}
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Aucun membre</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm 
                  ? "Aucun membre ne correspond à votre recherche"
                  : "Commencez par inviter des membres dans votre équipe"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsInviteModalOpen(true)} variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Inviter un membre
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de gestion des rôles */}
      {selectedUser && (
        <UserRoleModal
          user={selectedUser}
          open={isRoleModalOpen}
          onOpenChange={setIsRoleModalOpen}
          onUserUpdate={(updatedUser: User) => setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))}
          roles={roles}
        />
      )}
    </>
  );
};

export default TeamManagement;
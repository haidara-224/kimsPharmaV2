import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { User } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Shield, Users } from 'lucide-react';
import { DeleteUserDialog } from '@/components/DeleteUserDialog';
import { InviteModal } from '@/components/InviteModal';
import { UsersSection } from '@/components/UsersSection';
import { SuperAdminsSection } from '@/components/SuperAdminsSection';
import { UsersStats } from '@/components/UsersStats';

interface Paginated {
  data: User[]; current_page: number; last_page: number; total: number;
  links: { url: string|null; label: string; active: boolean }[];
}
interface Stats {
  total_admins: number; total_users: number; actifs: number; bloques: number;
}

export default function ParamettrePage({
  superAdmins, otherUsers, stats,
}: { superAdmins: Paginated; otherUsers: Paginated; stats: Stats }) {

  const { props } = usePage();
  const flash = (props as any).flash ?? {};

  const [inviteOpen, setInviteOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<User | null>(null);
  const [isProcessing, setProcessing]     = useState(false);


  if (flash.success) toast.success(flash.success);

  const handleBlock = (user: User) => {
   
    router.put(('/dashboard/Administration/Dashboard/utilisateur/' + user.id + '/block'), {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success(`${user.name} bloqué(e)`),
      onError:   () => toast.error('Erreur'),
    });
  };

  const handleUnblock = (user: User) => {
    router.put(('/dashboard/Administration/Dashboard/utilisateur/' + user.id + '/unblock'), {}, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success(`${user.name} débloqué(e)`),
      onError:   () => toast.error('Erreur'),
    });
  };

  const handleDelete = (user: User) => setDeleteTarget(user);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setProcessing(true);
    router.delete(('/dashboard/Administration/Dashboard/utilisateur/' + deleteTarget.id+'/delete'), {
      preserveState: true, preserveScroll: true,
      onSuccess: () => { toast.success('Utilisateur supprimé'); setDeleteTarget(null); },
      onError:   (e) => toast.error(Object.values(e)[0] as string ?? 'Erreur'),
      onFinish:  () => setProcessing(false),
    });
  };

  return (
    <AppLayout>
      <Head title="Paramètres — Utilisateurs" />

      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/20">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                    Gestion des utilisateurs
                  </h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {stats.total_admins + stats.total_users} utilisateur{(stats.total_admins + stats.total_users) > 1 ? 's' : ''} enregistré{(stats.total_admins + stats.total_users) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <UsersStats stats={stats} />

          {/* Tabs */}
          <Tabs defaultValue="admins">
            <TabsList className="bg-white dark:bg-slate-800 shadow-sm border p-1 rounded-xl h-auto gap-1">
              <TabsTrigger value="admins"
                className="gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg px-4 py-2">
                <Shield className="h-4 w-4" />
                Super Admins
                <span className="ml-1 bg-indigo-100 text-indigo-700 data-[state=active]:bg-white/20 data-[state=active]:text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats.total_admins}
                </span>
              </TabsTrigger>
              <TabsTrigger value="users"
                className="gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white rounded-lg px-4 py-2">
                <Users className="h-4 w-4" />
                Autres utilisateurs
                <span className="ml-1 bg-slate-100 text-slate-700 text-xs px-1.5 py-0.5 rounded-full">
                  {stats.total_users}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admins" className="mt-4">
              <SuperAdminsSection
                superAdmins={superAdmins}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
                onDelete={handleDelete}
                onInvite={() => setInviteOpen(true)}
              />
            </TabsContent>

            <TabsContent value="users" className="mt-4">
              <UsersSection
                users={otherUsers}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>

        </div>
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <DeleteUserDialog
        user={deleteTarget} open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        onConfirm={confirmDelete} isProcessing={isProcessing}
      />
    </AppLayout>
  );
}
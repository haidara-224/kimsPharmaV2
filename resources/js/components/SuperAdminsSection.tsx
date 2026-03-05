import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield, Plus, MoreVertical, Ban, Unlock,
  Trash2, Mail, Calendar, Crown, ChevronLeft, ChevronRight, MoreHorizontal,
} from 'lucide-react';
import { User } from '@/types';

interface Paginated {
  data: User[]; total: number; current_page: number; last_page: number;
  links: { url: string|null; label: string; active: boolean }[];
}
interface Props {
  superAdmins: Paginated;
  onBlock:   (u:User) => void;
  onUnblock: (u:User) => void;
  onDelete:  (u:User) => void;
  onInvite:  () => void;
}

export function SuperAdminsSection({ superAdmins, onBlock, onUnblock, onDelete, onInvite }: Props) {

  const handlePageChange = (url: string | null) => {
    if (url) router.get(url, {}, { preserveState: true, preserveScroll: true });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold text-lg">Super Administrateurs</h2>
          <Badge className="bg-indigo-100 text-indigo-700 border-0">{superAdmins.total}</Badge>
        </div>
        <Button onClick={onInvite}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/30">
          <Plus className="h-4 w-4" /> Inviter un admin
        </Button>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {superAdmins.data.map((user, i) => (
          <motion.div key={user.id}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.06 }} whileHover={{ y:-3, transition:{ duration:0.15 } }}>
            <Card className="border-0 shadow-md overflow-hidden group h-full">
              <div className="h-1.5 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-400"/>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-indigo-200">
                        <AvatarImage src={(user as any).avatar ?? ''} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-lg">
                          {user.nom?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1.5 -right-1.5 bg-amber-400 rounded-full p-0.5">
                        <Crown className="h-3 w-3 text-white"/>
                      </div>
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background
                        ${(user as any).status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}/>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{user.nom}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground shrink-0"/>
                        <p className="text-xs text-muted-foreground truncate max-w-37.5">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      {(user as any).status === 'active' ? (
                        <DropdownMenuItem onClick={() => onBlock(user)} className="gap-2 text-orange-600">
                          <Ban className="h-4 w-4"/> Bloquer
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onUnblock(user)} className="gap-2 text-emerald-600">
                          <Unlock className="h-4 w-4"/> Débloquer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator/>
                      <DropdownMenuItem onClick={() => onDelete(user)} className="gap-2 text-red-600">
                        <Trash2 className="h-4 w-4"/> Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <Badge className={`text-xs border-0 gap-1 ${
                    (user as any).status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      (user as any).status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}/>
                    {(user as any).status === 'active' ? 'Actif' : 'Bloqué'}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3"/>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Carte invite */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
          transition={{ delay: superAdmins.data.length * 0.06 }}>
          <button onClick={onInvite}
            className="w-full h-full min-h-40 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center gap-2 text-indigo-400 hover:text-indigo-600 transition-all hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10">
            <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/20">
              <Plus className="h-6 w-6"/>
            </div>
            <p className="text-sm font-medium">Inviter un admin</p>
          </button>
        </motion.div>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {superAdmins.last_page > 1 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-sm text-muted-foreground">
            Page <strong>{superAdmins.current_page}</strong> sur <strong>{superAdmins.last_page}</strong>
            {' '}· <strong>{superAdmins.total}</strong> admin{superAdmins.total > 1 ? 's' : ''}
          </p>
          <PaginationBar
            links={superAdmins.links}
            currentPage={superAdmins.current_page}
            lastPage={superAdmins.last_page}
            onPageChange={handlePageChange}
            accentColor="indigo"
          />
        </motion.div>
      )}
    </div>
  );
}

// ── Composant pagination réutilisable ──────────────────────────────────────
function PaginationBar({ links, currentPage, lastPage, onPageChange, accentColor = 'indigo' }: {
  links: { url: string|null; label: string; active: boolean }[];
  currentPage: number; lastPage: number;
  onPageChange: (url: string|null) => void;
  accentColor?: string;
}) {
  const prev = links.find(l => l.label.includes('Previous') || l.label.includes('réc'));
  const next = links.find(l => l.label.includes('Next')     || l.label.includes('uiv'));
  const pages: (number|'...')[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || Math.abs(i - currentPage) <= 2) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }
  return (
    <nav className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-9 w-9"
        onClick={() => onPageChange(prev?.url ?? null)} disabled={!prev?.url}>
        <ChevronLeft className="h-4 w-4"/>
      </Button>
      {pages.map((p, i) =>
        p === '...'
          ? <Button key={`d${i}`} variant="ghost" size="icon" className="h-9 w-9" disabled>
              <MoreHorizontal className="h-4 w-4"/>
            </Button>
          : <Button key={p} size="sm"
              variant={p === currentPage ? 'default' : 'outline'}
              className={`h-9 min-w-9 ${p === currentPage ? `bg-${accentColor}-600 hover:bg-${accentColor}-700` : ''}`}
              onClick={() => onPageChange(links.find(l => l.label === String(p))?.url ?? null)}>
              {p}
            </Button>
      )}
      <Button variant="outline" size="icon" className="h-9 w-9"
        onClick={() => onPageChange(next?.url ?? null)} disabled={!next?.url}>
        <ChevronRight className="h-4 w-4"/>
      </Button>
    </nav>
  );
}
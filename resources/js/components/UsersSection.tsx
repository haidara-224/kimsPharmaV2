import { motion } from 'framer-motion';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users, MoreVertical, Ban, Unlock, Trash2,
  Mail, Calendar, ChevronLeft, ChevronRight, MoreHorizontal,
} from 'lucide-react';
import { User } from '@/types';

interface Paginated {
  data: User[]; total: number; current_page: number; last_page: number;
  links: { url: string|null; label: string; active: boolean }[];
}
interface Props {
  users: Paginated;
  onBlock:   (u:User) => void;
  onUnblock: (u:User) => void;
  onDelete:  (u:User) => void;
}

export function UsersSection({ users, onBlock, onUnblock, onDelete }: Props) {

  const handlePageChange = (url: string | null) => {
    if (url) router.get(url, {}, { preserveState: true, preserveScroll: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-slate-600" />
        <h2 className="font-semibold text-lg">Autres utilisateurs</h2>
        <Badge variant="secondary">{users.total}</Badge>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground"/>
            Liste des utilisateurs
          </CardTitle>
          <CardDescription>
            {users.total} utilisateur{users.total > 1 ? 's' : ''} au total
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle(s)</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-20"/>
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              )}
              {users.data.map((user, i) => (
                <motion.tr key={user.id}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-muted/40 transition-colors">

                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-9 w-9 border border-muted">
                          <AvatarImage src={(user as any).avatar ?? ''}/>
                          <AvatarFallback className="text-sm bg-slate-100 text-slate-600 font-medium">
                            {user.nom?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background
                          ${(user as any).status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}/>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.nom}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3"/>{user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex flex-wrap gap-1">
                      {(user as any).roles?.length > 0
                        ? (user as any).roles.map((r: any) => (
                            <Badge key={r.name} variant="outline" className="text-xs">{r.name}</Badge>
                          ))
                        : <span className="text-xs text-muted-foreground italic">Aucun rôle</span>
                      }
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <Badge className={`text-xs border-0 gap-1 ${
                      (user as any).status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        (user as any).status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}/>
                      {(user as any).status === 'active' ? 'Actif' : 'Bloqué'}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3"/>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </TableCell>

                  <TableCell className="text-right py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* ── Pagination dans la card ──────────────────────────────── */}
        {users.last_page > 1 && (
          <div className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Page <strong>{users.current_page}</strong> sur <strong>{users.last_page}</strong>
              {' '}· <strong>{users.total}</strong> utilisateur{users.total > 1 ? 's' : ''}
            </p>
            <nav className="flex items-center gap-1">
              {(() => {
                const prev = users.links.find(l => l.label.includes('Previous') || l.label.includes('réc'));
                const next = users.links.find(l => l.label.includes('Next') || l.label.includes('uiv'));
                const pages: (number|'...')[] = [];
                for (let i = 1; i <= users.last_page; i++) {
                  if (i === 1 || i === users.last_page || Math.abs(i - users.current_page) <= 2) pages.push(i);
                  else if (pages[pages.length - 1] !== '...') pages.push('...');
                }
                return (
                  <>
                    <Button variant="outline" size="icon" className="h-9 w-9"
                      onClick={() => handlePageChange(prev?.url ?? null)} disabled={!prev?.url}>
                      <ChevronLeft className="h-4 w-4"/>
                    </Button>
                    {pages.map((p, i) =>
                      p === '...'
                        ? <Button key={`d${i}`} variant="ghost" size="icon" className="h-9 w-9" disabled>
                            <MoreHorizontal className="h-4 w-4"/>
                          </Button>
                        : <Button key={p} size="sm"
                            variant={p === users.current_page ? 'default' : 'outline'}
                            className="h-9 min-w-[36px]"
                            onClick={() => handlePageChange(users.links.find(l => l.label === String(p))?.url ?? null)}>
                            {p}
                          </Button>
                    )}
                    <Button variant="outline" size="icon" className="h-9 w-9"
                      onClick={() => handlePageChange(next?.url ?? null)} disabled={!next?.url}>
                      <ChevronRight className="h-4 w-4"/>
                    </Button>
                  </>
                );
              })()}
            </nav>
          </div>
        )}
      </Card>
    </div>
  );
}
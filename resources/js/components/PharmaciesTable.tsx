import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical, Eye, Edit, Ban, Trash2, Unlock,
  MapPin, Phone, Building2, CheckCircle2, Clock,
  ChevronDown, FileText, TrendingUp,
} from 'lucide-react';
import { Pharmacie } from '@/types';

interface PharmaciesTableProps {
  pharmacies: Pharmacie[];
  highlightedId: number | null;
  onRowClick: (p: Pharmacie) => void;
  onStatusChange: (p: Pharmacie, s: string) => void;
  onDispoChange:  (p: Pharmacie, d: string) => void;
  onBlockToggle:  (p: Pharmacie) => void;
  onDelete:       (p: Pharmacie) => void;
  isProcessing: boolean;
}

export function PharmaciesTable({
  pharmacies, highlightedId, onRowClick,
  onStatusChange, onDispoChange, onBlockToggle, onDelete, isProcessing,
}: PharmaciesTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const StatusBadge = ({ statut }: { statut: string }) => (
    statut === 'active'
      ? <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>
      : <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Inactive</Badge>
  );

  const DispoBadge = ({ dispo }: { dispo: string }) => (
    dispo === 'open'
      ? <Badge className="bg-blue-500 hover:bg-blue-600">Ouverte</Badge>
      : <Badge variant="outline" className="text-slate-500">Fermée</Badge>
  );

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Liste des pharmacies
            </CardTitle>
            <CardDescription>
              {pharmacies.length} résultat{pharmacies.length > 1 ? 's' : ''}
              {highlightedId && (
                <span className="ml-2 text-primary font-medium">
                  · 1 sélectionnée sur la carte
                </span>
              )}
            </CardDescription>
          </div>
          {highlightedId && (
            <Button variant="ghost" size="sm" onClick={() => onRowClick(pharmacies.find(p => p.id === highlightedId)!)}>
              Désélectionner
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Pharmacie</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Disponibilité</TableHead>
                <TableHead>Ordonnances</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pharmacies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Aucune pharmacie trouvée
                  </TableCell>
                </TableRow>
              )}
              {pharmacies.map((p, i) => {
                const isHighlighted = highlightedId === p.id;
                const isExpanded    = expandedId === p.id;

                return (
                  <>
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => onRowClick(p)}
                      className={`
                        cursor-pointer transition-all duration-200
                        ${isHighlighted
                          ? 'bg-primary/8 border-l-4 border-l-primary shadow-sm'
                          : 'hover:bg-muted/40 border-l-4 border-l-transparent'}
                      `}
                    >
                      {/* Expand toggle */}
                      <TableCell className="w-8 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : p.id); }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </TableCell>

                      {/* Pharmacie */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className={`h-10 w-10 border-2 transition-all ${isHighlighted ? 'border-primary' : 'border-primary/20'}`}>
                              <AvatarImage src={p.logo ? `/storage/${p.logo}` : ''} />
                              <AvatarFallback className={`text-sm font-bold ${isHighlighted ? 'bg-primary text-white' : 'bg-primary/10'}`}>
                                {p.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {p.disponibilite === 'open' && !p.is_blocked && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold truncate max-w-40 ${isHighlighted ? 'text-primary' : ''}`}>
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-35">{p.adresse || '—'}</span>
                            </p>
                            {p.is_blocked && (
                              <Badge variant="destructive" className="gap-1 mt-1 text-xs py-0">
                                <Ban className="h-2.5 w-2.5" /> Bloquée
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell className="py-3">
                        <p className="text-sm flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {p.tel || '—'}
                        </p>
                      </TableCell>

                      {/* Statut */}
                      <TableCell className="py-3">
                        <div className="space-y-1.5">
                          <StatusBadge statut={p.statut} />
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <Switch
                              checked={p.statut === 'active'}
                              onCheckedChange={c => onStatusChange(p, c ? 'active' : 'inactive')}
                              disabled={isProcessing || p.is_blocked}
                              className="scale-75 origin-left"
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Disponibilité */}
                      <TableCell className="py-3">
                        <div className="space-y-1.5">
                          <DispoBadge dispo={p.disponibilite} />
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <Switch
                              checked={p.disponibilite === 'open'}
                              onCheckedChange={c => onDispoChange(p, c ? 'open' : 'closed')}
                              disabled={isProcessing || p.is_blocked || p.statut !== 'active'}
                              className="scale-75 origin-left"
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Ordonnances */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{(p as any).ordonances_count ?? 0}</p>
                            <p className="text-xs text-muted-foreground">total</p>
                          </div>
                          {(p as any).ordonances_processed_count > 0 && (
                            <div className="flex items-center gap-1 ml-1">
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                              <span className="text-xs text-emerald-600 font-medium">
                                {(p as any).ordonances_processed_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-3" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                   
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onBlockToggle(p)}
                              className={p.is_blocked ? 'text-green-600' : 'text-orange-600'}>
                              {p.is_blocked
                                ? <><Unlock className="h-4 w-4 mr-2" />Débloquer</>
                                : <><Ban className="h-4 w-4 mr-2" />Bloquer</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(p)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>

                    {/* Ligne expandable */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr key={`exp-${p.id}`}>
                          <td colSpan={7} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-4 bg-muted/20 border-t border-b grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                                  <p className="text-sm">{p.description || 'Non renseignée'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Coordonnées GPS</p>
                                  <p className="text-sm font-mono">{p.coordonnees || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Inscrite le</p>
                                  <p className="text-sm">
                                    {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Ordonnances traitées</p>
                                  <p className="text-sm font-bold text-emerald-600">
                                    {(p as any).ordonances_processed_count ?? 0}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
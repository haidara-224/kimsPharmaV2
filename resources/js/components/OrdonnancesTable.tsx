import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText, MoreVertical, Eye, CheckCircle2, XCircle,
  Clock, ChevronDown, Building2, User, Package, Truck, MessageSquare, FilePlus,
} from 'lucide-react';
import { Ordonnance } from '@/types';

interface Props {
  ordonnances: Ordonnance[];
  onView: (o: Ordonnance) => void;
  onStatusChange: (o: Ordonnance, s: string) => void;
  isProcessing: boolean;
}

const STATUS_CFG: Record<string, { label:string; color:string; icon:any; bg:string }> = {
  pending:   { label:'En attente', color:'text-amber-600',   icon:Clock,         bg:'bg-amber-50 dark:bg-amber-950/20'   },
  processed: { label:'Traitée',    color:'text-emerald-600', icon:CheckCircle2,  bg:'bg-emerald-50 dark:bg-emerald-950/20'},
  rejected:  { label:'Rejetée',    color:'text-red-600',     icon:XCircle,       bg:'bg-red-50 dark:bg-red-950/20'       },
  to_create: { label:'À créer',    color:'text-blue-600',    icon:FilePlus,      bg:'bg-blue-50 dark:bg-blue-950/20'     },
  comment:   { label:'Commentée',  color:'text-purple-600',  icon:MessageSquare, bg:'bg-purple-50 dark:bg-purple-950/20' },
};

const LIVRAISON_CFG: Record<string, { label:string; color:string }> = {
  'En Pharmacie':     { label:'En Pharmacie', color:'text-slate-600'  },
  'Livraison Gratuite':{ label:'Gratuite',    color:'text-emerald-600'},
  'Livraison express': { label:'Express',     color:'text-orange-600' },
  'Livraison Standard':{ label:'Standard',    color:'text-blue-600'   },
};

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits:0 }).format(n);

export function OrdonnancesTable({ ordonnances, onView, onStatusChange, isProcessing }: Props) {
  const [expandedId, setExpandedId] = useState<number|null>(null);

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Liste des ordonnances
        </CardTitle>
        <CardDescription>{ordonnances.length} résultat{ordonnances.length>1?'s':''}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Ordonnance</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Pharmacie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordonnances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Aucune ordonnance trouvée
                  </TableCell>
                </TableRow>
              )}

              {ordonnances.map((o, i) => {
                const st  = STATUS_CFG[o.status]    ?? STATUS_CFG.pending;
                const liv = LIVRAISON_CFG[o.statut_livraison] ?? { label: o.statut_livraison, color:'text-slate-500' };
                const isExpanded = expandedId === o.id;
                const StIcon = st.icon;

                return (
                  <>
                    <motion.tr key={o.id}
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: i*0.03 }}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => onView(o)}
                    >
                      {/* Expand */}
                      <TableCell className="w-8 py-3">
                        <button onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : o.id); }}
                          className="text-muted-foreground hover:text-foreground">
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </TableCell>

                      {/* Ordonnance */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${st.bg}`}>
                            <StIcon className={`h-4 w-4 ${st.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{o.numero}</p>
                            <p className="text-xs text-muted-foreground">#{o.id}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Patient */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {o.patient?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{o.patient}</p>
                            {o.age_patient && (
                              <p className="text-xs text-muted-foreground">{o.age_patient} ans</p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Pharmacie */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate max-w-32.5">{o.pharmacie?.name ?? '—'}</span>
                        </div>
                      </TableCell>

                      {/* Statut */}
                      <TableCell className="py-3">
                        <Badge className={`gap-1 border-0 ${st.bg} ${st.color} hover:${st.bg}`}>
                          <StIcon className="h-3 w-3" />
                          {st.label}
                        </Badge>
                      </TableCell>

                      {/* Livraison */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Truck className={`h-3.5 w-3.5 ${liv.color}`} />
                          <span className={`text-xs font-medium ${liv.color}`}>{liv.label}</span>
                        </div>
                      </TableCell>

                      {/* Montant */}
                      <TableCell className="py-3">
                        <p className="font-bold text-sm">{fmt(Number(o.total))} <span className="text-xs font-normal text-muted-foreground">GNF</span></p>
                        {o.frais_livraison && Number(o.frais_livraison) > 0 && (
                          <p className="text-xs text-muted-foreground">+{fmt(Number(o.frais_livraison))} livr.</p>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3">
                        <p className="text-sm">{o.date_ord ? new Date(o.date_ord).toLocaleDateString('fr-FR') : '—'}</p>
                        {o.created_at && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                          </p>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(o)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                                <DropdownMenuItem key={key}
                                  disabled={o.status === key || isProcessing}
                                  onClick={() => onStatusChange(o, key)}
                                  className={`gap-2 ${o.status===key ? 'opacity-50' : ''}`}>
                                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                                  {cfg.label}
                                  {o.status === key && <span className="ml-auto text-xs">(actuel)</span>}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>

                    {/* Ligne expandable */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr key={`exp-${o.id}`}>
                          <td colSpan={9} className="p-0">
                            <motion.div
                              initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                              exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
                              className="overflow-hidden">
                              <div className="px-6 py-4 bg-muted/20 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <User className="h-3 w-3" /> Prescrit par
                                  </p>
                                  <p className="text-sm font-medium">{o.user?.nom ?? '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    <Package className="h-3 w-3" /> Produits
                                  </p>
                                  <p className="text-sm font-medium">{(o as any).produits_count ?? o.produits?.length ?? '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Coordonnées livraison</p>
                                  <p className="text-sm font-mono truncate">{o.coordonees_livraison || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Commentaire</p>
                                  <p className="text-sm">{o.commentaire || o.feedback || '—'}</p>
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
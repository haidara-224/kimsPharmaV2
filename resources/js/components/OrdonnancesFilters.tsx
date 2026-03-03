import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface Props {
  search: string;           onSearchChange: (v:string) => void;
  statusFilter: string;     onStatusChange: (v:string) => void;
  livraisonFilter: string;  onLivraisonChange: (v:string) => void;
  resultCount: number;
}

export function OrdonnancesFilters({ search, onSearchChange, statusFilter, onStatusChange, livraisonFilter, onLivraisonChange, resultCount }: Props) {
  const hasFilters = search || statusFilter !== 'all' || livraisonFilter !== 'all';
  const reset = () => { onSearchChange(''); onStatusChange('all'); onLivraisonChange('all'); };

  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
      className="bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Numéro, patient, pharmacie…" value={search}
            onChange={e => onSearchChange(e.target.value)} className="pl-10 pr-9" />
          {search && (
            <button onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="processed">Traitées</SelectItem>
            <SelectItem value="rejected">Rejetées</SelectItem>
            <SelectItem value="to_create">À créer</SelectItem>
            <SelectItem value="comment">Commentées</SelectItem>
          </SelectContent>
        </Select>

        <Select value={livraisonFilter} onValueChange={onLivraisonChange}>
          <SelectTrigger className="w-full lg:w-48"><SelectValue placeholder="Livraison" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les livraisons</SelectItem>
            <SelectItem value="En Pharmacie">En Pharmacie</SelectItem>
            <SelectItem value="Livraison Gratuite">Livraison Gratuite</SelectItem>
            <SelectItem value="Livraison express">Livraison Express</SelectItem>
            <SelectItem value="Livraison Standard">Livraison Standard</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Réinitialiser
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{resultCount} résultat{resultCount>1?'s':''}</span>
          {search && <Badge variant="secondary" className="gap-1 text-xs">"{search}" <button onClick={()=>onSearchChange('')}>×</button></Badge>}
          {statusFilter!=='all' && <Badge variant="secondary" className="gap-1 text-xs">{statusFilter} <button onClick={()=>onStatusChange('all')}>×</button></Badge>}
          {livraisonFilter!=='all' && <Badge variant="secondary" className="gap-1 text-xs">{livraisonFilter} <button onClick={()=>onLivraisonChange('all')}>×</button></Badge>}
        </div>
      )}
    </motion.div>
  );
}
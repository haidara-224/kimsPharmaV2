import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface PharmaciesFiltersProps {
  searchTerm: string;            onSearchChange: (v: string) => void;
  statusFilter: string;          onStatusFilterChange: (v: string) => void;
  dispoFilter: string;           onDispoFilterChange: (v: string) => void;
  blockFilter: string;           onBlockFilterChange: (v: string) => void;
  resultCount: number;
}

export function PharmaciesFilters({
  searchTerm, onSearchChange,
  statusFilter, onStatusFilterChange,
  dispoFilter, onDispoFilterChange,
  blockFilter, onBlockFilterChange,
  resultCount,
}: PharmaciesFiltersProps) {
  const hasFilters = searchTerm || statusFilter !== 'all' || dispoFilter !== 'all' || blockFilter !== 'all';
  const resetAll = () => { onSearchChange(''); onStatusFilterChange('all'); onDispoFilterChange('all'); onBlockFilterChange('all'); };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Nom, adresse, téléphone…" value={searchTerm}
            onChange={e => onSearchChange(e.target.value)} className="pl-10 pr-9" />
          {searchTerm && (
            <button onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="inactive">Inactives</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dispoFilter} onValueChange={onDispoFilterChange}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Disponibilité" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="open">Ouvertes</SelectItem>
            <SelectItem value="closed">Fermées</SelectItem>
          </SelectContent>
        </Select>

        <Select value={blockFilter} onValueChange={onBlockFilterChange}>
          <SelectTrigger className="w-full lg:w-40"><SelectValue placeholder="Blocage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Non bloquées</SelectItem>
            <SelectItem value="blocked">Bloquées</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetAll} className="gap-1.5 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Réinitialiser
          </Button>
        )}
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{resultCount} résultat{resultCount > 1 ? 's' : ''}</span>
          {searchTerm && <Badge variant="secondary" className="gap-1 text-xs">"{searchTerm}" <button onClick={() => onSearchChange('')}>×</button></Badge>}
          {statusFilter !== 'all' && <Badge variant="secondary" className="gap-1 text-xs">{statusFilter === 'active' ? 'Actives' : 'Inactives'} <button onClick={() => onStatusFilterChange('all')}>×</button></Badge>}
          {dispoFilter  !== 'all' && <Badge variant="secondary" className="gap-1 text-xs">{dispoFilter === 'open' ? 'Ouvertes' : 'Fermées'} <button onClick={() => onDispoFilterChange('all')}>×</button></Badge>}
          {blockFilter  !== 'all' && <Badge variant="secondary" className="gap-1 text-xs">{blockFilter === 'blocked' ? 'Bloquées' : 'Non bloquées'} <button onClick={() => onBlockFilterChange('all')}>×</button></Badge>}
        </div>
      )}
    </motion.div>
  );
}
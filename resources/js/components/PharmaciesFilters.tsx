import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface PharmaciesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dispoFilter: string;
  onDispoFilterChange: (value: string) => void;
}

export function PharmaciesFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dispoFilter,
  onDispoFilterChange,
}: PharmaciesFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, adresse, téléphone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Filtre par statut */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="inactive">Inactives</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtre par disponibilité */}
        <Select value={dispoFilter} onValueChange={onDispoFilterChange}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Disponibilité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="open">Ouvertes</SelectItem>
            <SelectItem value="closed">Fermées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtres actifs */}
      {(searchTerm || statusFilter !== 'all' || dispoFilter !== 'all') && (
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <span>Filtres actifs :</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Recherche: "{searchTerm}"
              <button onClick={() => onSearchChange('')}>×</button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Statut: {statusFilter === 'active' ? 'Actives' : 'Inactives'}
              <button onClick={() => onStatusFilterChange('all')}>×</button>
            </Badge>
          )}
          {dispoFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Disponibilité: {dispoFilter === 'open' ? 'Ouvertes' : 'Fermées'}
              <button onClick={() => onDispoFilterChange('all')}>×</button>
            </Badge>
          )}
        </div>
      )}
    </motion.div>
  );
}
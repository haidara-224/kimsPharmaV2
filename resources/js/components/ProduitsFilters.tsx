import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface Props {
  search:string; onSearchChange:(v:string)=>void;
  categorieFilter:string; onCategorieChange:(v:string)=>void;
  categories:string[]; resultCount:number;
}

export function ProduitsFilters({ search, onSearchChange, categorieFilter, onCategorieChange, categories, resultCount }: Props) {
  const hasFilters = search || categorieFilter !== 'all';
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
      className="bg-white dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4"/>
          <Input placeholder="Nom, catégorie, forme, dosage…" value={search}
            onChange={e=>onSearchChange(e.target.value)} className="pl-10 pr-9"/>
          {search && (
            <button onClick={()=>onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5"/>
            </button>
          )}
        </div>
        <Select value={categorieFilter} onValueChange={onCategorieChange}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Catégorie"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground"
            onClick={() => { onSearchChange(''); onCategorieChange('all'); }}>
            <X className="h-3.5 w-3.5"/> Réinitialiser
          </Button>
        )}
      </div>
      {hasFilters && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground"/>
          <span className="text-xs text-muted-foreground">{resultCount} résultat{resultCount>1?'s':''}</span>
          {search && <Badge variant="secondary" className="gap-1 text-xs">"{search}" <button onClick={()=>onSearchChange('')}>×</button></Badge>}
          {categorieFilter!=='all' && <Badge variant="secondary" className="gap-1 text-xs">{categorieFilter} <button onClick={()=>onCategorieChange('all')}>×</button></Badge>}
        </div>
      )}
    </motion.div>
  );
}
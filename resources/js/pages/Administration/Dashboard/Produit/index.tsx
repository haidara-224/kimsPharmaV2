import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { Produit } from '@/types';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { ProduitsHeader } from '@/components/ProduitsHeader';
import { ProduitsStats } from '@/components/ProduitsStats';
import { ProduitsFilters } from '@/components/ProduitsFilters';
import { ProduitsGrid } from '@/components/ProduitsGrid';
import { ProduitDrawer } from '@/components/ProduitDrawer';
import { ProduitFormModal } from '@/components/ProduitFormModal';
import { DeleteProduitDialog } from '@/components/DeleteProduitDialog';

interface Stats {
  total: number; categories: number; avec_forme: number; avec_dosage: number;
  top_categories: { name: string; count: number }[];
}
interface Paginated {
  data: Produit[]; current_page: number; last_page: number;
  per_page: number; total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

export default function ProduitsPage({ produits, stats }: { produits: Paginated; stats: Stats }) {
  const [search, setSearch]             = useState('');
  const [categorieFilter, setCategorie] = useState('all');
  const [selectedProduit, setSelected]  = useState<Produit | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [formOpen, setFormOpen]         = useState(false);
  const [editTarget, setEditTarget]     = useState<Produit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Produit | null>(null);
  const [isProcessing, setProcessing]   = useState(false);

  const allCategories = [...new Set(produits.data.map(p => p.categorie).filter(Boolean))];

  const filtered = produits.data.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.produit?.toLowerCase().includes(q) ||
      p.categorie?.toLowerCase().includes(q) ||
      p.sous_categorie?.toLowerCase().includes(q) ||
      p.forme?.toLowerCase().includes(q) ||
      p.dosage?.toLowerCase().includes(q);
    const matchCat = categorieFilter === 'all' || p.categorie === categorieFilter;
    return matchSearch && matchCat;
  });

  const openView = (p: Produit) => { setSelected(p); setDrawerOpen(true); };
  const openEdit = (p: Produit) => { setEditTarget(p); setFormOpen(true); };
  const openCreate = () => { setEditTarget(null); setFormOpen(true); };

  const handleDelete = (p: Produit) => setDeleteTarget(p);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setProcessing(true);
    router.delete(`/dashboard/Administration/Dashboard/produits/${deleteTarget.id}`, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => { toast.success('Produit supprimé'); setDeleteTarget(null); },
      onError:   () => toast.error('Erreur lors de la suppression'),
      onFinish:  () => setProcessing(false),
    });
  };

  const handlePageChange = (url: string | null) => {
    if (url) router.get(url, {}, { preserveState: true, preserveScroll: true });
  };

  return (
    <AppLayout>
      <Head title="Gestion des Produits" />
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 space-y-6">

          <ProduitsHeader total={produits.total} produits={filtered} onAdd={openCreate} />
          <ProduitsStats stats={stats} />
          <ProduitsFilters
            search={search} onSearchChange={setSearch}
            categorieFilter={categorieFilter} onCategorieChange={setCategorie}
            categories={allCategories} resultCount={filtered.length}
          />
          <ProduitsGrid
            produits={filtered}
            onView={openView} onEdit={openEdit} onDelete={handleDelete}
          />

          {produits.last_page > 1 && (
            <div className="flex justify-center">
              <PaginationBar
                links={produits.links} currentPage={produits.current_page}
                lastPage={produits.last_page} onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <ProduitDrawer produit={selectedProduit} open={drawerOpen}
        onClose={() => setDrawerOpen(false)} onEdit={openEdit} />

      <ProduitFormModal open={formOpen} produit={editTarget}
        onClose={() => setFormOpen(false)} />

      <DeleteProduitDialog produit={deleteTarget} open={!!deleteTarget}
        onOpenChange={v => !v && setDeleteTarget(null)}
        onConfirm={confirmDelete} isProcessing={isProcessing} />
    </AppLayout>
  );
}

function PaginationBar({ links, currentPage, lastPage, onPageChange }: {
  links: { url: string|null; label: string; active: boolean }[];
  currentPage: number; lastPage: number; onPageChange: (url: string|null) => void;
}) {
  const prev = links.find(l => l.label.includes('Previous') || l.label.includes('réc'));
  const next = links.find(l => l.label.includes('Next') || l.label.includes('uiv'));
  const pages: (number|'...')[] = [];
  for (let i=1; i<=lastPage; i++) {
    if (i===1||i===lastPage||Math.abs(i-currentPage)<=2) pages.push(i);
    else if (pages[pages.length-1]!=='...') pages.push('...');
  }
  return (
    <nav className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-9 w-9"
        onClick={() => onPageChange(prev?.url??null)} disabled={!prev?.url}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p,i) => p==='...'
        ? <Button key={`d${i}`} variant="ghost" size="icon" className="h-9 w-9" disabled><MoreHorizontal className="h-4 w-4"/></Button>
        : <Button key={p} size="sm" variant={p===currentPage?'default':'outline'} className="h-9 min-w-9"
            onClick={()=>onPageChange(links.find(l=>l.label===String(p))?.url??null)}>{p}</Button>
      )}
      <Button variant="outline" size="icon" className="h-9 w-9"
        onClick={() => onPageChange(next?.url??null)} disabled={!next?.url}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
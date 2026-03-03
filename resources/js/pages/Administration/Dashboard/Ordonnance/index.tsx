import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { Ordonnance } from '@/types';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { OrdonnancesHeader } from '@/components/OrdonnancesHeader';
import { OrdonnancesStats } from '@/components/OrdonnancesStats';
import { OrdonnancesFilters } from '@/components/OrdonnancesFilters';
import { OrdonnancesTable } from '@/components/OrdonnancesTable';
import { OrdonnanceDrawer } from '@/components/OrdonnanceDrawer';

interface Stats {
  total: number; pending: number; processed: number; rejected: number;
  to_create: number; comment: number;
  ca_total: number; ca_mois: number;
  en_pharmacie: number; livraison_express: number;
  livraison_standard: number; livraison_gratuite: number;
}

interface PaginatedOrdonnances {
  data: Ordonnance[];
  current_page: number; last_page: number;
  per_page: number; total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

export default function OrdonnancesPage({
  ordonnances, stats,
}: { ordonnances: PaginatedOrdonnances; stats: Stats }) {

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState('all');
  const [livraisonFilter, setLivraison] = useState('all');
  const [selectedOrd, setSelectedOrd] = useState<Ordonnance | null>(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [isProcessing, setProcessing] = useState(false);


  const filtered = ordonnances.data.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.numero?.toLowerCase().includes(q) ||
      o.patient?.toLowerCase().includes(q) ||
      o.pharmacie?.name?.toLowerCase().includes(q);
    const matchStatus   = statusFilter   === 'all' || o.status === statusFilter;
    const matchLivraison = livraisonFilter === 'all' || o.statut_livraison === livraisonFilter;
    return matchSearch && matchStatus && matchLivraison;
  });

  const updateStatus = (o: Ordonnance, status: string) => {
    setProcessing(true);
    router.post('/dashboard/Administration/Dashboard/ordonnances/status'), { id: o.id, status }, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => toast.success('Statut mis à jour'),
      onError:   (e: { [s: string]: unknown; } | ArrayLike<unknown>) => toast.error(Object.values(e)[0] as string ?? 'Erreur'),
      onFinish:  () => setProcessing(false),
    };
  };

  const openDrawer = (o: Ordonnance) => { setSelectedOrd(o); setDrawerOpen(true); };

  const handlePageChange = (url: string | null) => {
    if (url) router.get(url, {}, { preserveState: true, preserveScroll: true });
  };

  return (
    <AppLayout>
      <Head title="Gestion des Ordonnances" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 space-y-6">

          <OrdonnancesHeader total={ordonnances.total} ordonnances={filtered} />
          <OrdonnancesStats stats={stats} />
          <OrdonnancesFilters
            search={search}            onSearchChange={setSearch}
            statusFilter={statusFilter} onStatusChange={setStatus}
            livraisonFilter={livraisonFilter} onLivraisonChange={setLivraison}
            resultCount={filtered.length}
          />
          <OrdonnancesTable
            ordonnances={filtered}
            onView={openDrawer}
            onStatusChange={updateStatus}
            isProcessing={isProcessing}
          />

          {ordonnances.last_page > 1 && (
            <div className="flex justify-center">
              <PaginationBar
                links={ordonnances.links}
                currentPage={ordonnances.current_page}
                lastPage={ordonnances.last_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <OrdonnanceDrawer
        ordonnance={selectedOrd}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onStatusChange={updateStatus}
        isProcessing={isProcessing}
      />
    </AppLayout>
  );
}

function PaginationBar({ links, currentPage, lastPage, onPageChange }: {
  links: { url: string | null; label: string; active: boolean }[];
  currentPage: number; lastPage: number;
  onPageChange: (url: string | null) => void;
}) {
  const prev = links.find(l => l.label.includes('Previous') || l.label.includes('réc'));
  const next = links.find(l => l.label.includes('Next')     || l.label.includes('uiv'));
  const pages: (number | '...')[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || Math.abs(i - currentPage) <= 2) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }
  return (
    <nav className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-9 w-9"
        onClick={() => onPageChange(prev?.url ?? null)} disabled={!prev?.url}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, i) => p === '...'
        ? <Button key={`d${i}`} variant="ghost" size="icon" className="h-9 w-9" disabled><MoreHorizontal className="h-4 w-4" /></Button>
        : <Button key={p} size="sm" variant={p === currentPage ? 'default' : 'outline'} className="h-9 min-w-[36px]"
            onClick={() => onPageChange(links.find(l => l.label === String(p))?.url ?? null)}>{p}</Button>
      )}
      <Button variant="outline" size="icon" className="h-9 w-9"
        onClick={() => onPageChange(next?.url ?? null)} disabled={!next?.url}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
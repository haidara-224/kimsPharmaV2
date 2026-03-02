import { motion } from 'framer-motion';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from "@/layouts/app-layout";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Pharmacie } from '@/types';
import { PharmaciesHeader }  from '@/components/PharmaciesHeader';
import { PharmaciesStats }   from '@/components/PharmaciesStats';
import { PharmaciesFilters } from '@/components/PharmaciesFilters';
import { PharmaciesTable }   from '@/components/PharmaciesTable';
import { PharmaciesMap }     from '@/components/PharmaciesMap';
import { BlockConfirmDialog } from '@/components/BlockConfirmDialog';
import { DeleteConfirmDialog } from '@/components/eleteConfirmDialog';


interface PaginatedPharmacies {
  data: Pharmacie[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

export default function Pharmacies({ pharmacies }: { pharmacies: PaginatedPharmacies }) {
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dispoFilter, setDispoFilter]   = useState('all');
  const [blockFilter, setBlockFilter]   = useState('all');
  const [selectedPharmacie, setSelectedPharmacie] = useState<Pharmacie | null>(null);
  const [highlightedId, setHighlightedId]         = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = pharmacies.data.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) ||
      p.adresse?.toLowerCase().includes(q) || p.tel?.includes(q);
    const matchStatus = statusFilter === 'all' || p.statut === statusFilter;
    const matchDispo  = dispoFilter  === 'all' || p.disponibilite === dispoFilter;
    const matchBlock  = blockFilter  === 'all' ||
      (blockFilter === 'blocked' ? p.is_blocked : !p.is_blocked);
    return matchSearch && matchStatus && matchDispo && matchBlock;
  });

  const post = (url: string, data: object, msg: string, errMsg: string, onDone?: () => void) => {
    setIsProcessing(true);
    router.post(url, data, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => { toast.success(msg); onDone?.(); },
      onError:   () => toast.error(errMsg),
      onFinish:  () => setIsProcessing(false),
    });
  };

  const handleStatusChange = (p: Pharmacie, s: string) =>
    post('/dashboard/Administration/Dashboard/pharmacies/status', { id: p.id, statut: s },
      `Pharmacie ${s === 'active' ? 'activée' : 'désactivée'}`, 'Erreur statut');

  const handleDispoChange = (p: Pharmacie, d: string) =>
    post('/dashboard/Administration/Dashboard/pharmacies/disponibilite', { id: p.id, disponibilite: d },
      `Pharmacie ${d === 'open' ? 'ouverte' : 'fermée'}`, 'Erreur disponibilité');

  const handleBlockToggle = (p: Pharmacie) => { setSelectedPharmacie(p); setIsBlockDialogOpen(true); };
  const confirmBlock = () => {
    if (!selectedPharmacie) return;
    post('/dashboard/Administration/Dashboard/pharmacies/block', { id: selectedPharmacie.id, is_blocked: !selectedPharmacie.is_blocked },
      selectedPharmacie.is_blocked ? 'Pharmacie débloquée' : 'Pharmacie bloquée',
      'Erreur', () => setIsBlockDialogOpen(false));
  };

  const handleDelete = (p: Pharmacie) => { setSelectedPharmacie(p); setIsDeleteDialogOpen(true); };
  const confirmDelete = () => {
    if (!selectedPharmacie) return;
    setIsProcessing(true);
    router.delete(`/dashboard/Administration/Dashboard/pharmacies/${selectedPharmacie.id}`, {
      preserveState: true, preserveScroll: true,
      onSuccess: () => { toast.success('Supprimée'); setIsDeleteDialogOpen(false); },
      onError:   () => toast.error('Erreur suppression'),
      onFinish:  () => { setIsProcessing(false); setSelectedPharmacie(null); },
    });
  };

  const handleRowClick = (p: Pharmacie) =>
    setHighlightedId(prev => prev === p.id ? null : p.id);

  const handlePageChange = (url: string | null) => {
    if (url) router.get(url, {}, { preserveState: true, preserveScroll: true });
  };

  return (
    <AppLayout>
      <Head title="Gestion des Pharmacies" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8 space-y-6">


<PharmaciesHeader total={pharmacies.total} pharmacies={filtered} />
          <PharmaciesStats  pharmacies={pharmacies.data} />
          <PharmaciesFilters
            searchTerm={searchTerm}      onSearchChange={setSearchTerm}
            statusFilter={statusFilter}  onStatusFilterChange={setStatusFilter}
            dispoFilter={dispoFilter}    onDispoFilterChange={setDispoFilter}
            blockFilter={blockFilter}    onBlockFilterChange={setBlockFilter}
            resultCount={filtered.length}
          />

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3">
              <PharmaciesTable
                pharmacies={filtered}
                highlightedId={highlightedId}
                onRowClick={handleRowClick}
                onStatusChange={handleStatusChange}
                onDispoChange={handleDispoChange}
                onBlockToggle={handleBlockToggle}
                onDelete={handleDelete}
                isProcessing={isProcessing}
              />
            </div>
            <div className="xl:col-span-2">
              <PharmaciesMap
                pharmacies={filtered}
                highlightedId={highlightedId}
                onMarkerClick={setHighlightedId}
              />
            </div>
          </div>

          {pharmacies.last_page > 1 && (
            <div className="flex justify-center pt-2">
              <PaginationBar
                links={pharmacies.links}
                currentPage={pharmacies.current_page}
                lastPage={pharmacies.last_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}
        pharmacie={selectedPharmacie} onConfirm={confirmDelete} isProcessing={isProcessing} />
      <BlockConfirmDialog  open={isBlockDialogOpen}  onOpenChange={setIsBlockDialogOpen}
        pharmacie={selectedPharmacie} onConfirm={confirmBlock}  isProcessing={isProcessing} />
    </AppLayout>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
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
      {pages.map((p, i) =>
        p === '...' ? (
          <Button key={`d${i}`} variant="ghost" size="icon" className="h-9 w-9" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button key={p} size="sm"
            variant={p === currentPage ? 'default' : 'outline'}
            className="h-9 min-w-[36px]"
            onClick={() => onPageChange(links.find(l => l.label === String(p))?.url ?? null)}>
            {p}
          </Button>
        )
      )}
      <Button variant="outline" size="icon" className="h-9 w-9"
        onClick={() => onPageChange(next?.url ?? null)} disabled={!next?.url}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
import { motion } from 'framer-motion';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from "@/layouts/app-layout";

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Pharmacie } from '@/types';
import { PharmaciesHeader } from '@/components/PharmaciesHeader';
import { PharmaciesStats } from '@/components/PharmaciesStats';
import { PharmaciesFilters } from '@/components/PharmaciesFilters';
import { PharmaciesTable } from '@/components/PharmaciesTable';
import { PharmaciesMap } from '@/components/PharmaciesMap';
import { DeleteConfirmDialog } from '@/components/eleteConfirmDialog';
import { BlockConfirmDialog } from '@/components/BlockConfirmDialog';

interface PharmaciesProps {
  pharmacies: {
    data: Pharmacie[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export default function Pharmacies({ pharmacies }: PharmaciesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dispoFilter, setDispoFilter] = useState<string>('all');
  const [selectedPharmacie, setSelectedPharmacie] = useState<Pharmacie | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtrer les pharmacies
  const filteredPharmacies = pharmacies.data.filter(pharmacie => {
    const matchesSearch = pharmacie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacie.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacie.tel?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || pharmacie.statut === statusFilter;
    const matchesDispo = dispoFilter === 'all' || pharmacie.disponibilite === dispoFilter;
    
    return matchesSearch && matchesStatus && matchesDispo;
  });

  // Changer le statut (activer/désactiver)
  const handleStatusChange = (pharmacie: Pharmacie, newStatus: string) => {
    setIsProcessing(true);
    
    router.post('admin.pharmacies.status', { id: pharmacie.id, statut: newStatus }, {
      onSuccess: () => {
        toast.success(`Pharmacie ${newStatus === 'active' ? 'activée' : 'désactivée'} avec succès`);
      },
      onError: () => {
        toast.error("Erreur lors du changement de statut");
      },
      onFinish: () => {
        setIsProcessing(false);
      }
    });
  };

  // Changer la disponibilité (ouvert/fermé)
  const handleDispoChange = (pharmacie: Pharmacie, newDispo: string) => {
    setIsProcessing(true);
    
    router.post('admin.pharmacies.disponibilite', { id: pharmacie.id, disponibilite: newDispo }, {
      onSuccess: () => {
        toast.success(`Pharmacie ${newDispo === 'open' ? 'ouverte' : 'fermée'} avec succès`);
      },
      onError: () => {
        toast.error("Erreur lors du changement de disponibilité");
      },
      onFinish: () => {
        setIsProcessing(false);
      }
    });
  };

  // Bloquer/Débloquer une pharmacie
  const handleBlockToggle = (pharmacie: Pharmacie) => {
    setSelectedPharmacie(pharmacie);
    setIsBlockDialogOpen(true);
  };

  const confirmBlockToggle = () => {
    if (!selectedPharmacie) return;
    
    setIsProcessing(true);
    
    router.post('admin.pharmacies.block', { id: selectedPharmacie.id, is_blocked: !selectedPharmacie.is_blocked }, {
      onSuccess: () => {
        toast.success(
          selectedPharmacie.is_blocked 
            ? "Pharmacie débloquée avec succès" 
            : "Pharmacie bloquée avec succès"
        );
        setIsBlockDialogOpen(false);
      },
      onError: () => {
        toast.error("Erreur lors de l'opération");
      },
      onFinish: () => {
        setIsProcessing(false);
        setSelectedPharmacie(null);
      }
    });
  };

  // Supprimer une pharmacie
  const handleDelete = (pharmacie: Pharmacie) => {
    setSelectedPharmacie(pharmacie);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedPharmacie) return;
    
    setIsProcessing(true);
    
  router.delete(`/admin/pharmacies/${selectedPharmacie.id}`, {
    onSuccess: () => {
        toast.success("Pharmacie supprimée avec succès");
        setIsDeleteDialogOpen(false);
    },
    onError: () => {
        toast.error("Erreur lors de la suppression");
    },
    onFinish: () => {
        setIsProcessing(false);
        setSelectedPharmacie(null);
    }
});
  };

  return (
    <AppLayout>
      <Head title="Gestion des Pharmacies" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          
          {/* En-tête */}
          <PharmaciesHeader total={pharmacies.total} />

          {/* Statistiques */}
          <PharmaciesStats pharmacies={pharmacies.data} />

          {/* Filtres */}
          <PharmaciesFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dispoFilter={dispoFilter}
            onDispoFilterChange={setDispoFilter}
          />

          {/* Tableau des pharmacies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <PharmaciesTable
                pharmacies={filteredPharmacies}
                onStatusChange={handleStatusChange}
                onDispoChange={handleDispoChange}
                onBlockToggle={handleBlockToggle}
                onDelete={handleDelete}
                isProcessing={isProcessing}
              />
            </div>
            <div>
              <PharmaciesMap pharmacies={filteredPharmacies} />
            </div>
          </div>

          {/* Pagination */}
          {pharmacies.last_page > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination 
                currentPage={pharmacies.current_page}
                totalPages={pharmacies.last_page}
                onPageChange={(page:any) => {
                  router.get('admin.pharmacies.index', { page });
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dialogues de confirmation */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        pharmacie={selectedPharmacie}
        onConfirm={confirmDelete}
        isProcessing={isProcessing}
      />

      <BlockConfirmDialog
        open={isBlockDialogOpen}
        onOpenChange={setIsBlockDialogOpen}
        pharmacie={selectedPharmacie}
        onConfirm={confirmBlockToggle}
        isProcessing={isProcessing}
      />
    </AppLayout>
  );
}

// Composant Pagination
const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pages.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
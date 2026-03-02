import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Eye,
  Edit,
  Ban,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Users,
  FileText,
  Package,
  Unlock,
  Building2,
} from 'lucide-react';
import { Pharmacie } from '@/types';

interface PharmaciesTableProps {
  pharmacies: Pharmacie[];
  onStatusChange: (pharmacie: Pharmacie, status: string) => void;
  onDispoChange: (pharmacie: Pharmacie, dispo: string) => void;
  onBlockToggle: (pharmacie: Pharmacie) => void;
  onDelete: (pharmacie: Pharmacie) => void;
  isProcessing: boolean;
}

export function PharmaciesTable({
  pharmacies,
  onStatusChange,
  onDispoChange,
  onBlockToggle,
  onDelete,
  isProcessing,
}: PharmaciesTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const getDispoBadge = (disponibilite: string) => {
    switch (disponibilite) {
      case 'open':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Ouverte</Badge>;
      case 'closed':
        return <Badge variant="destructive">Fermée</Badge>;
      default:
        return <Badge variant="outline">{disponibilite}</Badge>;
    }
  };

  const getBlockedBadge = (is_blocked: boolean) => {
    return is_blocked ? (
      <Badge variant="destructive" className="gap-1">
        <Ban className="h-3 w-3" />
        Bloquée
      </Badge>
    ) : null;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Liste des pharmacies
        </CardTitle>
        <CardDescription>
          {pharmacies.length} pharmacie(s) trouvée(s)
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Pharmacie</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Disponibilité</TableHead>
                <TableHead>Statistiques</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pharmacies.map((pharmacie, index) => (
                <motion.tr
                  key={pharmacie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src={pharmacie.logo ? `/storage/${pharmacie.logo}` : ''} />
                        <AvatarFallback className="bg-primary/10">
                          {pharmacie.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{pharmacie.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pharmacie.adresse || 'Adresse non renseignée'}
                        </p>
                        {getBlockedBadge(pharmacie.is_blocked)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {pharmacie.tel || 'Non renseigné'}
                      </p>
                    
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      {getStatusBadge(pharmacie.statut)}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pharmacie.statut === 'active'}
                          onCheckedChange={(checked) => 
                            onStatusChange(pharmacie, checked ? 'active' : 'inactive')
                          }
                          disabled={isProcessing || pharmacie.is_blocked}
                        />
                        <span className="text-xs text-muted-foreground">
                          {pharmacie.statut === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-2">
                      {getDispoBadge(pharmacie.disponibilite)}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pharmacie.disponibilite === 'open'}
                          onCheckedChange={(checked) => 
                            onDispoChange(pharmacie, checked ? 'open' : 'closed')
                          }
                          disabled={isProcessing || pharmacie.is_blocked || pharmacie.statut !== 'active'}
                        />
                        <span className="text-xs text-muted-foreground">
                          {pharmacie.disponibilite === 'open' ? 'Ouvert' : 'Fermé'}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                 

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onBlockToggle(pharmacie)}
                          className={pharmacie.is_blocked ? 'text-green-600' : 'text-orange-600'}
                        >
                          {pharmacie.is_blocked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Débloquer
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              Bloquer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(pharmacie)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
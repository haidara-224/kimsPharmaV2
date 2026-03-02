import AppLayout from '@/layouts/phamacie-layout';
import { Head, Link, router } from '@inertiajs/react';
import type { BreadcrumbItem, Ordonnance } from '@/types';
import { 
  Search,
  Filter,
  MoreVertical,
  Eye,
  FileText,
  Download,
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Calendar as CalendarIcon,
  User,
  Package,
  DollarSign,
  MapPin,
  MessageSquare,
  RefreshCw,
  Plus,
  Mail,
  FileDown,
  BarChart,
  Send,
  Edit,
  Trash2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Pencil,
  Archive
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Composants de génération de PDF
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { OrdonnanceReportPDF } from '@/components/raports/OrdonnanceReportPDF';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard'
    },
    {
        title: 'Ordonnances',
        href: ''
    },
];

interface IndexProps {
    ordonnance: {
        data: Ordonnance[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    pharmacie: {
        name: string;
        address: string;
        phone: string;
        email: string;
    };
}

const formatGNF = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'GNF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Fonctions pour les nouveaux statuts
const getStatusBadge = (status: string) => {
    switch(status) {
        case 'processed':
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Traitée
                </Badge>
            );
        case 'pending':
            return (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
                    <Clock className="h-3 w-3 mr-1" />
                    En attente
                </Badge>
            );
        case 'rejected':
            return (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejetée
                </Badge>
            );
        case 'to_create':
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                    <Edit className="h-3 w-3 mr-1" />
                    À créer
                </Badge>
            );
        case 'comment':
            return (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Commentaire
                </Badge>
            );
        default:
            return (
                <Badge variant="outline">
                    {status}
                </Badge>
            );
    }
};

const getDeliveryStatusBadge = (status: string) => {
    switch(status) {
        case 'En Pharmacie':
            return (
                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
                    <Package className="h-3 w-3 mr-1" />
                    En Pharmacie
                </Badge>
            );
        case 'Livraison Gratuite':
            return (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                    <Truck className="h-3 w-3 mr-1" />
                    Gratuite
                </Badge>
            );
        case 'Livraison express':
            return (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                    <Send className="h-3 w-3 mr-1" />
                    Express
                </Badge>
            );
        case 'Livraison Standard':
            return (
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
                    <Truck className="h-3 w-3 mr-1" />
                    Standard
                </Badge>
            );
        default:
            return (
                <Badge variant="outline">
                    {status}
                </Badge>
            );
    }
};

// Service de génération de PDF avec jsPDF
const generateJSPDFReport = (ordonnances: Ordonnance[], stats: any, type: string) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(112, 42, 145); // #702a91
    doc.text('Pharmacie Manager Pro', 20, 20);
    
    // Titre du rapport
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    const title = getReportTitle(type);
    doc.text(title, 20, 40);
    
    // Date de génération
    doc.setFontSize(10);
    doc.text(`Généré le: ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 20, 50);
    
    // Statistiques
    doc.setFontSize(12);
    doc.text('Statistiques Générales', 20, 70);
    
    autoTable(doc, {
        startY: 75,
        head: [['Métrique', 'Valeur']],
        body: [
            ['Total Ordonnances', stats.total.toString()],
            ['Traitées', stats.processed.toString()],
            ['En attente', stats.pending.toString()],
            ['À créer', stats.to_create.toString()],
            ['Rejetées', stats.rejected.toString()],
            ['CA Total', formatGNF(stats.totalRevenue)],
            ['CA Moyen', formatGNF(stats.averageRevenue)]
        ],
        theme: 'striped',
        headStyles: { fillColor: [112, 42, 145], textColor: [255, 255, 255] }
    });
    
    // Détail des ordonnances
    if (ordonnances.length > 0) {
        doc.addPage();
        doc.setFontSize(12);
        doc.text('Détail des Ordonnances', 20, 20);
        
        const tableData = ordonnances.map((ordonnance) => [
            format(new Date(ordonnance.date_ord), 'dd/MM/yy', { locale: fr }),
            ordonnance.numero,
            ordonnance.patient.substring(0, 20),
            (ordonnance.produits?.length || 0).toString(),
            formatGNF(ordonnance.total),
            getStatusText(ordonnance.status),
            ordonnance.statut_livraison || '-'
        ]);
        
        autoTable(doc, {
            startY: 30,
            head: [['Date', 'N°', 'Patient', 'Produits', 'Montant', 'Statut', 'Livraison']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [112, 42, 145], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 25 },
                2: { cellWidth: 40 },
                3: { cellWidth: 20 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 },
                6: { cellWidth: 30 }
            },
            margin: { horizontal: 10 }
        });
    }
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} sur ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }
    
    return doc;
};

const getReportTitle = (type: string) => {
    switch(type) {
        case 'daily': return 'Rapport Journalier des Ordonnances';
        case 'weekly': return 'Rapport Hebdomadaire des Ordonnances';
        case 'monthly': return 'Rapport Mensuel des Ordonnances';
        case 'custom': return 'Rapport Personnalisé des Ordonnances';
        default: return 'Rapport des Ordonnances';
    }
};

const getStatusText = (status: string) => {
    switch(status) {
        case 'processed': return 'Traité';
        case 'pending': return 'En attente';
        case 'rejected': return 'Rejeté';
        case 'to_create': return 'À créer';
        case 'comment': return 'Commentaire';
        default: return status;
    }
};

// Fonction pour filtrer par période
const filterOrdonnancesByPeriod = (ordonnances: Ordonnance[], type: string, startDate?: Date, endDate?: Date) => {
    let filtered = [...ordonnances];
    
    if (type === 'custom' && startDate && endDate) {
        filtered = filtered.filter(ordonnance => {
            const ordDate = new Date(ordonnance.date_ord);
            return ordDate >= startDate && ordDate <= endDate;
        });
    } else if (type !== 'all') {
        const now = new Date();
        let periodStart = new Date();
        
        switch(type) {
            case 'daily':
                periodStart.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                periodStart = new Date(now.setDate(now.getDate() - now.getDay()));
                periodStart.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }
        
        filtered = filtered.filter(ordonnance => {
            const ordDate = new Date(ordonnance.date_ord);
            return ordDate >= periodStart;
        });
    }
    
    return filtered;
};

export default function Index({ ordonnance, pharmacie }: IndexProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deliveryFilter, setDeliveryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedOrdonnance, setSelectedOrdonnance] = useState<Ordonnance | null>(null);
    const [comment, setComment] = useState('');
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [showPDFPreview, setShowPDFPreview] = useState(false);

    // Filtrer et trier les ordonnances
    const filteredOrdonnances = ordonnance.data.filter(ordonnance => {
        const matchesSearch = search === '' || 
            ordonnance.patient.toLowerCase().includes(search.toLowerCase()) ||
            ordonnance.numero.toLowerCase().includes(search.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || ordonnance.status === statusFilter;
        const matchesDelivery = deliveryFilter === 'all' || ordonnance.statut_livraison === deliveryFilter;
        
        return matchesSearch && matchesStatus && matchesDelivery;
    }).sort((a, b) => {
        switch(sortBy) {
            case 'date_desc':
                return new Date(b.date_ord).getTime() - new Date(a.date_ord).getTime();
            case 'date_asc':
                return new Date(a.date_ord).getTime() - new Date(b.date_ord).getTime();
            case 'total_desc':
                return b.total - a.total;
            case 'total_asc':
                return a.total - b.total;
            default:
                return 0;
        }
    });

    const stats = {
        total: ordonnance.total,
        processed: ordonnance.data.filter(o => o.status === 'processed').length,
        pending: ordonnance.data.filter(o => o.status === 'pending').length,
        rejected: ordonnance.data.filter(o => o.status === 'rejected').length,
        to_create: ordonnance.data.filter(o => o.status === 'to_create').length,
        comment: ordonnance.data.filter(o => o.status === 'comment').length,
        totalRevenue: ordonnance.data.reduce((sum, o) => sum + Number(o.total), 0),
        averageRevenue: ordonnance.data.length > 0 
            ? ordonnance.data.reduce((sum, o) => sum + Number(o.total), 0) / ordonnance.data.length
            : 0
    };

    const handleAddComment = (ordonnance: Ordonnance) => {
        setSelectedOrdonnance(ordonnance);
        setComment(ordonnance.commentaire || '');
        setCommentDialogOpen(true);
    };

    const handleSubmitComment = () => {
        if (selectedOrdonnance) {
            router.post(`/ordonnances/${selectedOrdonnance.id}/comment`, {
                commentaire: comment
            }, {
                onSuccess: () => {
                    setCommentDialogOpen(false);
                    setComment('');
                }
            });
        }
    };

    const handleStatusChange = (ordonnanceId: number, newStatus: string) => {
        router.post(`/ordonnance/${newStatus}/${ordonnanceId}`, {
            status: newStatus
        });
    };

    // Fonctions pour générer les rapports
    const generateQuickReport = (type: 'daily' | 'weekly' | 'monthly') => {
        const filtered = filterOrdonnancesByPeriod(ordonnance.data, type);
        const reportStats = calculateStats(filtered);
        
        const doc = generateJSPDFReport(filtered, reportStats, type);
        doc.save(`rapport-${type}-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.pdf`);
    };

    const generateCustomReport = (type: 'custom', startDate: Date, endDate: Date) => {
        const filtered = filterOrdonnancesByPeriod(ordonnance.data, type, startDate, endDate);
        const reportStats = calculateStats(filtered);
        
        // Préparer les données pour le PDF React
        const data = {
            title: getReportTitle(type),
            startDate: format(startDate, 'dd/MM/yyyy', { locale: fr }),
            endDate: format(endDate, 'dd/MM/yyyy', { locale: fr }),
            ordonnances: filtered,
            stats: reportStats,
            pharmacie
        };
        
        setReportData(data);
        setShowPDFPreview(true);
    };

    const exportSelectionToPDF = () => {
        const doc = generateJSPDFReport(filteredOrdonnances, calculateStats(filteredOrdonnances), 'selection');
        doc.save(`ordonnances-selection-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.pdf`);
    };

    const calculateStats = (ordonnances: Ordonnance[]) => {
        return {
            total: ordonnances.length,
            processed: ordonnances.filter(o => o.status === 'processed').length,
            pending: ordonnances.filter(o => o.status === 'pending').length,
            rejected: ordonnances.filter(o => o.status === 'rejected').length,
            to_create: ordonnances.filter(o => o.status === 'to_create').length,
            comment: ordonnances.filter(o => o.status === 'comment').length,
            totalRevenue: ordonnances.reduce((sum, o) => sum + o.total, 0),
            averageRevenue: ordonnances.length > 0 
                ? ordonnances.reduce((sum, o) => sum + o.total, 0) / ordonnances.length
                : 0
        };
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Ordonnances" />
            
            <div className="space-y-6 p-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Gestion des Ordonnances
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Gérez et suivez toutes les ordonnances de votre pharmacie
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                       
                        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <BarChart className="h-4 w-4" />
                                    Générer Rapport
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-125">
                                <DialogHeader>
                                    <DialogTitle>Générer un rapport</DialogTitle>
                                    <DialogDescription>
                                        Sélectionnez le type de rapport et configurez les paramètres
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="report-type">Type de rapport</Label>
                                        <Select defaultValue="daily">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="daily">Journalier</SelectItem>
                                                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                                <SelectItem value="monthly">Mensuel</SelectItem>
                                                <SelectItem value="custom">Personnalisé</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Options supplémentaires</Label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="include-details"
                                                className="rounded border-gray-300"
                                                defaultChecked
                                            />
                                            <Label htmlFor="include-details" className="text-sm">
                                                Inclure le détail des ordonnances
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button onClick={() => {
                                        generateQuickReport('daily');
                                        setReportDialogOpen(false);
                                    }}>
                                        Générer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => generateQuickReport('daily')}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Rapport Journalier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => generateQuickReport('weekly')}>
                                    <BarChart className="h-4 w-4 mr-2" />
                                    Rapport Hebdomadaire
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => generateQuickReport('monthly')}>
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Rapport Mensuel
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={exportSelectionToPDF}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Exporter Sélection
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.print()}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Imprimer la liste
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.reload()}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Actualiser
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">
                                        Total
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {ordonnance.total}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-600">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">
                                        En attente
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.pending}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-linear-to-br from-yellow-500 to-amber-600">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">
                                        Traitées
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.processed}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-linear-to-br from-green-500 to-emerald-600">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">
                                        À créer
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.to_create}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-600">
                                    <Edit className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">
                                        Rejetées
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.rejected}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-linear-to-br from-red-500 to-red-600">
                                    <XCircle className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-2">
                                        CA Total
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatGNF(stats.totalRevenue)}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-linear-to-br from-green-500 to-emerald-600">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Barre de filtres */}
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Rechercher par patient, numéro..."
                                        className="pl-10"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-45">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="pending">En attente</SelectItem>
                                        <SelectItem value="processed">Traité</SelectItem>
                                        <SelectItem value="rejected">Rejeté</SelectItem>
                                        <SelectItem value="to_create">À créer</SelectItem>
                                        <SelectItem value="comment">Commentaire</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                                    <SelectTrigger className="w-full sm:w-45">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Livraison" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes livraisons</SelectItem>
                                        <SelectItem value="En Pharmacie">En Pharmacie</SelectItem>
                                        <SelectItem value="Livraison Gratuite">Gratuite</SelectItem>
                                        <SelectItem value="Livraison express">Express</SelectItem>
                                        <SelectItem value="Livraison Standard">Standard</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full sm:w-45">
                                        <ArrowUpDown className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Trier par" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date_desc">Date ↓</SelectItem>
                                        <SelectItem value="date_asc">Date ↑</SelectItem>
                                        <SelectItem value="total_desc">Montant ↓</SelectItem>
                                        <SelectItem value="total_asc">Montant ↑</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tableau des ordonnances */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">
                                    Liste des ordonnances
                                </CardTitle>
                                <CardDescription>
                                    {filteredOrdonnances.length} ordonnance(s) trouvée(s)
                                </CardDescription>
                            </div>
                            <div className="text-sm text-gray-500">
                                Page {ordonnance.current_page} sur {ordonnance.last_page}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4" />
                                                Date
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                N° Ordonnance
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Patient
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Médicaments
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Montant
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold">Statut</TableHead>
                                        <TableHead className="font-semibold">Livraison</TableHead>
                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrdonnances.length > 0 ? (
                                        filteredOrdonnances.map((ordonnance) => (
                                            <TableRow key={ordonnance.id} className="hover:bg-gray-50 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {formatDate(ordonnance.date_ord)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {ordonnance.age_patient ? `${ordonnance.age_patient} ans` : 'Âge non précisé'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono font-semibold text-[#702a91]">
                                                        {ordonnance.numero}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {ordonnance.patient}
                                                        </span>
                                                        {ordonnance.user && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Mail className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">
                                                                    {ordonnance.user.email}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {ordonnance.produits?.length || 0} produits
                                                        </Badge>
                                                        {ordonnance.produits && ordonnance.produits.length > 0 && (
                                                            <div className="text-xs text-gray-500">
                                                                {ordonnance.produits[0]?.produit}
                                                                {ordonnance.produits.length > 1 && ` +${ordonnance.produits.length - 1}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold text-gray-900">
                                                        {formatGNF(ordonnance.total)}
                                                    </div>
                                                    {ordonnance.frais_livraison && (
                                                        <div className="text-xs text-gray-500">
                                                            +{formatGNF(ordonnance.frais_livraison)} livraison
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(ordonnance.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {getDeliveryStatusBadge(ordonnance.statut_livraison)}
                                                    {ordonnance.coordonees_livraison && (
                                                        <div className="text-xs text-gray-500 mt-1 truncate max-w-37.5">
                                                            {ordonnance.coordonees_livraison}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/ordonance/${ordonnance.id}`}>
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {/* <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="outline">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                               
                                                                <DropdownMenuItem onClick={() => handleAddComment(ordonnance)}>
                                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                                    Ajouter commentaire
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {ordonnance.status === 'approuve' && (
                                                                    <>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(ordonnance.id, 'approuve')}
                                                                            className="text-green-600"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                            Marquer comme traité
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                                                            onClick={() => handleStatusChange(ordonnance.id, 'rejete')}
                                                                            className="text-red-600"
                                                                        >
                                                                            <XCircle className="h-4 w-4 mr-2" />
                                                                            Rejeter
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                {ordonnance.status === 'to_create' && (
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleStatusChange(ordonnance.id, 'pending')}
                                                                        className="text-blue-600"
                                                                    >
                                                                        <Pencil className="h-4 w-4 mr-2" />
                                                                        Commencer traitement
                                                                    </DropdownMenuItem>
                                                                )}
                                                             
                                                            </DropdownMenuContent>
                                                        </DropdownMenu> */}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FileText className="h-12 w-12 text-gray-300 mb-3" />
                                                    <p className="text-gray-500">Aucune ordonnance trouvée</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        Essayez de modifier vos filtres de recherche
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {ordonnance.links.length > 3 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Affichage de {ordonnance.data.length} sur {ordonnance.total} ordonnances
                        </div>
                        <Pagination>
                            <PaginationContent>
                                {ordonnance.current_page > 1 && (
                                    <>
                                        <PaginationItem>
                                            <PaginationPrevious 
                                                href={ordonnance.links[0]?.url || '#'}
                                            />
                                        </PaginationItem>
                                        {ordonnance.current_page > 2 && (
                                            <PaginationItem>
                                                <PaginationLink href={ordonnance.links[0]?.url || '#'}>
                                                    1
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}
                                        {ordonnance.current_page > 3 && (
                                            <PaginationItem>
                                                <span className="px-3">...</span>
                                            </PaginationItem>
                                        )}
                                    </>
                                )}

                                {ordonnance.links.slice(1, -1).map((link, index) => {
                                    const pageNumber = parseInt(link.label);
                                    if (isNaN(pageNumber)) return null;
                                    
                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationLink 
                                                href={link.url || '#'}
                                                isActive={link.active}
                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                {ordonnance.current_page < ordonnance.last_page && (
                                    <>
                                        {ordonnance.current_page < ordonnance.last_page - 2 && (
                                            <PaginationItem>
                                                <span className="px-3">...</span>
                                            </PaginationItem>
                                        )}
                                        {ordonnance.current_page < ordonnance.last_page - 1 && (
                                            <PaginationItem>
                                                <PaginationLink href={ordonnance.links[ordonnance.links.length - 1]?.url || '#'}>
                                                    {ordonnance.last_page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}
                                        <PaginationItem>
                                            <PaginationNext 
                                                href={ordonnance.links[ordonnance.links.length - 1]?.url || '#'}
                                            />
                                        </PaginationItem>
                                    </>
                                )}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

                {/* Section d'actions rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Rapports PDF
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => generateQuickReport('daily')}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Rapport Journalier
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => generateQuickReport('weekly')}
                            >
                                <BarChart className="h-4 w-4 mr-2" />
                                Rapport Hebdomadaire
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => generateQuickReport('monthly')}
                            >
                                <FileDown className="h-4 w-4 mr-2" />
                                Rapport Mensuel
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={exportSelectionToPDF}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exporter Sélection
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Statistiques des statuts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">Traités</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {stats.processed} ({((stats.processed / stats.total) * 100 || 0).toFixed(1)}%)
                                        </span>
                                    </div>
                                    <Progress value={(stats.processed / stats.total) * 100 || 0} className="h-2 bg-green-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">En attente</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {stats.pending} ({((stats.pending / stats.total) * 100 || 0).toFixed(1)}%)
                                        </span>
                                    </div>
                                    <Progress value={(stats.pending / stats.total) * 100 || 0} className="h-2 bg-yellow-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">À créer</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {stats.to_create} ({((stats.to_create / stats.total) * 100 || 0).toFixed(1)}%)
                                        </span>
                                    </div>
                                    <Progress value={(stats.to_create / stats.total) * 100 || 0} className="h-2 bg-blue-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialog pour ajouter un commentaire */}
            <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
                <DialogContent className="sm:max-w-106.25">
                    <DialogHeader>
                        <DialogTitle>Ajouter un commentaire</DialogTitle>
                        <DialogDescription>
                            Ajoutez un commentaire pour l'ordonnance #{selectedOrdonnance?.numero}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="comment">Commentaire</Label>
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Entrez votre commentaire ici..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSubmitComment}>
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de prévisualisation PDF */}
            {reportData && (
                <Dialog open={showPDFPreview} onOpenChange={setShowPDFPreview}>
                    <DialogContent className="max-w-6xl h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Prévisualisation du rapport</DialogTitle>
                            <DialogDescription>
                                Aperçu du rapport avant téléchargement
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden">
                            <PDFViewer className="w-full h-full min-h-150">
                                <OrdonnanceReportPDF data={reportData} />
                            </PDFViewer>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowPDFPreview(false)}
                            >
                                Fermer
                            </Button>
                            
                            <PDFDownloadLink
                                document={<OrdonnanceReportPDF data={reportData} />}
                                fileName={`ordonnances-rapport-${format(new Date(), 'yyyy-MM-dd', { locale: fr })}.pdf`}
                            >
                                {({ loading }) => (
                                    <Button disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Préparation...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4 mr-2" />
                                                Télécharger PDF
                                            </>
                                        )}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
}
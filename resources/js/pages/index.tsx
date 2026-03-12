import AppLayout from '@/layouts/phamacie-layout';
import { Head } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Package, 
  Calendar,
  FileText,
  AlertCircle,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Activity,
  DollarSign,
  Pill,
  Banknote,
  LineChart as LineChartIcon,
  Search,
  Target,
  Layers,
  Award,
  Clock,
  Eye,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  LineChart, 
  Line,
  PieChart as RechartPieChart,
  Pie,
  Cell as PieCell,
  Legend,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { useState, useEffect, use } from 'react';
import PdfExport from '@/components/export';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: ''
    },
];

// Types pour les données Inertia
interface DashboardProps {
    labelsOrd: string[];
    countsOrd: number[];
    revenuesGNF: number[];
    labelsProd: string[];
    countsProd: number[];
    revenuesProdGNF: number[];
    topProduits: Array<{
        nom: string;
        total_quantite: number;
        total_vente_gnf: number;
    }>;
    searchedByMonth: Array<{
        year: number;
        month: number;
        total_recherches: number;
    }>;
    currency: string;
}

const COLORS = ['#702a91', '#8b3da8', '#a85cdb', '#c67af5', '#e598ff', '#ffb3ff'];

const formatGNF = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'GNF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
};

const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

export default function Index({ 
    labelsOrd, 
    countsOrd, 
    revenuesGNF, 
    labelsProd, 
    countsProd, 
    revenuesProdGNF,
    topProduits,
    searchedByMonth,
    currency 
}: DashboardProps) {
    const [timeRange, setTimeRange] = useState('year');
    const [isRefreshing, setIsRefreshing] = useState(false);


    const ordonnanceChartData = labelsOrd?.map((label: string, index: number) => ({
        name: label,
        ordonnances: countsOrd?.[index] || 0,
        revenue: revenuesGNF?.[index] || 0,
        month: label.split('/')[0],
        year: label.split('/')[1],
    })) || [];

    const produitsChartData = labelsProd?.map((label: string, index: number) => ({
        name: label.length > 15 ? `${label.substring(0, 15)}...` : label,
        quantite: countsProd?.[index] || 0,
        revenue: revenuesProdGNF?.[index] || 0,
        fullName: label,
        percent: countsProd?.[index] / (countsProd?.reduce((a, b) => a + b, 0) || 1) * 100,
    })) || [];

    const recherchesChartData = searchedByMonth?.map((item) => ({
        name: `${(item.month ?? 0).toString().padStart(2, '0')}/${(item.year ?? 0).toString().slice(-2)}`,
        recherches: item.total_recherches || 0,
        month: item.month,
        year: item.year,
    })) || [];

    const totalOrdonnances = countsOrd?.reduce((sum, count) => sum + count, 0) || 0;
    // ensure revenuesGNF entries are treated as numbers to prevent string concatenation
    const totalRevenue = revenuesGNF
        ?.reduce((sum, revenue) => sum + Number(revenue), 0)
        || 0;
    const totalProduitsVendus = countsProd?.reduce((sum, count) => sum + count, 0) || 0;
    const totalRecherches = searchedByMonth?.reduce((sum, item) => sum + (item.total_recherches || 0), 0) || 0;
    

    let croissanceOrdonnances = 0;
    let croissanceRevenue = 0;
    let croissanceProduits = 0;
    let croissanceRecherches = 0;
    
    if (countsOrd && countsOrd.length >= 2) {
        croissanceOrdonnances = calculateGrowth(countsOrd[countsOrd.length - 1], countsOrd[countsOrd.length - 2]);
    }
    
    if (revenuesGNF && revenuesGNF.length >= 2) {
        croissanceRevenue = calculateGrowth(revenuesGNF[revenuesGNF.length - 1], revenuesGNF[revenuesGNF.length - 2]);
    }
    
    if (countsProd && countsProd.length >= 2) {
        croissanceProduits = calculateGrowth(countsProd[countsProd.length - 1], countsProd[countsProd.length - 2]);
    }
    
    if (searchedByMonth && searchedByMonth.length >= 2) {
        const current = searchedByMonth[searchedByMonth.length - 1]?.total_recherches || 0;
        const previous = searchedByMonth[searchedByMonth.length - 2]?.total_recherches || 0;
        croissanceRecherches = calculateGrowth(current, previous);
    }
    useEffect(() => {
        console.log('Total Revenus:', totalRevenue);
       
      
    }, []);

    // Statistiques dynamiques pour les cartes
    const statsCards = [
        {
            title: "Ordonnances totales",
            value: formatNumber(totalOrdonnances),
            change: `${croissanceOrdonnances >= 0 ? '+' : ''}${croissanceOrdonnances.toFixed(1)}%`,
            trend: croissanceOrdonnances >= 0 ? "up" : "down",
            icon: FileText,
            color: "bg-gradient-to-br from-blue-500 to-blue-600",
            description: "Ordonnances traitées",
            gradient: "from-blue-500 to-blue-600",
        },
        {
            title: "Chiffre d'affaires",
            value: formatGNF(totalRevenue),
            change: `${croissanceRevenue >= 0 ? '+' : ''}${croissanceRevenue.toFixed(1)}%`,
            trend: croissanceRevenue >= 0 ? "up" : "down",
            icon: DollarSign,
            color: "bg-gradient-to-br from-green-500 to-emerald-600",
            description: `Total en ${currency}`,
            gradient: "from-green-500 to-emerald-600",
        },
        {
            title: "Produits vendus",
            value: formatNumber(totalProduitsVendus),
            change: `${croissanceProduits >= 0 ? '+' : ''}${croissanceProduits.toFixed(1)}%`,
            trend: croissanceProduits >= 0 ? "up" : "down",
            icon: Package,
            color: "bg-gradient-to-br from-purple-500 to-purple-600",
            description: "Unités écoulées",
            gradient: "from-purple-500 to-purple-600",
        },
        {
            title: "Produits recherchés",
            value: formatNumber(totalRecherches),
            change: `${croissanceRecherches >= 0 ? '+' : ''}${croissanceRecherches.toFixed(1)}%`,
            trend: croissanceRecherches >= 0 ? "up" : "down",
            icon: Search,
            color: "bg-gradient-to-br from-pink-500 to-rose-600",
            description: "Recherches effectuées",
            gradient: "from-pink-500 to-rose-600",
        },
    ];

    // Top produits avec données réelles
    const topProductsList = topProduits?.slice(0, 5) || [];

    // Données pour graphique combiné
    const combinedChartData = ordonnanceChartData.map((item, index) => ({
        ...item,
        recherches: recherchesChartData[index]?.recherches || 0,
        produits: produitsChartData[index]?.quantite || 0,
    }));

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 1000);
    };

    // Données pour le pie chart des top produits
    const pieChartData = topProductsList.map(produit => ({
        name: produit.nom,
        value: produit.total_quantite,
        revenue: produit.total_vente_gnf,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Pharmacie" />
            
            <div id="dashboard-content" className="space-y-6 p-5">
                {/* Header avec bienvenue */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-linear-to-br from-[#702a91] to-[#fa3143]">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                    Tableau de Bord
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Analytics en temps réel • {currency}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    {timeRange === 'year' ? 'Cette année' : 
                                     timeRange === 'month' ? 'Ce mois' : 
                                     timeRange === 'week' ? 'Cette semaine' : 'Période'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTimeRange('week')}>
                                    Cette semaine
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTimeRange('month')}>
                                    Ce mois
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTimeRange('year')}>
                                    Cette année
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        {/* <Button className="bg-linear-to-r from-[#702a91] to-[#fa3143] hover:shadow-lg gap-2">
                            <Download className="h-4 w-4" />
                            Exporter
                        </Button> */}
                                    <PdfExport targetId="dashboard-content" fileName="dashboard.pdf" />
                    </div>
                </div>

                {/* Cartes de statistiques améliorées */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsCards.map((stat, index) => (
                        <Card key={index} className="relative overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300">
                            <div className={`absolute inset-0 bg-linear-to-br opacity-5 ${stat.gradient}`} />
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 bg-linear-to-br ${stat.gradient} opacity-10`} />
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-500 mb-2">
                                            {stat.title}
                                        </p>
                                        <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                                            {stat.value}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                {stat.trend === "up" ? (
                                                    <ArrowUp className="h-3 w-3 text-green-600" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3 text-red-600" />
                                                )}
                                                <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-700" : "text-red-700"}`}>
                                                    {stat.change}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                vs période précédente
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r ${stat.gradient}`}
                                            style={{ width: '75%' }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs pour différents graphiques */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid grid-cols-4 w-full max-w-md">
                        <TabsTrigger value="overview" className="gap-2">
                            <Activity className="h-4 w-4" />
                            Vue d'ensemble
                        </TabsTrigger>
                        <TabsTrigger value="revenue" className="gap-2">
                            <DollarSign className="h-4 w-4" />
                            Revenus
                        </TabsTrigger>
                        <TabsTrigger value="products" className="gap-2">
                            <Package className="h-4 w-4" />
                            Produits
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2">
                            <LineChartIcon className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Graphique combiné - Line Chart */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">
                                                Évolution globale
                                            </CardTitle>
                                            <CardDescription>
                                                Performance sur plusieurs indicateurs
                                            </CardDescription>
                                        </div>
                                        <LineChartIcon className="h-5 w-5 text-[#702a91]" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {combinedChartData.length > 0 ? (
                                        <div className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={combinedChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        stroke="#666" 
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis 
                                                        yAxisId="left"
                                                        stroke="#666" 
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis 
                                                        yAxisId="right"
                                                        orientation="right"
                                                        stroke="#666" 
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) => formatGNF(value)}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '0.5rem',
                                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                        }}
                                                        formatter={(value, name) => {
                                                            if (name === 'ordonnances') return [`${value} ordonnances`, 'Ordonnances'];
                                                            if (name === 'revenue') return [formatGNF(value as number), 'Chiffre d\'affaires'];
                                                            if (name === 'recherches') return [`${value} recherches`, 'Recherches'];
                                                            return [value, name];
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Line 
                                                        yAxisId="left"
                                                        type="monotone" 
                                                        dataKey="ordonnances" 
                                                        name="Ordonnances"
                                                        stroke="#702a91"
                                                        strokeWidth={2}
                                                        dot={{ r: 4 }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                    <Line 
                                                        yAxisId="left"
                                                        type="monotone" 
                                                        dataKey="recherches" 
                                                        name="Recherches"
                                                        stroke="#8b3da8"
                                                        strokeWidth={2}
                                                        dot={{ r: 4 }}
                                                        strokeDasharray="3 3"
                                                    />
                                                    <Bar 
                                                        yAxisId="right"
                                                        dataKey="revenue" 
                                                        name="Chiffre d'affaires"
                                                        fill="#fa3143"
                                                        fillOpacity={0.6}
                                                        radius={[4, 4, 0, 0]}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="h-[350px] flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <LineChartIcon className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                                                <p>Aucune donnée disponible</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Area Chart pour tendance */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">
                                                Tendance des revenus
                                            </CardTitle>
                                            <CardDescription>
                                                Évolution du chiffre d'affaires
                                            </CardDescription>
                                        </div>
                                        <TrendingUp className="h-5 w-5 text-[#702a91]" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {ordonnanceChartData.length > 0 ? (
                                        <div className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={ordonnanceChartData}>
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#fa3143" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#fa3143" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        stroke="#666" 
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                    />
                                                    <YAxis 
                                                        stroke="#666" 
                                                        fontSize={11}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickFormatter={(value) => formatGNF(value)}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '0.5rem',
                                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                        }}
                                                        formatter={(value) => [formatGNF(value as number), 'Revenus']}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="revenue" 
                                                        stroke="#fa3143"
                                                        strokeWidth={2}
                                                        fillOpacity={1}
                                                        fill="url(#colorRevenue)"
                                                        activeDot={{ r: 6 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="h-[350px] flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <TrendingUp className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                                                <p>Aucune donnée de revenus disponible</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="revenue" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenus détaillés */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">
                                                Détail des revenus
                                            </CardTitle>
                                            <CardDescription>
                                                Par période et par produit
                                            </CardDescription>
                                        </div>
                                        <Banknote className="h-5 w-5 text-[#702a91]" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Votre contenu pour les revenus */}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Section inférieure avec plus de graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top produits avec Pie Chart */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold">
                                        Répartition des ventes
                                    </CardTitle>
                                    <CardDescription>
                                        Top 5 produits par quantité
                                    </CardDescription>
                                </div>
                                <PieChart className="h-5 w-5 text-[#702a91]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {pieChartData.length > 0 ? (
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartPieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => 
                                                    `${name}: ${(percent ? percent* 100 : 0).toFixed(0)}%`
                                                }
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <PieCell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]} 
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name, props) => {
                                                    const item = pieChartData[props.payload.index];
                                                    return [
                                                        `${formatNumber(value as number)} unités (${formatGNF(item?.revenue || 0)})`,
                                                        'Ventes'
                                                    ];
                                                }}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '0.5rem',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                }}
                                            />
                                        </RechartPieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>Aucune donnée de produits</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recherches avec Line Chart */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold">
                                        Recherches mensuelles
                                    </CardTitle>
                                    <CardDescription>
                                        Évolution des recherches
                                    </CardDescription>
                                </div>
                                <Eye className="h-5 w-5 text-[#702a91]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recherchesChartData.length > 0 ? (
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={recherchesChartData}>
                                            <defs>
                                                <linearGradient id="colorRecherches" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b3da8" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#8b3da8" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="#666" 
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis 
                                                stroke="#666" 
                                                fontSize={11}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '0.5rem',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                }}
                                                formatter={(value) => [`${value} recherches`, 'Quantité']}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="recherches" 
                                                stroke="#8b3da8"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorRecherches)"
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p>Aucune recherche enregistrée</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performances clés */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold">
                                        Performances clés
                                    </CardTitle>
                                    <CardDescription>
                                        Indicateurs de performance
                                    </CardDescription>
                                </div>
                                <Target className="h-5 w-5 text-[#702a91]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Ordonnances/mois</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {ordonnanceChartData.length > 0 
                                                ? (totalOrdonnances / ordonnanceChartData.length).toFixed(1)
                                                : '0.0'
                                            }
                                        </span>
                                    </div>
                                    <Progress 
                                        value={ordonnanceChartData.length > 0 
                                            ? Math.min((totalOrdonnances / ordonnanceChartData.length) * 10, 100) 
                                            : 0
                                        } 
                                        className="h-2"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">CA moyen</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {totalOrdonnances > 0 
                                                ? formatGNF(totalRevenue / totalOrdonnances) 
                                                : formatGNF(0)
                                            }
                                        </span>
                                    </div>
                                    <Progress 
                                        value={totalOrdonnances > 0 
                                            ? Math.min((totalRevenue / totalOrdonnances) / 100000, 100) 
                                            : 0
                                        } 
                                        className="h-2 bg-gradient-to-r from-green-500 to-emerald-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Produits/ordonnance</span>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {totalOrdonnances > 0 
                                                ? (totalProduitsVendus / totalOrdonnances).toFixed(1) 
                                                : '0.0'
                                            }
                                        </span>
                                    </div>
                                    <Progress 
                                        value={totalOrdonnances > 0 
                                            ? Math.min((totalProduitsVendus / totalOrdonnances) * 20, 100) 
                                            : 0
                                        } 
                                        className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Taux de croissance</span>
                                        <span className={`text-sm font-semibold ${croissanceRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {croissanceRevenue >= 0 ? '+' : ''}{croissanceRevenue.toFixed(1)}%
                                        </span>
                                    </div>
                                    <Progress 
                                        value={Math.min(Math.abs(croissanceRevenue) * 2, 100)} 
                                        className={`h-2 ${croissanceRevenue >= 0 ? 'bg-linear-to-r from-green-500 to-emerald-600' : 'bg-linear-to-r from-red-500 to-red-600'}`}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Résumé amélioré */}
                <Card className="border-0 shadow-lg bg-linear-to-br from-[#702a91] to-[#fa3143] text-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-white/20">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            Performance exceptionnelle
                                        </h3>
                                        <p className="text-white/80 mt-1">
                                            Votre pharmacie excelle avec {formatNumber(totalOrdonnances)} ordonnances traitées
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-lg p-3">
                                        <p className="text-sm opacity-80">Revenu total</p>
                                        <p className="text-lg font-bold">{formatGNF(totalRevenue)}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-3">
                                        <p className="text-sm opacity-80">Croissance mensuelle</p>
                                        <p className="text-lg font-bold">{croissanceRevenue >= 0 ? '+' : ''}{croissanceRevenue.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Badge className="bg-white text-[#702a91] px-4 py-2 font-semibold">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Dernière mise à jour: Maintenant
                                </Badge>
                                <Button 
                                    variant="secondary" 
                                    className="bg-white text-[#702a91] hover:bg-white/90"
                                    onClick={handleRefresh}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Actualiser
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </AppLayout>
    );
}
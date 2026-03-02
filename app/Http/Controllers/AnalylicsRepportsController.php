<?php

namespace App\Http\Controllers;

use App\Models\Ordonance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalylicsRepportsController extends Controller
{
     public function index()
{
    $user = Auth::user();

    $ordonnances = Ordonance::where('pharmacie_id', $user->pharmacie_id)
        ->selectRaw('
            YEAR(date_ord) as year,
            MONTH(date_ord) as month,
            COUNT(*) as total_ordonnances,
            SUM(total) as chiffre_affaire_gnf
        ')
        ->groupBy('year', 'month')
        ->orderBy('year')
        ->orderBy('month')
        ->get();

    $labelsOrd = $ordonnances->map(
        fn ($o) => str_pad($o->month, 2, '0', STR_PAD_LEFT) . '/' . $o->year
    );

    $countsOrd = $ordonnances->pluck('total_ordonnances');
    $revenuesGNF = $ordonnances->pluck('chiffre_affaire_gnf');

    $topProduits = DB::table('searched_products')
        ->join('ordonances', 'searched_products.ordonance_id', '=', 'ordonances.id')
        ->where('ordonances.pharmacie_id', $user->pharmacie_id)
        ->selectRaw('
            searched_products.nom,
            SUM(searched_products.quantite) as total_quantite,
            SUM(searched_products.prix_total) as total_vente_gnf
        ')
        ->groupBy('searched_products.nom')
        ->orderByDesc('total_quantite')
        ->limit(5)
        ->get();

    $labelsProd = $topProduits->pluck('nom');
    $countsProd = $topProduits->pluck('total_quantite');
    $revenuesProdGNF = $topProduits->pluck('total_vente_gnf');


    $searchedByMonth = DB::table('searched_products')
        ->join('ordonances', 'searched_products.ordonance_id', '=', 'ordonances.id')
        ->where('ordonances.pharmacie_id', $user->pharmacie_id)
        ->selectRaw('
            YEAR(searched_products.created_at) as year,
            MONTH(searched_products.created_at) as month,
            COUNT(*) as total_recherches
        ')
        ->groupBy('year', 'month')
        ->orderBy('year')
        ->orderBy('month')
        ->get();


 
    return Inertia::render('index', [
        // Ordonnances
        'labelsOrd' => $labelsOrd,
        'countsOrd' => $countsOrd,
        'revenuesGNF' => $revenuesGNF,

        // Produits
        'labelsProd' => $labelsProd,
        'countsProd' => $countsProd,
        'revenuesProdGNF' => $revenuesProdGNF,

        // Data brute
        'topProduits' => $topProduits,
        'searchedByMonth' => $searchedByMonth,

        // Devise
        'currency' => 'GNF',
    ]);
}

}

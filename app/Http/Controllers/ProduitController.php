<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProduitaddRequest;
use App\Models\Pharmacie;
use App\Models\Produit;
use App\Models\PharmacieProduit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use function Laravel\Prompts\select;

class ProduitController extends Controller
{
   public function index()
{
    $user = Auth::user();
    $pharmacieId = $user->pharmacie->id;


    $products = Produit::pluck('produit', 'id');


$pharmacieProductsDetails = PharmacieProduit::where('pharmacie_id', $pharmacieId)
    ->with('produit') 
    ->get()
    ->map(function ($pp) {
        $produit = $pp->produit;
        $produit->price = $pp->price;
        return $produit;
    });

    return Inertia::render('Produit/Index', [
        'products' => $products,
        'pharmacieProductsDetails' => $pharmacieProductsDetails,
    ]);
}
public function produitCreateAdd(ProduitaddRequest $request)
{
    $user = Auth::user();
    $pharmacieId = $user->pharmacie->id;

    // Création du produit
    $produit = new Produit();
    $produit->produit = $request->produit;
    $produit->categorie = $request->categorie;
    $produit->sous_categorie = $request->sous_categorie;
    $produit->forme = $request->forme;
    $produit->dosage = $request->dosage;


    // Gestion des images multiples
    if ($request->hasFile('images')) {
        $storedImages = [];
        foreach ($request->file('images') as $image) {
            $storedImages[] = $image->store('produits', 'public');
        }
        $produit->images = json_encode($storedImages);
    }

    $produit->save();

    // Associer le produit à la pharmacie
    $user->pharmacie->produits()->syncWithoutDetaching([
        $produit->id => [
            'price' => $request->price ?? 0 
        ]
    ]);

    return redirect()->back()->with('success', 'Le produit a été ajouté avec succès.');
}


public function store(Request $request)
{
    $user = Auth::user();
    $pharmacie = $user->pharmacie;

    $produitsIds = array_map('intval', (array) $request->input('products', []));
    $prices = $request->input('prices', []);

    // Construire le tableau associatif pour sync
    $syncData = [];
    foreach ($produitsIds as $id) {
        $syncData[$id] = ['price' => $prices[$id] ?? 0];
    }

    $pharmacie->produits()->sync($syncData);

    return back()->with('success', 'Liste des produits mise à jour avec succès.');
}
    public function destroy($id)
    {


        return redirect()->route('dashboard.produit.index')->with('success', 'Produit supprimé avec succès.');
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        // Logique pour rechercher des produits en fonction de la requête
        // Vous pouvez effectuer une recherche dans la base de données et retourner les résultats

        return response()->json([
            'results' => [], // Remplacez par les résultats de la recherche
        ]);
    }
}

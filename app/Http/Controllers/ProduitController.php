<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProduitaddRequest;
use App\Models\Pharmacie;
use App\Models\Produit;
use App\Models\PhamacieProduit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProduitController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $pharmacieId = $user->pharmacie->id;
        $products = Produit::pluck('produit', 'id');
        $pharmacieProduit = PhamacieProduit::where('pharmacie_id', $pharmacieId)->first();
        $existingProducts = $pharmacieProduit && $pharmacieProduit->produit_id
            ? explode(',', $pharmacieProduit->produit_id)
            : [];

        $pharmacieProductsDetails = Produit::whereIn('id', $existingProducts)->get();

        return Inertia::render('Produit/Index', [
            'products' => $products,
            'pharmacieProductsDetails' => $pharmacieProductsDetails,
        ]);
    }

 public function produitCreateAdd(ProduitaddRequest $produitaddRequest)
{
    $produit = new Produit();
    $user = Auth::user();
    $pharmacieId = $user->pharmacie->id;

    // Vérifier si plusieurs images sont envoyées
    if ($produitaddRequest->hasFile('images')) {
        $images = $produitaddRequest->file('images');
        $storedImages = [];

        foreach ($images as $image) {
            $storedImages[] = $image->store('produits', 'public');
        }

        // Stocker sous forme JSON pour pouvoir récupérer plusieurs images
        $produit->images = json_encode($storedImages);
    }

    $produit->produit = $produitaddRequest->produit;
    $produit->categorie = $produitaddRequest->categorie;
    $produit->sous_categorie = $produitaddRequest->sous_categorie;
    $produit->forme = $produitaddRequest->forme;
    $produit->dosage = $produitaddRequest->dosage;
    $produit->save();

    // Gestion de la pharmacie et des produits existants
    $pharmacieProduit = PhamacieProduit::firstOrCreate(
        ['pharmacie_id' => $pharmacieId],
        ['produit_id' => ''] 
    );

    $existingProducts = array_filter(array_map('intval', explode(',', $pharmacieProduit->produit_id)));

    if (!in_array($produit->id, $existingProducts)) {
        $existingProducts[] = $produit->id;
        $pharmacieProduit->update([
            'produit_id' => implode(',', $existingProducts)
        ]);
    }

    return redirect()->back()->with('success', 'Le produit a été ajouté avec succès');
}

    public function store(Request $request)
    {
        $user = Auth::user();
        $pharmacieId = $user->pharmacie->id;

        $produitsIds = array_map('intval', (array) $request->input('products', []));


        $pharmacieProduit = PhamacieProduit::firstOrCreate(
            ['pharmacie_id' => $pharmacieId],
            ['produit_id' => '']
        );


        $pharmacieProduit->produit_id = implode(',', $produitsIds);
        $pharmacieProduit->save();

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

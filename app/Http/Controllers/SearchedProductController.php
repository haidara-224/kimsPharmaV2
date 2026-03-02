<?php

namespace App\Http\Controllers;

use App\Models\Ordonance;
use App\Models\Searched_product;
use Illuminate\Http\Request;

class SearchedProductController extends Controller
{
 public function update(Request $request, $ordonnanceId)
{
    $ordonnance = Ordonance::findOrFail($ordonnanceId);

    $request->validate([
        'produit_id'    => 'required|array',
        'produit_id.*'  => 'exists:produits,id',
        'prix_unitaire.*' => 'required|numeric|min:0',
        'quantite.*'    => 'required|integer|min:1',
        'frais_livraison' => 'nullable|numeric|min:0',
    ]);

    $produitIds    = $request->produit_id;
    $prixUnitaires = $request->prix_unitaire;
    $quantites     = $request->quantite;
    $fraisLivraison = (float) $request->input('frais_livraison', 0);

    $totalGeneral = 0;

    foreach ($produitIds as $index => $produitId) {

        $searchedProduct = Searched_product::where('ordonance_id', $ordonnanceId)
            ->where('produit_id', $produitId)
            ->first();

        if ($searchedProduct) {
            $quantite        = (int)   $quantites[$index];
            $prixUnitaire    = (float) $prixUnitaires[$index];
            $prixTotalProduit = $prixUnitaire * $quantite;

            $searchedProduct->update([
                'prix_unitaire' => $prixUnitaire,
                'quantite'      => $quantite,
                'prix_total'    => $prixTotalProduit,
            ]);

            $totalGeneral += $prixTotalProduit;
        }
    }

    // Ajouter les frais de livraison au total général
    $totalGeneral += $fraisLivraison;

    $ordonnance->update([
        'total'           => $totalGeneral,
        'frais_livraison' => $fraisLivraison,
    ]);

    return back()->with('success', 'Prix mis à jour avec succès');
}
}

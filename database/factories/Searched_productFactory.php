<?php

namespace Database\Factories;

use App\Models\Ordonance;
use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Searched_product>
 */
class Searched_productFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
   public function definition(): array
    {
          // Produit existant
        $produit = Produit::inRandomOrder()->first();

        

        return [
            'ordonance_id' => Ordonance::inRandomOrder()->first()?->id,
            'produit_id' => $produit?->id,

            // Snapshot produit
            'nom' => $produit?->produit ?? $this->faker->word(),
            'categorie' => $produit?->categorie ?? 'Général',
            'sous_categorie' => $produit?->sous_categorie,
            'forme_dosage' => trim(
                ($produit?->forme ?? '') . ' ' . ($produit?->dosage ?? '')
            ),

         

            'images' => json_encode([
                'produits/default1.jpg',
                'produits/default2.jpg',
            ]),
        ];
    }
}

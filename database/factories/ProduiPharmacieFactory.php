<?php

namespace Database\Factories;

use App\Models\Pharmacie;
use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class ProduiPharmacieFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
    

        return [
            'pharmacie_id' => Pharmacie::inRandomOrder()->first()?->id,
            'produit_id' => Produit::inRandomOrder()->value('id'),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Pharmacie;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ordonance>
 */
class OrdonanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
  public function definition(): array
    {
        $statusList = ['pending', 'processed', 'rejected','to_create','comment'];
        $statutLivraison = ['En Pharmacie','Livraison Gratuite','Livraison express','Livraison Standard'];

        return [
            'patient' => $this->faker->name(),
            'age_patient' => $this->faker->numberBetween(1, 90),
            'numero' => 'ORD-' . $this->faker->unique()->numberBetween(10000, 99999),
            'fichier' => 'ordonnances/' . $this->faker->uuid . '.pdf',

            'date_ord' => $this->faker->dateTimeBetween('-6 months', 'now'),

            'user_id' => User::inRandomOrder()->first()?->id,
            'pharmacie_id' => Pharmacie::inRandomOrder()->first()?->id,

            'total' => $this->faker->numberBetween(50000, 500000), 
            'frais_livraison' => $this->faker->numberBetween(0, 30000),

            'status' => $this->faker->randomElement($statusList),
            'statut_livraison' => $this->faker->randomElement($statutLivraison),

            'approuve_par' => User::inRandomOrder()->first()?->id,

            'feedback' => "hello, this is a feedback for the ordonnance.",
            'commentaire' => "hello, this is a comment for the ordonnance.",

            'coordonees_livraison' => $this->faker->address(),
        ];
    }
}

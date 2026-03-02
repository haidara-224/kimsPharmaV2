<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pharmacie>
 */
class PharmacieFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        
        $quartiers = [
            'Kaloum', 'Matam', 'Ratoma', 'Dixinn',
            'Hamdallaye', 'Kipé', 'Nongo', 'Lambanyi',
            'Cosa', 'Sonfonia'
        ];

        return [
            'name' => 'Pharmacie ' . $this->faker->company(),
            'tel' => '62' . $this->faker->numberBetween(1000000, 9999999),
            'adresse' => $this->faker->streetAddress() . ', ' . $this->faker->randomElement($quartiers),
            'description' => $this->faker->sentence(12),
            'logo' => 'pharmacies/logo.png',
            'image' => json_encode([
                'pharmacies/1.jpg',
                'pharmacies/2.jpg',
                'pharmacies/3.jpg',
            ]),
            'coordonnees' => $this->faker->latitude(9.5, 9.7) . ',' . $this->faker->longitude(-13.8, -13.6),
            'disponibilite' => $this->faker->randomElement(['open', 'closed']),
            'statut' => 'active',
            'is_blocked' => false,
        ];
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class AssurenceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
   public function definition(): array
{
    $assurances = [
        [
            'entreprise_name' => 'NSIA Assurances Guinée',
            'ville' => 'Conakry',
            'adresse' => 'Kaloum, Conakry',
            'telephone' => '622000001',
        ],
        [
            'entreprise_name' => 'SUNU Assurances Guinée',
            'ville' => 'Conakry',
            'adresse' => 'Teminetaye, Kaloum',
            'telephone' => '622000002',
        ],
        [
            'entreprise_name' => 'LANALA Assurances',
            'ville' => 'Conakry',
            'adresse' => 'Almamya, Kaloum',
            'telephone' => '622000003',
        ],
        [
            'entreprise_name' => 'SAAR Assurances Guinée',
            'ville' => 'Conakry',
            'adresse' => 'Lambanyi',
            'telephone' => '622000004',
        ],
        [
            'entreprise_name' => 'VISTA Assurances Guinée',
            'ville' => 'Conakry',
            'adresse' => 'Kipé',
            'telephone' => '622000005',
        ],
        [
            'entreprise_name' => 'SOGAM Assurances',
            'ville' => 'Conakry',
            'adresse' => 'Madina',
            'telephone' => '622000006',
        ],
        [
            'entreprise_name' => 'UGAR Activa Guinée',
            'ville' => 'Conakry',
            'adresse' => 'Kaloum',
            'telephone' => '622000007',
        ],
        [
            'entreprise_name' => 'ASCOMA Guinée',
            'ville' => 'Conakry',
            'adresse' => 'Almamya',
            'telephone' => '622000008',
        ],
    ];

    return $this->faker->randomElement($assurances);
}
}

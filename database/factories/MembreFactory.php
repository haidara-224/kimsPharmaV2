<?php

namespace Database\Factories;

use App\Models\Assurence;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;


/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class MembreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'matricule' => $this->faker->unique()->numerify('M-#####'),
            'name' => $this->faker->firstName(),
            'prenom' => $this->faker->lastName(),
            'telephone' => $this->faker->phoneNumber(),
            'assurence_id' => Assurence::inRandomOrder()->value('id'),
        
        ];
    }
}

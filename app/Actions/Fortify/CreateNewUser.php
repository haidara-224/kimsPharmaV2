<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Pharmacie;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
     protected function handleMultipleImageUpload($images)
    {
        $storedPaths = [];

        if ($images) {
            if (!is_array($images)) {

                $images = [$images];
            }

            foreach ($images as $image) {
                if ($image && $image->isValid()) {
                    $storedPaths[] = $image->store('images', 'public');
                }
            }
        }

        return $storedPaths;
    }

    protected function handleImageUpload($image)
    {
        if ($image && $image->isValid()) {
            return $image->store('images', 'public');
        }
        return null;
    }

     public function create(array $input): User
    {
        Validator::make($input, [
            'nom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => $this->passwordRules(),
            'name' => ['required', 'string'],
            'Adresse' => ['required', 'string'],
            'tel' => ['required', 'string'],
            'coordonnees' => ['required', 'array'],
            'logo' => ['required','image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'image' => ['required', 'array'],
            'image.*' => ['image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'description' => ['nullable', 'string'],
        ])->validate();

        $logoPath = $this->handleImageUpload($input['logo']);
        $imagePaths = $this->handleMultipleImageUpload($input['image']);

        // Récupérer la latitude et la longitude
        $latitude = $input['coordonnees']['latitude'];
        $longitude = $input['coordonnees']['longitude'];

        $pharmacie = Pharmacie::create([
            'name' => $input['name'],
            'adresse' => $input['Adresse'],
            'tel' => $input['tel'],
          'coordonnees' => "$latitude,$longitude",
            'logo' => $logoPath,
            'image' => json_encode($imagePaths),
            'description' => $input['description'] ?? null,
        ]);

        $user = User::create([
            'nom' => $input['nom'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'pharmacie_id' => $pharmacie->id,
            'user_type' => 'admin'
        ]);
        $user->assignRole('admin');

        return $user;
    }

}

<?php

namespace Database\Seeders;

use App\Models\Ordonance;
use App\Models\Pharmacie;
use App\Models\Produit;
use App\Models\Searched_product;
use App\Models\SearchedProduct;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        // 1️⃣ Produits
        Produit::factory()->count(500)->create();

        // 2️⃣ Users
        $users = User::factory()->count(200)->create();

        $pharmacienUsers = $users->slice(0, 50);

        foreach ($pharmacienUsers as $user) {
            $user->assignRole('pharmacy');
        }

        // 3️⃣ Pharmacies
        Pharmacie::factory()->count(100)->create();

        // 4️⃣ Ordonnances
        Ordonance::factory()->count(30)->create();

        // 5️⃣ Produits recherchés dans les ordonnances
        Ordonance::all()->each(function ($ordonance) {

            $produits = Produit::inRandomOrder()
                ->take(rand(1, 5))
                ->get();

            foreach ($produits as $produit) {
                Searched_product::create([
                    'ordonance_id' => $ordonance->id,
                    'produit_id' => $produit->id,
                    'nom' => $produit->produit,
                    'categorie' => $produit->categorie,
                    'sous_categorie' => $produit->sous_categorie,
                    'forme_dosage' => $produit->forme . ' ' . $produit->dosage,
                    'images' => $produit->images,
                ]);
            }
        });

        // 6️⃣ Produits disponibles dans les pharmacies
        Pharmacie::all()->each(function ($pharmacie) {

            $produitIds = Produit::inRandomOrder()
                ->take(rand(5, 15))
                ->pluck('id');

            foreach ($produitIds as $produitId) {
                DB::table('pharmacie_produits')->insert([
                    'pharmacie_id' => $pharmacie->id,
                    'produit_id' => $produitId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        // 7️⃣ Super Admin
        $userSuperAdmin = User::factory()->create([
            'nom' => 'haidara',
            'email' => 'sidymohamedcherifhaidara02@gmail.com',
        ]);

        $userSuperAdmin->assignRole(['hyper admin', 'super admin']);
    }
}
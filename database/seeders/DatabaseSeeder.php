<?php

namespace Database\Seeders;

use App\Models\Ordonance;
use App\Models\PhamacieProduit;
use App\Models\Pharmacie;
use App\Models\Produit;
use App\Models\Searched_product;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
  public function run(): void
{
    $this->call(RoleSeeder::class);

 
    Produit::factory()->count(500)->create();

    // 2️⃣ Users
    $users = User::factory(200)->create();

    $pharmacienUsers = $users->slice(1, 50);
    foreach ($pharmacienUsers as $user) {
        $user->assignRole('pharmacy');
    }

    // 3️⃣ Pharmacies
    Pharmacie::factory()->count(100)->create();

    // 4️⃣ Ordonnances (AVANT searched_products)
    Ordonance::factory()->count(30)->create();

   
    Ordonance::all()->each(function ($ordonance) {

        $produits = Produit::inRandomOrder()->take(rand(1, 5))->get();

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

Pharmacie::all()->each(function ($pharmacie) {

    $produits = Produit::inRandomOrder()
        ->take(rand(5, 15))
        ->pluck('id')
        ->toArray();

    DB::table('phamacie_produits')->updateOrInsert(
        ['pharmacie_id' => $pharmacie->id],
        ['produit_id' => implode(',', $produits),
         'created_at' => now(),
         'updated_at' => now()
        ]
    );
});

    // 7️⃣ Super admin
    $userSuperAdmin = User::factory()->create([
        'nom' => 'haidara',
        'email' => 'sidymohamedcherifhaidara02@gmail.com',
    ]);

    $userSuperAdmin->assignRole('hyper admin', 'super admin');
}

}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Produit>
 */
class ProduitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        
           
        $produits = [
            ['Paracétamol', 'Antalgique', 'Douleur', 'Comprimé', '500mg'],
            ['Ibuprofène', 'Anti-inflammatoire', 'Douleur', 'Comprimé', '400mg'],
            ['Amoxicilline', 'Antibiotique', 'Infection', 'Gélule', '500mg'],
            ['Ciprofloxacine', 'Antibiotique', 'Infection', 'Comprimé', '500mg'],
            ['Azithromycine', 'Antibiotique', 'Infection', 'Comprimé', '250mg'],
            ['Metformine', 'Antidiabétique', 'Diabète', 'Comprimé', '850mg'],
            ['Insuline', 'Antidiabétique', 'Diabète', 'Injection', '100UI'],
            ['Loratadine', 'Antihistaminique', 'Allergie', 'Comprimé', '10mg'],
            ['Cetirizine', 'Antihistaminique', 'Allergie', 'Comprimé', '10mg'],
            ['Salbutamol', 'Bronchodilatateur', 'Asthme', 'Inhalateur', '100mcg'],
            ['Ventoline', 'Bronchodilatateur', 'Asthme', 'Inhalateur', '100mcg'],
            ['Oméprazole', 'Antiacide', 'Estomac', 'Gélule', '20mg'],
            ['Esoméprazole', 'Antiacide', 'Estomac', 'Gélule', '40mg'],
            ['Dompéridone', 'Digestif', 'Nausée', 'Comprimé', '10mg'],
            ['Smecta', 'Digestif', 'Diarrhée', 'Sachet', '3g'],
            ['ORS', 'Hydratation', 'Déshydratation', 'Sachet', ''],
            ['Vitamine C', 'Vitamine', 'Immunité', 'Comprimé', '1000mg'],
            ['Fer', 'Complément', 'Anémie', 'Comprimé', '80mg'],
            ['Calcium', 'Complément', 'Os', 'Comprimé', '500mg'],
            ['Zinc', 'Complément', 'Immunité', 'Comprimé', '20mg'],
            ['Paracétamol Sirop', 'Antalgique', 'Douleur', 'Sirop', '120mg/5ml'],
            ['Amoxicilline Sirop', 'Antibiotique', 'Infection', 'Sirop', '250mg/5ml'],
            ['Aspirine', 'Antalgique', 'Douleur', 'Comprimé', '500mg'],
        ];

        $produit = $this->faker->randomElement($produits);

        return [
            'produit' => $produit[0],
            'categorie' => $produit[1],
            'sous_categorie' => $produit[2],
            'forme' => $produit[3],
            'dosage' => $produit[4],
            'images' => json_encode([]), // laisser vide, aucune image par défaut
        ];
        
    }
}

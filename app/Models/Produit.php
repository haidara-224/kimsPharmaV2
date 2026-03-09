<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = ['produit','categorie','sous_categorie','forme','dosage','images'];

    protected $casts = [
        'images' => 'array',
    ];

    public function ordonances(): BelongsToMany
    {
        return $this->belongsToMany(Ordonance::class,'searched_products', 'produit_id', 'ordonance_id');
    }
   public function pharmacies()
    {
        return $this->belongsToMany(Pharmacie::class, 'pharmacie_produits', 'produit_id', 'pharmacie_id');
    }
}

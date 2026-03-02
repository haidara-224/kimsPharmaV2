<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ordonance extends Model
{
    use HasFactory;
        protected $fillable = ['patient', 'age_patient', 'numero', 'fichier', 'date_ord', 'user_id', 'total', 'pharmacie_id', 'status', 'approuve_par', 'frais_livraison', 'feedback', 'commentaire', 'coordonees_livraison', 'statut_livraison'];
    public function pharmacie(): BelongsTo
    {
        return $this->belongsTo(Pharmacie::class);
    }
    public function produits(): BelongsToMany
    {
        return $this->belongsToMany(Produit::class,'searched_products', 'ordonance_id', 'produit_id');
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function approuvePar():BelongsTo
{
    return $this->belongsTo(User::class, 'approuve_par');
}

}

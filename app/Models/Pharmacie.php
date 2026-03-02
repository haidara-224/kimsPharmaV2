<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pharmacie extends Model
{
    use HasFactory;
     protected $fillable = ['name', 'tel', 'adresse', 'description', 'logo', 'image', 'coordonnees', 'disponibilite', 'statut','is_blocked'];
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
    public function ordonances()
    {
        return $this->hasMany(Ordonance::class);
    }
    public function produits():BelongsToMany
    {
        return $this->belongsToMany(Produit::class);
    }
}

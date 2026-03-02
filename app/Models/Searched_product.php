<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Searched_product extends Model
{
    use HasFactory;
    protected $fillable=[
        'ordonance_id',
    'produit_id',
    'nom',
    'categorie',
    'sous_categorie',
    'forme_dosage',
    'prix_unitaire',
    'quantite',
    'prix_total',
    'images'
];

}

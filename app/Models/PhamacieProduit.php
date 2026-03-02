<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhamacieProduit extends Model
{
        use HasFactory;
        protected $fillable=['pharmacie_id','produit_id'];
        
}

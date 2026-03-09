<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PharmacieProduit extends Model
{
        use HasFactory;
        protected $fillable=['pharmacie_id','produit_id','price'];
        public function pharmacie()
        {
            return $this->belongsTo(Pharmacie::class);
        }
        public function produit()
        {
            return $this->belongsTo(Produit::class);
        }
        
}

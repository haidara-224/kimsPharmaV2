<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use LaravelLang\Publisher\Concerns\Has;

class Assurence extends Model
{
    use HasFactory;
    protected $fillable = [
        'entreprise_name',
        'ville',
        'adresse',
        'telephone',
    ];
    protected $casts = [
        'entreprise_name' => 'string',
        'ville' => 'string',
        'adresse' => 'string',
        'telephone' => 'string',
    ];
    public function membres()
    {
        return $this->hasMany(Membre::class); 
    }
}

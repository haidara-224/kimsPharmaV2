<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use LaravelLang\Publisher\Concerns\Has;

class Membre extends Model
{
    use HasFactory;
    protected $fillable = [
        'matricule',
        'name',
        'prenom',
        'telephone',
        'assurence_id',
        'user_id',
    ];
    protected $casts = [
        'matricule' => 'string',
        'name' => 'string',
        'prenom' => 'string',
        'telephone' => 'string',
    ];
    public function assurence()
    {
        return $this->belongsTo(Assurence::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

<?php

use App\Models\Pharmacie;
use App\Models\Produit;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('phamacie_produits', function (Blueprint $table) {
            $table->id();
            $table->text('produit_id');
            $table->foreignIdFor(Pharmacie::class)->constrained()->cascadeOnDelete();
           
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phamacie_produits');
    }
};

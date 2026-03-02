<?php

use App\Models\Ordonance;
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
        Schema::table('searched_products', function (Blueprint $table) {
            $table->foreignIdFor(Ordonance::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Produit::class)->constrained()->cascadeOnDelete();
            $table->string('nom')->nullable();
            $table->string('categorie')->nullable();
            $table->string('sous_categorie')->nullable();
            $table->string('forme_dosage')->nullable();
            $table->decimal('prix_unitaire', 10, 2)->nullable();
            $table->integer('quantite')->default(1);
            $table->decimal('prix_total', 10, 2)->nullable();
            $table->string('images')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('searched_products', function (Blueprint $table) {
            //
        });
    }
};

<?php

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
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
              $table->string('images')->nullable();
            $table->string('produit');
            $table->string('categorie')->nullable();
            $table->string('sous_categorie')->nullable();
            $table->string('forme')->nullable();
            $table->string('dosage')->nullable();
            $table->integer('note')->default(0);
            $table->enum('obtention', ['SP', 'HP']);
            $table->enum('livrable', ['true', 'false']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};

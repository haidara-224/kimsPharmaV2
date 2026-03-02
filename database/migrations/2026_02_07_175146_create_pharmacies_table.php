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
        Schema::create('pharmacies', function (Blueprint $table) {
            $table->id();
               $table->string('name');
        $table->string('tel');
        $table->string('adresse');
        $table->text('description')->nullable();
        $table->string('logo')->nullable();
        $table->string('image')->nullable();
        $table->enum('disponibilite', ['open', 'closed'])->default('closed');
        $table->enum('statut', ['active', 'inactive'])->default('inactive');
          $table->string('coordonnees');
           $table->boolean('is_blocked')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pharmacies');
    }
};

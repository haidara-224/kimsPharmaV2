<?php

use App\Models\Pharmacie;
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
        Schema::table('users', function (Blueprint $table) {
             $table->foreignIdFor(Pharmacie::class)->nullable()->constrained()->cascadeOnDelete();
            $table->string('tel')->nullable();
            $table->enum('user_type',['client','pharmacy','admin'])->default('client');
            $table->string('fichier_piece')->nullable();
            $table->enum('status_piece', ['approuve', 'en attente', 'rejete'])->default('en attente');
               $table->enum('status',['active','inactive']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
              $table->dropIfExists('users');
        });
    }
};

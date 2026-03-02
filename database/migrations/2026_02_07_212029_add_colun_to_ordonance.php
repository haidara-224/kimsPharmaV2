<?php

use App\Models\Pharmacie;
use App\Models\User;
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
        Schema::table('ordonances', function (Blueprint $table) {
              $table->string('numero');
            $table->string('patient');
            $table->string('age_patient');
            $table->string('fichier')->nullable();
            $table->date('date_ord');
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();
            $table->decimal('total', 10, 2)->default(0.00);
            $table->foreignIdFor(Pharmacie::class)->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'processed', 'rejected','to_create','comment'])->default('pending');
            $table->foreignId('approuve_par')->nullable()->constrained('users');
                $table->enum('statut_livraison',['En Pharmacie','Livraison Gratuite','Livraison express','Livraison Standard'])->default('En Pharmacie')->after('approuve_par');
            $table->string('coordonees_livraison')->after('approuve_par');
            $table->text('commentaire')->default(null)->after('approuve_par');
            $table->text('feedback')->default(null)->after('approuve_par');
            $table->decimal('frais_livraison',10,2)->default(null)->after('approuve_par');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ordonances', function (Blueprint $table) {
            //
        });
    }
};

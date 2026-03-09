<?php

use App\Models\Assurence;
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
        Schema::create('assurence_pharmacies', function (Blueprint $table) {
           
                $table->foreignIdFor(Assurence::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(Pharmacie::class)->constrained()->onDelete('cascade');
           $table->primary(['assurence_id','pharmacie_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assurence_pharmacies');
    }
};

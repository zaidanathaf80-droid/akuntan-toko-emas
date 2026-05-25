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
        Schema::create('locked_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('category', 50);
            $table->dateTime('date');
            $table->string('period', 50);
            $table->double('totalModal');
            $table->double('totalBeratTerima');
            $table->double('rataRataLantak');
            $table->double('totalBeratAwal');
            $table->double('totalBeratTambahan');
            $table->double('nilaiKemurnianEmas');
            $table->string('hargaEmasPerGram', 100)->nullable();
            $table->string('hargaEmasStatus', 50);
            $table->json('transaction_ids')->nullable(); // Store locked transaction IDs
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locked_snapshots');
    }
};

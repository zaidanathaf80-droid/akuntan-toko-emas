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
        Schema::table('locked_snapshots', function (Blueprint $table) {
            // Remove unnecessary fields to reduce data size and improve performance
            $table->dropColumn([
                'rataRataLantak',      // Rata-rata Kadar Tambahan
                'totalBeratTerima',    // Total Berat Terima
                'totalBeratAwal',      // Total Berat Awal
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locked_snapshots', function (Blueprint $table) {
            $table->double('rataRataLantak')->nullable();
            $table->double('totalBeratTerima')->nullable();
            $table->double('totalBeratAwal')->nullable();
        });
    }
};

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
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('namaBarang', 100)->nullable();
            $table->string('namaSpesifik', 255)->nullable();
            $table->decimal('kadar', 8, 2)->nullable();
            $table->decimal('beratAwal', 8, 2)->nullable();
            $table->decimal('beratTerima', 8, 2)->nullable();
            $table->double('lantak')->nullable();
            $table->string('jenisProses', 50)->nullable();
            $table->string('jenisTransaksi', 50)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'namaBarang',
                'namaSpesifik',
                'kadar',
                'beratAwal',
                'beratTerima',
                'lantak',
                'jenisProses',
                'jenisTransaksi',
            ]);
        });
    }
};

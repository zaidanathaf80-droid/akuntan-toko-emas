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
            $table->string('kadar_karat', 20)->nullable();
            $table->decimal('berat', 10, 2)->nullable();
            $table->double('ongkos')->nullable();
            $table->double('harga_per_gram')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['kadar_karat', 'berat', 'ongkos', 'harga_per_gram']);
        });
    }
};

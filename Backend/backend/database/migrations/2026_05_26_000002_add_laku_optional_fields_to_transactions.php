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
            // LAKU optional fields
            $table->decimal('laku_panjang', 8, 2)->nullable()->comment('Panjang kalung dalam cm');
            $table->integer('laku_ti')->nullable()->comment('Jumlah bekas pesok diperbaiki');
            $table->integer('laku_pt')->nullable()->comment('Jumlah patrian');
            $table->string('laku_selisih', 50)->nullable()->comment('Selisih berat: T:C= atau C;T=');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['laku_panjang', 'laku_ti', 'laku_pt', 'laku_selisih']);
        });
    }
};

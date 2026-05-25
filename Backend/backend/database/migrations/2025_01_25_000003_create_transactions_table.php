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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense']);
            $table->bigInteger('amount'); // In Rp (rupiah)
            $table->string('category', 50);
            $table->dateTime('date');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index('type');
            $table->index('category');
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

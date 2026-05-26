<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nota_laku', function (Blueprint $table) {
            $table->id();
            $table->string('no_nota', 30)->unique();
            $table->unsignedBigInteger('transaction_id')->nullable(); // FK ke transactions
            $table->string('nama_pelanggan', 100)->nullable();
            $table->string('nama_barang', 100)->nullable();
            $table->string('nama_spesifik', 255)->nullable();
            $table->string('kadar', 20)->nullable();
            $table->string('kode_baki', 20)->nullable();
            $table->integer('baris_ke')->nullable();
            $table->decimal('berat', 10, 3)->nullable();
            $table->bigInteger('harga')->nullable();
            $table->string('harga_per_gram', 50)->nullable();
            $table->decimal('panjang', 8, 2)->nullable();
            $table->integer('ti')->nullable();
            $table->integer('pt')->nullable();
            $table->string('selisih', 50)->nullable();
            $table->text('foto_base64')->nullable(); // Store foto as base64
            $table->boolean('is_kokot')->default(false);
            $table->date('tanggal');
            $table->boolean('is_printed')->default(false);
            $table->timestamp('printed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nota_laku');
    }
};

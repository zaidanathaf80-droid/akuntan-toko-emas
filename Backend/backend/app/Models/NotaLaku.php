<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NotaLaku extends Model
{
    use SoftDeletes;

    protected $table = 'nota_laku';

    protected $fillable = [
        'no_nota',
        'transaction_id',
        'nama_pelanggan',
        'nama_barang',
        'nama_spesifik',
        'kadar',
        'kode_baki',
        'baris_ke',
        'berat',
        'harga',
        'harga_per_gram',
        'panjang',
        'ti',
        'pt',
        'selisih',
        'foto_base64',
        'is_kokot',
        'tanggal',
        'is_printed',
        'printed_at',
    ];

    protected $casts = [
        'berat' => 'float',
        'harga' => 'integer',
        'is_kokot' => 'boolean',
        'is_printed' => 'boolean',
        'tanggal' => 'date:Y-m-d',
        'printed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'type',
        'amount',
        'category',
        'date',
        'notes',
        'namaBarang',
        'namaSpesifik',
        'kadar',
        'beratAwal',
        'beratTerima',
        'lantak',
        'jenisProses',
        'jenisTransaksi',
        'kadar_karat',
        'berat',
        'ongkos',
        'harga_per_gram',
        'kode_baki',
        'baris_ke',
        'is_laku_locked',
    ];

    protected $casts = [
        'date' => 'datetime:Y-m-d\TH:i:s.000\Z',
        'created_at' => 'datetime:Y-m-d\TH:i:s.000\Z',
        'updated_at' => 'datetime:Y-m-d\TH:i:s.000\Z',
        'kadar' => 'float',
        'beratAwal' => 'float',
        'beratTerima' => 'float',
        'lantak' => 'float',
        'berat' => 'float',
        'ongkos' => 'float',
        'harga_per_gram' => 'float',
        'baris_ke' => 'integer',
        'is_laku_locked' => 'boolean',
    ];

    public function getIncrementing()
    {
        return true;
    }

    public function getKeyType()
    {
        return 'int';
    }
}

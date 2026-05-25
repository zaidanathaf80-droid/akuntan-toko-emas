<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LockedSnapshot extends Model
{
    protected $table = 'locked_snapshots';

    protected $fillable = [
        'category',
        'date',
        'period',
        'totalModal',
        'totalBeratTerima',
        'rataRataLantak',
        'totalBeratAwal',
        'totalBeratTambahan',
        'nilaiKemurnianEmas',
        'hargaEmasPerGram',
        'hargaEmasStatus',
        'transaction_ids',
    ];

    protected $casts = [
        'date' => 'datetime:Y-m-d\TH:i:s.000\Z',
        'totalModal' => 'float',
        'totalBeratTerima' => 'float',
        'rataRataLantak' => 'float',
        'totalBeratAwal' => 'float',
        'totalBeratTambahan' => 'float',
        'nilaiKemurnianEmas' => 'float',
        'transaction_ids' => 'array',
        'created_at' => 'datetime:Y-m-d\TH:i:s.000\Z',
        'updated_at' => 'datetime:Y-m-d\TH:i:s.000\Z',
    ];
}

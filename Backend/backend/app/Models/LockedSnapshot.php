<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LockedSnapshot extends Model
{
    use SoftDeletes;

    protected $table = 'locked_snapshots';

    protected $fillable = [
        'category',
        'date',
        'period',
        'totalModal',
        'totalBeratTambahan',
        'nilaiKemurnianEmas',
        'hargaEmasPerGram',
        'hargaEmasStatus',
        'transaction_ids',
    ];

    protected $casts = [
        'date' => 'datetime:Y-m-d\TH:i:s.000\Z',
        'totalModal' => 'float',
        'totalBeratTambahan' => 'float',
        'nilaiKemurnianEmas' => 'float',
        'transaction_ids' => 'array',
        'created_at' => 'datetime:Y-m-d\TH:i:s.000\Z',
        'updated_at' => 'datetime:Y-m-d\TH:i:s.000\Z',
        'deleted_at' => 'datetime:Y-m-d\TH:i:s.000\Z',
    ];
}

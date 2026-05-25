<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing transactions
        Transaction::truncate();

        $transactions = [
            // --- T/KP Category (Jewelry Processing Purchases - Expense) ---
            [
                'type' => 'expense',
                'amount' => 12500000,
                'category' => 'T/KP',
                'date' => Carbon::now()->startOfMonth()->addDays(2)->setHour(10)->setMinute(0)->setSecond(0),
                'notes' => 'Pembelian cincin emas patah dari pelanggan',
                'namaBarang' => 'Cincin',
                'namaSpesifik' => 'Cincin Polos Patah',
                'kadar' => 35,
                'beratAwal' => 28.50,
                'beratTerima' => 28.00,
                'lantak' => 1275.51, // Auto-calculated in UI: 12500000 / 28.00 / 0.35 / 1000
            ],
            [
                'type' => 'expense',
                'amount' => 8400000,
                'category' => 'T/KP',
                'date' => Carbon::now()->startOfMonth()->addDays(5)->setHour(14)->setMinute(30)->setSecond(0),
                'notes' => 'Anting tusuk karat rendah',
                'namaBarang' => 'Anting',
                'namaSpesifik' => 'Anting Klasik',
                'kadar' => 39,
                'beratAwal' => 18.20,
                'beratTerima' => 18.00,
                'lantak' => 1196.58, // 8400000 / 18.00 / 0.39 / 1000
            ],
            [
                'type' => 'expense',
                'amount' => 15000000,
                'category' => 'T/KP',
                'date' => Carbon::now()->setHour(11)->setMinute(0)->setSecond(0),
                'notes' => 'Kalung model italy',
                'namaBarang' => 'Kalung',
                'namaSpesifik' => 'Model Italy Rantai',
                'kadar' => 68,
                'beratAwal' => 17.50,
                'beratTerima' => 17.30,
                'lantak' => 1275.09, // 15000000 / 17.30 / 0.68 / 1000
            ],

            // --- T/LBR Category (Smelting/Refining Transactions - Expense) ---
            [
                'type' => 'expense',
                'amount' => 25000000,
                'category' => 'T/LBR',
                'date' => Carbon::now()->startOfMonth()->addDays(1)->setHour(9)->setMinute(0)->setSecond(0),
                'notes' => 'Peleburan logam mulia untuk stok',
                'namaBarang' => 'Logam Mulia',
                'namaSpesifik' => 'LM 24K Batangan',
                'kadar' => 100,
                'beratAwal' => 20.05,
                'beratTerima' => 20.00,
                'lantak' => 1250.00, // 25000000 / 20.00 / 1.00 / 1000
                'jenisProses' => 'DiLebur',
                'jenisTransaksi' => 'TRANSAKSI',
            ],
            [
                'type' => 'expense',
                'amount' => 0, // Tambahan type has 0 or null amount in UI
                'category' => 'T/LBR',
                'date' => Carbon::now()->startOfMonth()->addDays(8)->setHour(16)->setMinute(0)->setSecond(0),
                'notes' => 'Tambahan berat terima pembersihan tungku',
                'namaBarang' => 'Logam Mulia',
                'namaSpesifik' => 'Sisa Peleburan',
                'kadar' => 100,
                'beratAwal' => 1.50,
                'beratTerima' => 1.45,
                'lantak' => 0,
                'jenisProses' => 'DiLebur',
                'jenisTransaksi' => 'Tambahan',
            ],
            [
                'type' => 'expense',
                'amount' => 18500000,
                'category' => 'T/LBR',
                'date' => Carbon::now()->setHour(15)->setMinute(45)->setSecond(0),
                'notes' => 'Pembelian grosir/kullak cincin',
                'namaBarang' => 'Cincin',
                'namaSpesifik' => 'Cincin Ukiran',
                'kadar' => 68,
                'beratAwal' => 22.40,
                'beratTerima' => 22.00,
                'lantak' => 1236.63, // 18500000 / 22.00 / 0.68 / 1000
                'jenisProses' => 'KULLAK',
                'jenisTransaksi' => 'TRANSAKSI',
            ],

            // --- T/PTG Category (Cutting Purchases - Expense) ---
            [
                'type' => 'expense',
                'amount' => 4500000,
                'category' => 'T/PTG',
                'date' => Carbon::now()->startOfMonth()->addDays(4)->setHour(13)->setMinute(0)->setSecond(0),
                'notes' => 'Ongkos potong plat perak & tembaga campuran',
            ],

            // --- LAKU Category (Sales Revenue - Income) ---
            [
                'type' => 'income',
                'amount' => 38000000,
                'category' => 'LAKU',
                'date' => Carbon::now()->startOfMonth()->addDays(12)->setHour(12)->setMinute(0)->setSecond(0),
                'notes' => 'Penjualan perhiasan emas jadi grosir',
            ],
            [
                'type' => 'income',
                'amount' => 19500000,
                'category' => 'LAKU',
                'date' => Carbon::now()->setHour(16)->setMinute(30)->setSecond(0),
                'notes' => 'Penjualan LM 24 Karat ritel',
            ],
        ];

        foreach ($transactions as $transaction) {
            Transaction::create($transaction);
        }
    }
}

<?php

namespace App\Services;

use Google\Client;
use Google\Service\Sheets;
use Google\Service\Sheets\ValueRange;

class GoogleSheetsService
{
    protected $client;
    protected $service;
    protected $spreadsheetId;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setApplicationName('LuckyAndPower Integration');
        $this->client->setScopes([Sheets::SPREADSHEETS]);
        
        // Path ke file JSON kredensial Google
        $this->client->setAuthConfig(storage_path('app/private/google-sheets.json'));
        $this->client->setAccessType('offline');

        $this->service = new Sheets($this->client);
        $this->spreadsheetId = env('GOOGLE_SHEET_ID');
    }

    /**
     * Sinkronisasi seluruh data transaksi dari database ke Google Sheets (Real-Time CRUD)
     */
    public function syncAll()
    {
        if (empty($this->spreadsheetId)) {
            \Log::warning('Google Sheets ID belum dikonfigurasi di .env');
            return false;
        }

        // 1. Ambil semua data transaksi terbaru dari database terurut berdasarkan tanggal terbaru
        $transactions = \App\Models\Transaction::orderBy('date', 'desc')->get();

        // Nama sheet dan range yang akan dibersihkan & diisi kembali (dari baris 2 kebawah, baris 1 adalah header)
        $range = 'Sheet1!A2:K';

        try {
            // 2. Kosongkan data lama di Google Sheets agar data yang didelete/diupdate sinkron sempurna
            $this->service->spreadsheets_values->clear(
                $this->spreadsheetId, 
                $range, 
                new \Google\Service\Sheets\ClearValuesRequest()
            );
        } catch (\Exception $e) {
            \Log::error('Gagal menghapus data lama di Google Sheets: ' . $e->getMessage());
            return false;
        }

        // Jika tidak ada data transaksi di DB, proses selesai setelah clear
        if ($transactions->isEmpty()) {
            return true;
        }

        // 3. Susun data baru dari database
        $rows = [];
        foreach ($transactions as $transaction) {
            $rows[] = [
                $transaction->date,
                $transaction->type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                $transaction->category,
                $transaction->amount,
                $transaction->namaBarang ?? '-',
                $transaction->berat ?? '-',
                $transaction->kadar_karat ?? '-',
                $transaction->harga_per_gram ?? '-',
                $transaction->ongkos ?? '-',
                $transaction->kode_baki ?? '-',
                $transaction->notes ?? '-'
            ];
        }

        $body = new ValueRange([
            'values' => $rows
        ]);

        $params = [
            'valueInputOption' => 'USER_ENTERED' // Mengubah format teks angka menjadi tipe angka otomatis di Excel
        ];

        try {
            // 4. Tulis seluruh data terbaru secara massal
            $this->service->spreadsheets_values->update(
                $this->spreadsheetId, 
                $range, 
                $body, 
                $params
            );
            return true;
        } catch (\Exception $e) {
            \Log::error('Gagal menulis ulang data ke Google Sheets: ' . $e->getMessage());
            return false;
        }
    }
}

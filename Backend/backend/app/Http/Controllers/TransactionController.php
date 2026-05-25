<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class TransactionController extends Controller
{
    /**
     * GET /transactions
     * Get all transactions
     */
    public function index()
    {
        $transactions = Transaction::orderBy('date', 'desc')->get();
        
        return response()->json($transactions, 200);
    }

    /**
     * POST /transactions
     * Create a new transaction
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:income,expense',
                'amount' => 'nullable|integer|min:0|max:999999999999',
                'category' => 'required|string|min:1|max:50',
                'date' => 'required|date',
                'notes' => 'nullable|string|max:500',
                'namaBarang' => 'nullable|string|max:100',
                'namaSpesifik' => 'nullable|string|max:255',
                'kadar' => 'nullable|numeric',
                'beratAwal' => 'nullable|numeric',
                'beratTerima' => 'nullable|numeric',
                'lantak' => 'nullable|numeric',
                'jenisProses' => 'nullable|string|max:50',
                'jenisTransaksi' => 'nullable|string|max:50',
                'kadar_karat' => 'nullable|string|max:20',
                'berat' => 'nullable|numeric',
                'ongkos' => 'nullable|numeric',
                'harga_per_gram' => 'nullable|numeric',
                'kode_baki' => 'nullable|string|max:10',
                'baris_ke' => 'nullable|integer',
            ]);

            $transaction = Transaction::create([
                'type' => strtolower($validated['type']),
                'amount' => $validated['amount'] ?? 0,
                'category' => $validated['category'],
                'date' => Carbon::parse($validated['date'])->format('Y-m-d H:i:s'),
                'notes' => $validated['notes'] ?? null,
                'namaBarang' => $validated['namaBarang'] ?? null,
                'namaSpesifik' => $validated['namaSpesifik'] ?? null,
                'kadar' => $validated['kadar'] ?? null,
                'beratAwal' => $validated['beratAwal'] ?? null,
                'beratTerima' => $validated['beratTerima'] ?? null,
                'lantak' => $validated['lantak'] ?? null,
                'jenisProses' => $validated['jenisProses'] ?? null,
                'jenisTransaksi' => $validated['jenisTransaksi'] ?? null,
                'kadar_karat' => $validated['kadar_karat'] ?? null,
                'berat' => $validated['berat'] ?? null,
                'ongkos' => $validated['ongkos'] ?? null,
                'harga_per_gram' => $validated['harga_per_gram'] ?? null,
                'kode_baki' => $validated['kode_baki'] ?? null,
                'baris_ke' => $validated['baris_ke'] ?? null,
            ]);

            // Sync to Google Sheets (CRUD)
            try {
                $sheetsService = new \App\Services\GoogleSheetsService();
                $sheetsService->syncAll();
            } catch (\Exception $e) {
                \Log::error('Google Sheets Sync Failed: ' . $e->getMessage());
            }

            return response()->json($transaction, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'statusCode' => 400,
                'errors' => $e->errors(),
            ], 400);
        } catch (\Exception $e) {
            \Log::error('Transaction store failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal menyimpan transaksi: ' . $e->getMessage(),
                'statusCode' => 500,
            ], 500);
        }
    }

    /**
     * GET /transactions/:id
     * Get a single transaction
     */
    public function show($id)
    {
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json([
                'message' => 'Transaction not found',
                'statusCode' => 404,
            ], 404);
        }

        return response()->json($transaction, 200);
    }

    /**
     * PUT /transactions/:id
     * Update a transaction
     */
    public function update(Request $request, $id)
    {
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json([
                'message' => 'Transaction not found',
                'statusCode' => 404,
            ], 404);
        }

        try {
            $validated = $request->validate([
                'type' => 'sometimes|in:income,expense',
                'amount' => 'sometimes|nullable|integer|min:0|max:999999999999',
                'category' => 'sometimes|string|min:1|max:50',
                'date' => 'sometimes|date',
                'notes' => 'nullable|string|max:500',
                'namaBarang' => 'nullable|string|max:100',
                'namaSpesifik' => 'nullable|string|max:255',
                'kadar' => 'nullable|numeric',
                'beratAwal' => 'nullable|numeric',
                'beratTerima' => 'nullable|numeric',
                'lantak' => 'nullable|numeric',
                'jenisProses' => 'nullable|string|max:50',
                'jenisTransaksi' => 'nullable|string|max:50',
                'kadar_karat' => 'nullable|string|max:20',
                'berat' => 'nullable|numeric',
                'ongkos' => 'nullable|numeric',
                'harga_per_gram' => 'nullable|numeric',
                'kode_baki' => 'nullable|string|max:10',
                'baris_ke' => 'nullable|integer',
            ]);

            if (isset($validated['type'])) {
                $transaction->type = strtolower($validated['type']);
            }
            if (array_key_exists('amount', $validated)) {
                $transaction->amount = $validated['amount'] ?? 0;
            }
            if (isset($validated['category'])) {
                $transaction->category = $validated['category'];
            }
            if (isset($validated['date'])) {
                $transaction->date = Carbon::parse($validated['date'])->format('Y-m-d H:i:s');
            }
            if (array_key_exists('notes', $validated)) {
                $transaction->notes = $validated['notes'];
            }
            if (array_key_exists('namaBarang', $validated)) {
                $transaction->namaBarang = $validated['namaBarang'];
            }
            if (array_key_exists('namaSpesifik', $validated)) {
                $transaction->namaSpesifik = $validated['namaSpesifik'];
            }
            if (array_key_exists('kadar', $validated)) {
                $transaction->kadar = $validated['kadar'];
            }
            if (array_key_exists('beratAwal', $validated)) {
                $transaction->beratAwal = $validated['beratAwal'];
            }
            if (array_key_exists('beratTerima', $validated)) {
                $transaction->beratTerima = $validated['beratTerima'];
            }
            if (array_key_exists('lantak', $validated)) {
                $transaction->lantak = $validated['lantak'];
            }
            if (array_key_exists('jenisProses', $validated)) {
                $transaction->jenisProses = $validated['jenisProses'];
            }
            if (array_key_exists('jenisTransaksi', $validated)) {
                $transaction->jenisTransaksi = $validated['jenisTransaksi'];
            }
            if (array_key_exists('kadar_karat', $validated)) {
                $transaction->kadar_karat = $validated['kadar_karat'];
            }
            if (array_key_exists('berat', $validated)) {
                $transaction->berat = $validated['berat'];
            }
            if (array_key_exists('ongkos', $validated)) {
                $transaction->ongkos = $validated['ongkos'];
            }
            if (array_key_exists('harga_per_gram', $validated)) {
                $transaction->harga_per_gram = $validated['harga_per_gram'];
            }
            if (array_key_exists('kode_baki', $validated)) {
                $transaction->kode_baki = $validated['kode_baki'];
            }
            if (array_key_exists('baris_ke', $validated)) {
                $transaction->baris_ke = $validated['baris_ke'];
            }

            $transaction->save();

            // Sync to Google Sheets (CRUD)
            try {
                $sheetsService = new \App\Services\GoogleSheetsService();
                $sheetsService->syncAll();
            } catch (\Exception $e) {
                \Log::error('Google Sheets Sync Failed: ' . $e->getMessage());
            }

            return response()->json($transaction, 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'statusCode' => 400,
                'errors' => $e->errors(),
            ], 400);
        }
    }

    /**
     * DELETE /transactions/:id
     * Delete a transaction
     */
    public function destroy($id)
    {
        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json([
                'message' => 'Transaction not found',
                'statusCode' => 404,
            ], 404);
        }

        $transaction->delete();

        // Sync to Google Sheets (CRUD)
        try {
            $sheetsService = new \App\Services\GoogleSheetsService();
            $sheetsService->syncAll();
        } catch (\Exception $e) {
            \Log::error('Google Sheets Sync Failed: ' . $e->getMessage());
        }

        return response()->noContent();
    }

    /**
     * POST /transactions/filter
     * Filter transactions with criteria
     */
    public function filter(Request $request)
    {
        $query = Transaction::query();

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('category') && $request->category) {
            $query->whereRaw('LOWER(category) LIKE ?', [strtolower($request->category)]);
        }

        if ($request->has('startDate') && $request->startDate) {
            $query->whereDate('date', '>=', $request->startDate);
        }

        if ($request->has('endDate') && $request->endDate) {
            $query->whereDate('date', '<=', $request->endDate);
        }

        if ($request->has('minAmount') && $request->minAmount !== null) {
            $query->where('amount', '>=', $request->minAmount);
        }

        if ($request->has('maxAmount') && $request->maxAmount !== null) {
            $query->where('amount', '<=', $request->maxAmount);
        }

        $transactions = $query->orderBy('date', 'desc')->get();

        return response()->json($transactions, 200);
    }

    /**
     * GET /dashboard/summary
     * Get summary data for dashboard
     */
    public function dashboardSummary(Request $request)
    {
        $period = $request->query('period', 'monthly');
        
        // Determine date range
        $now = Carbon::now();
        $startDate = match($period) {
            'daily' => $now->clone()->startOfDay(),
            'yearly' => $now->clone()->startOfYear(),
            default => $now->clone()->startOfMonth(),
        };

        // Calculate totals
        $totalIncome = Transaction::where('type', 'income')
            ->where('date', '>=', $startDate)
            ->sum('amount');

        $totalExpense = Transaction::where('type', 'expense')
            ->where('date', '>=', $startDate)
            ->sum('amount');

        $transactionCount = Transaction::where('date', '>=', $startDate)->count();

        // Group by category
        $incomeByType = Transaction::where('type', 'income')
            ->where('date', '>=', $startDate)
            ->groupBy('category')
            ->selectRaw('category, SUM(amount) as total')
            ->pluck('total', 'category')
            ->toArray();

        $expenseByType = Transaction::where('type', 'expense')
            ->where('date', '>=', $startDate)
            ->groupBy('category')
            ->selectRaw('category, SUM(amount) as total')
            ->pluck('total', 'category')
            ->toArray();

        return response()->json([
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netBalance' => $totalIncome - $totalExpense,
            'transactionCount' => $transactionCount,
            'currentPeriod' => $period,
            'incomeByType' => $incomeByType,
            'expenseByType' => $expenseByType,
        ], 200);
    }

    /**
     * GET /dashboard/stats
     * Get statistics based on period
     */
    public function dashboardStats(Request $request)
    {
        $period = $request->query('period', 'monthly');
        
        $now = Carbon::now();
        
        // Current period calculations
        $currentStartDate = match($period) {
            'daily' => $now->clone()->startOfDay(),
            'yearly' => $now->clone()->startOfYear(),
            default => $now->clone()->startOfMonth(),
        };
        
        $currentEndDate = match($period) {
            'daily' => $now->clone()->endOfDay(),
            'yearly' => $now->clone()->endOfYear(),
            default => $now->clone()->endOfMonth(),
        };

        // Previous period calculations
        $previousStartDate = match($period) {
            'daily' => $now->clone()->subDay()->startOfDay(),
            'yearly' => $now->clone()->subYear()->startOfYear(),
            default => $now->clone()->subMonth()->startOfMonth(),
        };
        
        $previousEndDate = match($period) {
            'daily' => $now->clone()->subDay()->endOfDay(),
            'yearly' => $now->clone()->subYear()->endOfYear(),
            default => $now->clone()->subMonth()->endOfMonth(),
        };

        // Current period stats
        $currentIncome = Transaction::where('type', 'income')
            ->whereBetween('date', [$currentStartDate, $currentEndDate])
            ->sum('amount');

        $currentExpense = Transaction::where('type', 'expense')
            ->whereBetween('date', [$currentStartDate, $currentEndDate])
            ->sum('amount');

        $currentTransactionCount = Transaction::whereBetween('date', [$currentStartDate, $currentEndDate])->count();

        // Previous period stats
        $previousIncome = Transaction::where('type', 'income')
            ->whereBetween('date', [$previousStartDate, $previousEndDate])
            ->sum('amount');

        $previousExpense = Transaction::where('type', 'expense')
            ->whereBetween('date', [$previousStartDate, $previousEndDate])
            ->sum('amount');

        $previousTransactionCount = Transaction::whereBetween('date', [$previousStartDate, $previousEndDate])->count();

        // Calculate percentage changes
        $incomeChange = $previousIncome > 0 
            ? round((($currentIncome - $previousIncome) / $previousIncome) * 100, 2)
            : 0;

        $expenseChange = $previousExpense > 0 
            ? round((($currentExpense - $previousExpense) / $previousExpense) * 100, 2)
            : 0;

        return response()->json([
            'period' => $period,
            'currentPeriodStats' => [
                'income' => $currentIncome,
                'expense' => $currentExpense,
                'balance' => $currentIncome - $currentExpense,
                'transactionCount' => $currentTransactionCount,
            ],
            'previousPeriodStats' => [
                'income' => $previousIncome,
                'expense' => $previousExpense,
                'balance' => $previousIncome - $previousExpense,
                'transactionCount' => $previousTransactionCount,
            ],
            'incomeChange' => $incomeChange,
            'expenseChange' => $expenseChange,
        ], 200);
    }

    /**
     * GET /dashboard/reports
     * Get data for reports page
     */
    public function dashboardReports()
    {
        $totalIncome = Transaction::where('type', 'income')->sum('amount');
        $totalExpense = Transaction::where('type', 'expense')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        // Categories breakdown
        $allTransactions = Transaction::selectRaw('category, type, SUM(amount) as amount')
            ->groupBy('category', 'type')
            ->get();

        $categoriesBreakdown = $allTransactions->map(function ($transaction) use ($totalIncome, $totalExpense) {
            $total = $transaction->type === 'income' ? $totalIncome : $totalExpense;
            $percentage = $total > 0 ? round(($transaction->amount / $total) * 100, 2) : 0;

            return [
                'category' => $transaction->category,
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'percentage' => $percentage,
            ];
        })->toArray();

        // Monthly trend
        $monthlyTrend = Transaction::selectRaw('DATE_FORMAT(date, "%Y-%m") as month, type, SUM(amount) as total')
            ->groupBy('month', 'type')
            ->orderBy('month', 'asc')
            ->get();

        $trend = [];
        foreach ($monthlyTrend as $item) {
            $month = $item->month;
            if (!isset($trend[$month])) {
                $trend[$month] = ['month' => $month, 'income' => 0, 'expense' => 0];
            }
            if ($item->type === 'income') {
                $trend[$month]['income'] = $item->total;
            } else {
                $trend[$month]['expense'] = $item->total;
            }
        }

        return response()->json([
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'netBalance' => $netBalance,
            'categoriesBreakdown' => $categoriesBreakdown,
            'monthlyTrend' => array_values($trend),
        ], 200);
    }

    /**
     * GET /laku-locks
     * Get all transaction IDs that are permanently locked as LAKU sold items
     */
    public function getLakuLocks()
    {
        $ids = Transaction::where('is_laku_locked', true)
            ->pluck('id')
            ->toArray();

        return response()->json(['locked_ids' => $ids], 200);
    }

    /**
     * POST /laku-locks
     * Permanently lock a batch of transaction IDs as LAKU sold items
     * Body: { "ids": [1, 2, 3, ...] }
     */
    public function storeLakuLocks(Request $request)
    {
        try {
            $validated = $request->validate([
                'ids' => 'required|array',
                'ids.*' => 'integer|exists:transactions,id',
            ]);

            Transaction::whereIn('id', $validated['ids'])
                ->update(['is_laku_locked' => true]);

            $lockedIds = Transaction::where('is_laku_locked', true)
                ->pluck('id')
                ->toArray();

            return response()->json([
                'message' => 'Transactions locked successfully',
                'locked_ids' => $lockedIds,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'statusCode' => 400,
                'errors' => $e->errors(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to lock transactions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /categories
     * Get available categories
     */
    public function categories()
    {
        $incomeCategories = Transaction::where('type', 'income')
            ->distinct('category')
            ->pluck('category')
            ->toArray();

        $expenseCategories = Transaction::where('type', 'expense')
            ->distinct('category')
            ->pluck('category')
            ->toArray();

        return response()->json([
            'income' => $incomeCategories,
            'expense' => $expenseCategories,
        ], 200);
    }
}

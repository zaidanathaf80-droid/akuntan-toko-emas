<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\LockedSnapshotController;
use App\Http\Controllers\NotaLakuController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check endpoint
Route::get('/', function () {
    return response()->json([
        'message' => 'LuckyAndPower API',
        'status' => 'ok',
        'timestamp' => now()
    ]);
});

// Transaction endpoints
Route::get('/transactions', [TransactionController::class, 'index']);
Route::post('/transactions', [TransactionController::class, 'store']);
Route::get('/transactions/{id}', [TransactionController::class, 'show']);
Route::put('/transactions/{id}', [TransactionController::class, 'update']);
Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);

// Filter endpoint
Route::post('/transactions/filter', [TransactionController::class, 'filter']);

// Dashboard endpoints
Route::get('/dashboard/summary', [TransactionController::class, 'dashboardSummary']);
Route::get('/dashboard/stats', [TransactionController::class, 'dashboardStats']);
Route::get('/dashboard/reports', [TransactionController::class, 'dashboardReports']);

// Categories endpoint
Route::get('/categories', [TransactionController::class, 'categories']);

// Locked Snapshot endpoints
Route::get('/locked-snapshots', [LockedSnapshotController::class, 'index']);
Route::post('/locked-snapshots', [LockedSnapshotController::class, 'store']);
Route::put('/locked-snapshots/{id}', [LockedSnapshotController::class, 'update']);
Route::delete('/locked-snapshots/{id}', [LockedSnapshotController::class, 'destroy']);
Route::post('/locked-snapshots/{id}/restore', [LockedSnapshotController::class, 'restore']);
Route::get('/locked-snapshots/trash/list', [LockedSnapshotController::class, 'trash']);

// Laku Lock endpoints (permanent checkbox lock for Data Terjual sidebar)
Route::get('/laku-locks', [TransactionController::class, 'getLakuLocks']);
Route::post('/laku-locks', [TransactionController::class, 'storeLakuLocks']);

// Nota LAKU endpoints
Route::get('/nota-laku', [NotaLakuController::class, 'index']);
Route::post('/nota-laku', [NotaLakuController::class, 'store']);
Route::post('/nota-laku/{id}/print', [NotaLakuController::class, 'markPrinted']);
Route::delete('/nota-laku/{id}', [NotaLakuController::class, 'destroy']);

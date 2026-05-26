<?php

namespace App\Http\Controllers;

use App\Models\NotaLaku;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class NotaLakuController extends Controller
{
    /**
     * GET /nota-laku
     * Get all nota (not printed / not deleted)
     */
    public function index()
    {
        try {
            $notas = NotaLaku::orderBy('created_at', 'desc')->get();
            return response()->json($notas, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch nota', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /nota-laku
     * Create a new nota after transaction saved
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_nota'        => 'required|string|max:30',
                'transaction_id' => 'nullable|integer',
                'nama_pelanggan' => 'nullable|string|max:100',
                'nama_barang'    => 'nullable|string|max:100',
                'nama_spesifik'  => 'nullable|string|max:255',
                'kadar'          => 'nullable|string|max:20',
                'kode_baki'      => 'nullable|string|max:20',
                'baris_ke'       => 'nullable|integer',
                'berat'          => 'nullable|numeric',
                'harga'          => 'nullable|integer',
                'harga_per_gram' => 'nullable|string|max:50',
                'panjang'        => 'nullable|numeric',
                'ti'             => 'nullable|integer',
                'pt'             => 'nullable|integer',
                'selisih'        => 'nullable|string|max:50',
                'foto_base64'    => 'nullable|string',
                'is_kokot'       => 'nullable|boolean',
                'tanggal'        => 'required|date',
            ]);

            $nota = NotaLaku::create($validated);

            return response()->json($nota, 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation error', 'errors' => $e->errors()], 400);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create nota', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /nota-laku/{id}/print
     * Mark nota as printed and soft-delete it (reset)
     */
    public function markPrinted($id)
    {
        $nota = NotaLaku::find($id);

        if (!$nota) {
            return response()->json(['message' => 'Nota not found'], 404);
        }

        try {
            $nota->is_printed = true;
            $nota->printed_at = Carbon::now();
            $nota->save();

            // Soft delete - nota sudah dicetak, tidak perlu ditampilkan lagi
            $nota->delete();

            return response()->json(['message' => 'Nota marked as printed and reset', 'printed_at' => $nota->printed_at], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to mark as printed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /nota-laku/{id}
     * Soft delete nota (manual reset)
     */
    public function destroy($id)
    {
        $nota = NotaLaku::find($id);

        if (!$nota) {
            return response()->json(['message' => 'Nota not found'], 404);
        }

        try {
            $nota->delete();
            return response()->json(['message' => 'Nota deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete nota', 'error' => $e->getMessage()], 500);
        }
    }
}

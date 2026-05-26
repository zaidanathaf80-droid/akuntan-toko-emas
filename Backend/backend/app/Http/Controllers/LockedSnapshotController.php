<?php

namespace App\Http\Controllers;

use App\Models\LockedSnapshot;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class LockedSnapshotController extends Controller
{
    /**
     * GET /locked-snapshots
     * Fetch all locked snapshots
     */
    public function index(Request $request)
    {
        try {
            $query = LockedSnapshot::query();

            if ($request->has('category')) {
                $query->where('category', $request->query('category'));
            }

            $snapshots = $query->orderBy('created_at', 'asc')->get();

            return response()->json($snapshots, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch snapshots',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /locked-snapshots
     * Create a new locked snapshot
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'category' => 'required|string|max:50',
                'date' => 'required|date',
                'period' => 'required|string|max:50',
                'totalModal' => 'required|numeric',
                'totalBeratTambahan' => 'required|numeric',
                'nilaiKemurnianEmas' => 'required|numeric',
                'hargaEmasPerGram' => 'nullable|string|max:100',
                'hargaEmasStatus' => 'required|string|max:50',
                'transaction_ids' => 'nullable|array',
            ]);

            $snapshot = LockedSnapshot::create([
                'category' => $validated['category'],
                'date' => Carbon::parse($validated['date'])->format('Y-m-d H:i:s'),
                'period' => $validated['period'],
                'totalModal' => $validated['totalModal'],
                'totalBeratTambahan' => $validated['totalBeratTambahan'],
                'nilaiKemurnianEmas' => $validated['nilaiKemurnianEmas'],
                'hargaEmasPerGram' => $validated['hargaEmasPerGram'] ?? '',
                'hargaEmasStatus' => $validated['hargaEmasStatus'],
                'transaction_ids' => $validated['transaction_ids'] ?? [],
            ]);

            return response()->json($snapshot, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'statusCode' => 400,
                'errors' => $e->errors(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create snapshot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PUT /locked-snapshots/{id}
     * Update an existing snapshot (e.g. updating gold price or status)
     */
    public function update(Request $request, $id)
    {
        $snapshot = LockedSnapshot::find($id);

        if (!$snapshot) {
            return response()->json([
                'message' => 'Snapshot not found',
                'statusCode' => 404,
            ], 404);
        }

        try {
            $validated = $request->validate([
                'hargaEmasPerGram' => 'nullable|string|max:100',
                'hargaEmasStatus' => 'sometimes|string|max:50',
            ]);

            if (array_key_exists('hargaEmasPerGram', $validated)) {
                $snapshot->hargaEmasPerGram = $validated['hargaEmasPerGram'] ?? '';
            }
            if (isset($validated['hargaEmasStatus'])) {
                $snapshot->hargaEmasStatus = $validated['hargaEmasStatus'];
            }

            $snapshot->save();

            return response()->json($snapshot, 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation error',
                'statusCode' => 400,
                'errors' => $e->errors(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update snapshot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DELETE /locked-snapshots/{id}
     * Soft delete a snapshot (mark as deleted, don't remove from DB)
     */
    public function destroy($id)
    {
        $snapshot = LockedSnapshot::find($id);

        if (!$snapshot) {
            return response()->json([
                'message' => 'Snapshot not found',
                'statusCode' => 404,
            ], 404);
        }

        try {
            // Soft delete - mark as deleted but keep in database
            $snapshot->delete();

            return response()->json([
                'message' => 'Snapshot deleted successfully',
                'statusCode' => 200,
                'deleted_at' => $snapshot->deleted_at,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete snapshot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * POST /locked-snapshots/{id}/restore
     * Restore a soft-deleted snapshot
     */
    public function restore($id)
    {
        $snapshot = LockedSnapshot::withTrashed()->find($id);

        if (!$snapshot) {
            return response()->json([
                'message' => 'Snapshot not found',
                'statusCode' => 404,
            ], 404);
        }

        try {
            $snapshot->restore();

            return response()->json([
                'message' => 'Snapshot restored successfully',
                'statusCode' => 200,
                'data' => $snapshot,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to restore snapshot',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /locked-snapshots/trash/list
     * Get all soft-deleted snapshots (for recovery)
     */
    public function trash()
    {
        try {
            $trashedSnapshots = LockedSnapshot::onlyTrashed()->orderBy('deleted_at', 'desc')->get();

            return response()->json($trashedSnapshots, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch trash',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}

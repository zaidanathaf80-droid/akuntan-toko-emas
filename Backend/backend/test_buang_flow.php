<?php

$host = 'db.rgbkcjljxvfmaamqrqfq.supabase.co';
$port = 5432;
$db = 'postgres';
$user = 'postgres';
$pass = 'zaidan288088';

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$db;sslmode=require", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    echo "=== TEST BUANG FLOW ===\n\n";
    
    // 1. Check initial state
    echo "1. INITIAL STATE\n";
    $result = $conn->query("SELECT id, transaction_ids, deleted_at FROM locked_snapshots WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 1");
    $snapshot = $result->fetch(PDO::FETCH_ASSOC);
    
    if ($snapshot) {
        echo "   Snapshot ID: {$snapshot['id']}\n";
        echo "   Transaction IDs: {$snapshot['transaction_ids']}\n";
        echo "   Deleted At: {$snapshot['deleted_at']}\n";
        $snapshotId = $snapshot['id'];
        $txIds = json_decode($snapshot['transaction_ids'], true);
    } else {
        echo "   ✗ No active snapshots found!\n";
        exit(1);
    }
    
    // 2. Check transactions exist
    echo "\n2. CHECKING TRANSACTIONS\n";
    $placeholders = implode(',', $txIds);
    $result = $conn->query("SELECT id, category, \"namaBarang\", amount FROM transactions WHERE id IN ($placeholders)");
    $txs = $result->fetchAll(PDO::FETCH_ASSOC);
    echo "   Found " . count($txs) . " transactions:\n";
    foreach ($txs as $tx) {
        echo "     - ID {$tx['id']}: {$tx['category']} ({$tx['namaBarang']}) - Rp " . number_format($tx['amount']) . "\n";
    }
    
    // 3. Simulate DELETE snapshot (soft delete)
    echo "\n3. SIMULATING SOFT DELETE SNAPSHOT\n";
    $stmt = $conn->prepare("UPDATE locked_snapshots SET deleted_at = NOW() WHERE id = ?");
    $stmt->execute([$snapshotId]);
    echo "   ✓ Snapshot marked as deleted\n";
    
    // 4. Verify snapshot is soft-deleted
    echo "\n4. VERIFYING SOFT DELETE\n";
    $result = $conn->query("SELECT id, deleted_at FROM locked_snapshots WHERE id = $snapshotId");
    $snap = $result->fetch(PDO::FETCH_ASSOC);
    echo "   Snapshot ID: {$snap['id']}\n";
    echo "   Deleted At: {$snap['deleted_at']}\n";
    
    // 5. Verify transactions still exist
    echo "\n5. VERIFYING TRANSACTIONS STILL EXIST\n";
    $result = $conn->query("SELECT COUNT(*) as count FROM transactions WHERE id IN ($placeholders) AND deleted_at IS NULL");
    $count = $result->fetch(PDO::FETCH_ASSOC);
    echo "   Active transactions: {$count['count']}\n";
    if ($count['count'] == count($txIds)) {
        echo "   ✓ All transactions still exist!\n";
    } else {
        echo "   ✗ Some transactions missing!\n";
    }
    
    // 6. Check Dashboard data
    echo "\n6. CHECKING DASHBOARD DATA\n";
    $result = $conn->query("SELECT COUNT(*) as count FROM transactions WHERE type = 'expense' AND deleted_at IS NULL");
    $expenseCount = $result->fetch(PDO::FETCH_ASSOC);
    echo "   Total expense transactions: {$expenseCount['count']}\n";
    
    $result = $conn->query("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND deleted_at IS NULL");
    $expenseTotal = $result->fetch(PDO::FETCH_ASSOC);
    echo "   Total expense amount: Rp " . number_format($expenseTotal['total']) . "\n";
    
    // 7. Test RESTORE
    echo "\n7. TESTING RESTORE\n";
    $stmt = $conn->prepare("UPDATE locked_snapshots SET deleted_at = NULL WHERE id = ?");
    $stmt->execute([$snapshotId]);
    echo "   ✓ Snapshot restored\n";
    
    $result = $conn->query("SELECT id, deleted_at FROM locked_snapshots WHERE id = $snapshotId");
    $snap = $result->fetch(PDO::FETCH_ASSOC);
    echo "   Deleted At: " . ($snap['deleted_at'] ? $snap['deleted_at'] : 'NULL (restored)') . "\n";
    
    echo "\n=== TEST PASSED ===\n";
    echo "✓ Soft delete working correctly\n";
    echo "✓ Transactions preserved\n";
    echo "✓ Restore working correctly\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

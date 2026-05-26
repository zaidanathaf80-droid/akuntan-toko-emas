<?php

$host = 'db.rgbkcjljxvfmaamqrqfq.supabase.co';
$port = 5432;
$db = 'postgres';
$user = 'postgres';
$pass = 'zaidan288088';

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$db;sslmode=require", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    echo "=== SEEDING TEST DATA ===\n\n";
    
    // 1. Clear old data
    echo "1. CLEARING OLD DATA\n";
    $conn->exec("DELETE FROM locked_snapshots WHERE deleted_at IS NOT NULL");
    $conn->exec("DELETE FROM transactions WHERE category = 'T/LBR' AND created_at > NOW() - INTERVAL '1 day'");
    echo "   ✓ Old data cleared\n";
    
    // 2. Create 3 test transactions
    echo "\n2. CREATING TEST TRANSACTIONS\n";
    $txIds = [];
    for ($i = 1; $i <= 3; $i++) {
        $stmt = $conn->prepare("
            INSERT INTO transactions (
                category, type, \"jenisTransaksi\", \"namaBarang\", amount, 
                \"beratTerima\", \"beratAwal\", lantak, 
                kadar, \"harga_per_gram\", date, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
            RETURNING id
        ");
        
        $stmt->execute([
            'T/LBR',
            'expense',
            'Beli',
            'Emas Perhiasan ' . $i,
            1000000 * $i,
            100 + $i,
            50 + $i,
            75,
            75,
            1000000
        ]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $txIds[] = $result['id'];
        echo "   ✓ Transaction ID {$result['id']} created\n";
    }
    
    // 3. Create locked snapshot with these transactions
    echo "\n3. CREATING LOCKED SNAPSHOT\n";
    $txIdsJson = json_encode($txIds);
    
    $stmt = $conn->prepare("
        INSERT INTO locked_snapshots (
            category, date, period, \"totalModal\", \"totalBeratTerima\",
            \"rataRataLantak\", \"totalBeratAwal\", \"totalBeratTambahan\",
            \"nilaiKemurnianEmas\", \"hargaEmasPerGram\", \"hargaEmasStatus\",
            transaction_ids, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        RETURNING id
    ");
    
    $stmt->execute([
        'T/LBR',
        date('Y-m-d H:i:s'),
        'May 2026',
        3000000,
        300,
        75,
        150,
        150,
        75,
        '1000000',
        'Aktif',
        $txIdsJson
    ]);
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $snapshotId = $result['id'];
    echo "   ✓ Snapshot ID {$snapshotId} created\n";
    echo "   ✓ Transaction IDs: " . implode(', ', $txIds) . "\n";
    
    // 4. Verify data
    echo "\n4. VERIFYING DATA\n";
    $result = $conn->query("SELECT COUNT(*) as count FROM transactions WHERE category = 'T/LBR' AND deleted_at IS NULL");
    $count = $result->fetch(PDO::FETCH_ASSOC);
    echo "   ✓ Total T/LBR transactions: {$count['count']}\n";
    
    $result = $conn->query("SELECT COUNT(*) as count FROM locked_snapshots WHERE deleted_at IS NULL");
    $count = $result->fetch(PDO::FETCH_ASSOC);
    echo "   ✓ Total active snapshots: {$count['count']}\n";
    
    echo "\n=== TEST DATA SEEDED SUCCESSFULLY ===\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}

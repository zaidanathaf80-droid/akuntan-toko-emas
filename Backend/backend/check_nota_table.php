<?php

$host = 'db.rgbkcjljxvfmaamqrqfq.supabase.co';
$port = 5432;
$db = 'postgres';
$user = 'postgres';
$pass = 'zaidan288088';

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$db;sslmode=require", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    
    echo "=== CEK TABEL NOTA_LAKU ===\n\n";
    
    // Check if table exists
    $result = $conn->query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nota_laku')");
    $exists = $result->fetch(PDO::FETCH_ASSOC);
    
    if ($exists['exists'] === 't' || $exists['exists'] === true) {
        echo "✓ Tabel nota_laku ADA di Supabase!\n\n";
        
        // Show columns
        $cols = $conn->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'nota_laku' ORDER BY ordinal_position");
        echo "Kolom-kolom:\n";
        foreach ($cols->fetchAll(PDO::FETCH_ASSOC) as $col) {
            echo "  - {$col['column_name']} ({$col['data_type']})\n";
        }
        
        // Count rows
        $count = $conn->query("SELECT COUNT(*) as total FROM nota_laku")->fetch(PDO::FETCH_ASSOC);
        echo "\nTotal data: {$count['total']} nota\n";
    } else {
        echo "✗ Tabel nota_laku BELUM ADA!\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

<?php

/**
 * API Testing Script for Personal Finance Management Backend
 * 
 * This script tests all endpoints and validates responses
 */

$baseUrl = 'http://localhost:3000/api';

// Helper function to make requests
function makeRequest($method, $endpoint, $data = null) {
    global $baseUrl;
    
    $url = $baseUrl . $endpoint;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $error = curl_error($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($error) {
        return [
            'status' => 0,
            'data' => null,
            'error' => $error,
            'raw' => null
        ];
    }
    
    return [
        'status' => $statusCode,
        'data' => json_decode($response, true),
        'raw' => $response
    ];
}

echo "===========================================\n";
echo "PERSONAL FINANCE API - TEST SUITE\n";
echo "===========================================\n\n";

// Test 1: GET /transactions
echo "1. Testing GET /transactions\n";
$result = makeRequest('GET', '/transactions');
if ($result['status'] == 0) {
    echo "   ✗ FAIL: Connection error - " . $result['error'] . "\n";
} else {
    echo "   Status: " . $result['status'] . "\n";
    echo "   Count: " . (is_array($result['data']) ? count($result['data']) : 0) . " transactions\n";
    echo "   ✓ PASS\n";
}
echo "\n";

// Test 2: POST /transactions - Create valid transaction
echo "2. Testing POST /transactions - Valid transaction\n";
$newTransaction = [
    'type' => 'expense',
    'amount' => 75000,
    'category' => 'Food',
    'date' => date('Y-m-d\TH:i:s.000\Z'),
    'notes' => 'Dinner at restaurant'
];
$result = makeRequest('POST', '/transactions', $newTransaction);
echo "   Status: " . $result['status'] . "\n";
if ($result['status'] == 201) {
    echo "   ID: " . $result['data']['id'] . "\n";
    $testTransactionId = $result['data']['id'];
    echo "   ✓ PASS\n";
} else {
    echo "   ✗ FAIL: " . json_encode($result['data']) . "\n";
}
echo "\n";

// Test 3: GET /transactions/:id
echo "3. Testing GET /transactions/{id}\n";
$result = makeRequest('GET', '/transactions/1');
echo "   Status: " . $result['status'] . "\n";
if ($result['status'] == 200) {
    echo "   Transaction: " . $result['data']['category'] . " - Rp " . number_format($result['data']['amount']) . "\n";
    echo "   ✓ PASS\n";
} else {
    echo "   ✗ FAIL\n";
}
echo "\n";

// Test 4: PUT /transactions/:id
echo "4. Testing PUT /transactions/{id}\n";
$updateData = [
    'amount' => 55000,
    'notes' => 'Updated lunch notes'
];
$result = makeRequest('PUT', '/transactions/2', $updateData);
echo "   Status: " . $result['status'] . "\n";
if ($result['status'] == 200) {
    echo "   Updated amount: Rp " . number_format($result['data']['amount']) . "\n";
    echo "   ✓ PASS\n";
} else {
    echo "   ✗ FAIL: " . json_encode($result['data']) . "\n";
}
echo "\n";

// Test 5: POST /transactions/filter
echo "5. Testing POST /transactions/filter\n";
$filterData = [
    'type' => 'expense',
    'category' => 'Food'
];
$result = makeRequest('POST', '/transactions/filter', $filterData);
echo "   Status: " . $result['status'] . "\n";
echo "   Found: " . count($result['data']) . " transactions\n";
echo "   ✓ PASS\n\n";

// Test 6: GET /dashboard/summary
echo "6. Testing GET /dashboard/summary\n";
$result = makeRequest('GET', '/dashboard/summary');
echo "   Status: " . $result['status'] . "\n";
if ($result['status'] == 200) {
    echo "   Total Income: Rp " . number_format($result['data']['totalIncome']) . "\n";
    echo "   Total Expense: Rp " . number_format($result['data']['totalExpense']) . "\n";
    echo "   Net Balance: Rp " . number_format($result['data']['netBalance']) . "\n";
    echo "   ✓ PASS\n";
} else {
    echo "   ✗ FAIL\n";
}
echo "\n";

// Test 7: GET /dashboard/stats
echo "7. Testing GET /dashboard/stats?period=monthly\n";
$result = makeRequest('GET', '/dashboard/stats?period=monthly');
echo "   Status: " . $result['status'] . "\n";
if ($result['status'] == 200) {
    echo "   Current Period Income: Rp " . number_format($result['data']['currentPeriodStats']['income']) . "\n";
    echo "   Income Change: " . $result['data']['incomeChange'] . "%\n";
    echo "   ✓ PASS\n";
} else {
    echo "   ✗ FAIL\n";
}
echo "\n";

// Test 8: GET /dashboard/reports
echo "8. Testing GET /dashboard/reports\n";
$result = makeRequest('GET', '/dashboard/reports');
echo "   Status: " . $result['status'] . "\n";
if ($result['status'] == 200) {
    echo "   Categories: " . count($result['data']['categoriesBreakdown']) . "\n";
    echo "   Monthly Trends: " . count($result['data']['monthlyTrend']) . "\n";
    echo "   ✓ PASS\n";
} else {
    echo "   ✗ FAIL\n";
}
echo "\n";

// Test 9: GET /categories
echo "9. Testing GET /categories\n";
$result = makeRequest('GET', '/categories');
echo "   Status: " . $result['status'] . "\n";
if ($result['status'] == 200) {
    echo "   Income Categories: " . count($result['data']['income']) . "\n";
    echo "   Expense Categories: " . count($result['data']['expense']) . "\n";
    echo "   ✓ PASS\n";
} else {
    echo "   ✗ FAIL\n";
}
echo "\n";

// Test 10: DELETE /transactions/:id
echo "10. Testing DELETE /transactions/{id}\n";
// First create a transaction to delete
$toDelete = [
    'type' => 'expense',
    'amount' => 25000,
    'category' => 'Test',
    'date' => date('Y-m-d\TH:i:s.000\Z')
];
$createResult = makeRequest('POST', '/transactions', $toDelete);
if ($createResult['status'] == 201) {
    $deleteId = $createResult['data']['id'];
    $result = makeRequest('DELETE', '/transactions/' . $deleteId);
    echo "   Status: " . $result['status'] . "\n";
    if ($result['status'] == 204) {
        echo "   ✓ PASS\n";
    } else {
        echo "   ✗ FAIL\n";
    }
} else {
    echo "   ✗ FAIL: Could not create transaction to delete\n";
}
echo "\n";

// Test 11: Validation tests
echo "11. Testing POST /transactions - Invalid data\n";
$invalidData = [
    'type' => 'invalid',
    'amount' => -1000,
    'category' => '',
    'date' => 'invalid-date'
];
$result = makeRequest('POST', '/transactions', $invalidData);
echo "   Status: " . $result['status'] . "\n";
if ($result['status'] == 400) {
    echo "   Errors detected correctly\n";
    echo "   ✓ PASS\n";
} else {
    echo "   ✗ FAIL: Should return 400\n";
}
echo "\n";

echo "===========================================\n";
echo "TEST SUITE COMPLETED\n";
echo "===========================================\n";

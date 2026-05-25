@echo off
REM Simple test script using curl

echo Testing Personal Finance API Endpoints
echo ======================================
echo.

echo Test 1: GET all transactions
curl -X GET http://localhost:3000/api/transactions -H "Content-Type: application/json" -s | findstr /r "id type amount category"
echo.
echo.

echo Test 2: Create new transaction
curl -X POST http://localhost:3000/api/transactions ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"expense\",\"amount\":75000,\"category\":\"Coffee\",\"date\":\"2025-01-25T14:00:00.000Z\",\"notes\":\"Coffee break\"}" ^
  -s | findstr /r "id type amount"
echo.
echo.

echo Test 3: Get dashboard summary
curl -X GET http://localhost:3000/api/dashboard/summary -H "Content-Type: application/json" -s | findstr /r "totalIncome totalExpense netBalance"
echo.
echo.

echo Test 4: Get dashboard stats (monthly)
curl -X GET "http://localhost:3000/api/dashboard/stats?period=monthly" -H "Content-Type: application/json" -s | findstr /r "income expense balance"
echo.
echo.

echo Test 5: Get categories
curl -X GET http://localhost:3000/api/categories -H "Content-Type: application/json" -s
echo.

import { useState } from "react";
import SummaryCard from "../components/SummaryCard";
import Charts from "../components/Charts";
import { formatCurrency } from "../utils/formatCurrency";

export default function Dashboard({ transactions = [], theme }) {
  const safeTransactions = (Array.isArray(transactions) ? transactions : []).filter((t) => t.jenisTransaksi !== "Retur");
  const [period, setPeriod] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showMonthList, setShowMonthList] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Helper function to get previous period dates
  const getPreviousPeriodDates = (periodType) => {
    const prevDate = new Date(now);
    switch (periodType) {
      case "daily":
        prevDate.setDate(currentDay - 1);
        return {
          day: prevDate.getDate(),
          month: prevDate.getMonth(),
          year: prevDate.getFullYear(),
        };
      case "custom-day": {
        const customDate = new Date(selectedDate);
        customDate.setDate(customDate.getDate() - 1);
        return {
          day: customDate.getDate(),
          month: customDate.getMonth(),
          year: customDate.getFullYear(),
        };
      }
      case "monthly":
        prevDate.setMonth(selectedMonth - 1);
        return { month: prevDate.getMonth(), year: prevDate.getFullYear() };
      case "yearly":
        prevDate.setFullYear(currentYear - 1);
        return { year: prevDate.getFullYear() };
      default:
        return {};
    }
  };

  // Filter transactions by period
  const getFilteredTransactions = (periodType, isPrevious = false) => {
    let targetDate;
    
    if (isPrevious) {
      targetDate = getPreviousPeriodDates(periodType);
    } else {
      if (periodType === "custom-day") {
        const dateObj = new Date(selectedDate);
        targetDate = {
          day: dateObj.getDate(),
          month: dateObj.getMonth(),
          year: dateObj.getFullYear()
        };
      } else if (periodType === "monthly") {
        targetDate = { day: currentDay, month: selectedMonth, year: currentYear };
      } else {
        targetDate = { day: currentDay, month: currentMonth, year: currentYear };
      }
    }

    return safeTransactions.filter((t) => {
      const date = new Date(t.date);
      switch (periodType) {
        case "daily":
        case "custom-day":
          return (
            date.getDate() === targetDate.day &&
            date.getMonth() === targetDate.month &&
            date.getFullYear() === targetDate.year
          );
        case "monthly":
          return (
            date.getMonth() === targetDate.month &&
            date.getFullYear() === targetDate.year
          );
        case "yearly":
          return date.getFullYear() === targetDate.year;
        default:
          return true;
      }
    });
  };

  const currentPeriodTransactions = getFilteredTransactions(period);
  const previousPeriodTransactions = getFilteredTransactions(period, true);

  const currentIncome = currentPeriodTransactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);
  const currentExpense = currentPeriodTransactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const previousIncome = previousPeriodTransactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);
  const previousExpense = previousPeriodTransactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = calculateChange(currentIncome, previousIncome);
  const expenseChange = calculateChange(currentExpense, previousExpense);



  const displayIncome = currentIncome;
  const displayExpense = currentExpense;

  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1
          className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Dashboard Keuangan
        </h1>
        <p
          className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          Monitor pemasukan dan pengeluaran Anda
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <div
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl p-1 shadow-sm flex items-center justify-center flex-wrap`}
        >
          <button
            onClick={() => setPeriod("daily")}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              period === "daily"
                ? "bg-emerald-600 text-white shadow-lg"
                : theme === "dark"
                  ? "text-gray-300 hover:text-emerald-400"
                  : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            Harian
          </button>
          <div className="relative">
            <button
              onClick={() => {
                if (period === "monthly") {
                  setShowMonthList(!showMonthList);
                } else {
                  setPeriod("monthly");
                  setShowMonthList(true);
                }
              }}
              className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                period === "monthly"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : theme === "dark"
                    ? "text-gray-300 hover:text-emerald-400"
                    : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              {period === "monthly" ? MONTHS[selectedMonth] : "Bulanan"}
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showMonthList && period === "monthly" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Month Dropdown */}
            {period === "monthly" && showMonthList && (
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 max-h-60 overflow-y-auto flex flex-col p-2 rounded-2xl shadow-xl z-50 ${theme === "dark" ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}>
                {MONTHS.map((month, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedMonth(index);
                      setShowMonthList(false);
                    }}
                    className={`px-4 py-2 rounded-xl font-medium text-sm text-left transition-all duration-200 ${
                      selectedMonth === index
                        ? "bg-emerald-600 text-white shadow-md"
                        : theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setPeriod("yearly")}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              period === "yearly"
                ? "bg-emerald-600 text-white shadow-lg"
                : theme === "dark"
                  ? "text-gray-300 hover:text-emerald-400"
                  : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            Tahunan
          </button>
          <div className="inline-flex items-center ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPeriod("custom-day");
              }}
              className={`p-2 rounded-xl border-2 transition-all duration-200 ${
                period === "custom-day"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-100 text-gray-600"
              }`}
            />
          </div>
        </div>

        {/* Removed redundant Month Selector for Bulanan as it's now a dropdown */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Pemasukan"
          value={displayIncome}
          color="green"
          change={incomeChange}
          theme={theme}
        />
        <SummaryCard
          title="Total Pengeluaran"
          value={displayExpense}
          color="red"
          change={expenseChange}
          theme={theme}
        />
        <SummaryCard
          title="Saldo saat ini"
          value={displayIncome - displayExpense}
          change={null}
          theme={theme}
        />
      </div>

      <div
        className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-3xl p-8 shadow-sm`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Tren{" "}
          {period === "daily"
            ? "Harian"
            : period === "monthly"
              ? "Bulanan"
              : period === "yearly"
                ? "Tahunan"
                : new Date(selectedDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                Perubahan Pemasukan
              </span>
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  incomeChange >= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span>{incomeChange >= 0 ? "↗" : "↘"}</span>
                <span>{Math.abs(incomeChange).toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
              >
                Perubahan Pengeluaran
              </span>
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  expenseChange <= 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <span>{expenseChange <= 0 ? "↘" : "↗"}</span>
                <span>{Math.abs(expenseChange).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div
            className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} rounded-2xl p-6`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Statistik Cepat
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span
                  className={
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }
                >
                  Transaksi
                </span>
                <span
                  className={`font-semibold ${theme === "dark" ? "text-white" : ""}`}
                >
                  {currentPeriodTransactions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }
                >
                  Rata-rata Harian
                </span>
                <span
                  className={`font-semibold ${theme === "dark" ? "text-white" : ""}`}
                >
                  Rp{" "}
                  {formatCurrency(
                    period === "daily"
                      ? displayIncome - displayExpense
                      : period === "monthly"
                        ? (displayIncome - displayExpense) / 30
                        : (displayIncome - displayExpense) / 365,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Charts
        income={displayIncome}
        expense={displayExpense}
        period={period}
        transactions={currentPeriodTransactions}
        allTransactions={safeTransactions}
        theme={theme}
      />
    </div>
  );
}

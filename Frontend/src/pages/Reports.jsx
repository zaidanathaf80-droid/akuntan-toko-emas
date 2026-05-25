import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const OPERATIONAL_CATEGORIES = [
  "laku",
  "t/kp",
  "t/ptg",
  "t/lbr",
  "karyawan",
  "cuci",
  "srv",
  "uangmakan",
  "opr",
  "zakat",
];

export default function Reports({ transactions = [], theme }) {
  const safeTransactions = (Array.isArray(transactions) ? transactions : []).filter((t) => t.jenisTransaksi !== "Retur");
  const [period, setPeriod] = useState("month");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Helper function to get previous period dates (same as Dashboard)
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
      case "month":
        prevDate.setMonth(currentMonth - 1);
        return { month: prevDate.getMonth(), year: prevDate.getFullYear() };
      case "year":
        prevDate.setFullYear(currentYear - 1);
        return { year: prevDate.getFullYear() };
      default:
        return {};
    }
  };

  // Unified Filter (same logic as Dashboard)
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
          year: dateObj.getFullYear(),
        };
      } else {
        targetDate = { day: currentDay, month: currentMonth, year: currentYear };
      }
    }

    return safeTransactions.filter((t) => {
      // Exclude Retur transactions globally from financial report calculations
      if (t.jenisTransaksi === "Retur") {
        return false;
      }

      const date = new Date(t.date);
      
      // Apply operational filter only for Monthly and Yearly as requested
      const isOperational = OPERATIONAL_CATEGORIES.includes(t.category.toLowerCase());
      if ((periodType === "month" || periodType === "year") && !isOperational) {
        return false;
      }

      switch (periodType) {
        case "daily":
        case "custom-day":
          return (
            date.getDate() === targetDate.day &&
            date.getMonth() === targetDate.month &&
            date.getFullYear() === targetDate.year
          );
        case "month":
          return (
            date.getMonth() === targetDate.month &&
            date.getFullYear() === targetDate.year
          );
        case "year":
          return date.getFullYear() === targetDate.year;
        default:
          return true;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions(period);
  const previousPeriodTransactions = getFilteredTransactions(period, true);

  // Data for Line Chart (Monthly Trend of Operational Performance)
  const getLineChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const incomeData = Array.from({ length: 12 }, (_, i) => {
      return safeTransactions
        .filter((t) => {
          const d = new Date(t.date);
          return (
            d.getFullYear() === currentYear &&
            d.getMonth() === i &&
            t.type === "income" &&
            t.jenisTransaksi !== "Retur" &&
            OPERATIONAL_CATEGORIES.includes(t.category.toLowerCase())
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const expenseData = Array.from({ length: 12 }, (_, i) => {
      return safeTransactions
        .filter((t) => {
          const d = new Date(t.date);
          return (
            d.getFullYear() === currentYear &&
            d.getMonth() === i &&
            t.type === "expense" &&
            t.jenisTransaksi !== "Retur" &&
            OPERATIONAL_CATEGORIES.includes(t.category.toLowerCase())
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return { labels: months, incomeData, expenseData };
  };

  const lineChartData = getLineChartData();

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const previousIncome = previousPeriodTransactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const previousExpense = previousPeriodTransactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const incomeChange = calculateChange(totalIncome, previousIncome);
  const expenseChange = calculateChange(totalExpense, previousExpense);

  const categories = {};
  filteredTransactions.forEach((t) => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const total = totalIncome + totalExpense;

  const sortedCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topCategories = sortedCategories.slice(0, 5);

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Laporan Keuangan
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          Analisis pola pengeluaran Anda
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl p-1 shadow-sm flex flex-wrap justify-center items-center gap-2`}
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
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              period === "month"
                ? "bg-emerald-600 text-white shadow-lg"
                : theme === "dark"
                  ? "text-gray-300 hover:text-emerald-400"
                  : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod("year")}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
              period === "year"
                ? "bg-emerald-600 text-white shadow-lg"
                : theme === "dark"
                  ? "text-gray-300 hover:text-emerald-400"
                  : "text-gray-600 hover:text-emerald-600"
            }`}
          >
            Tahun Ini
          </button>
          <div className="inline-flex items-center sm:ml-4 sm:pl-4 sm:border-l border-gray-200 dark:border-gray-700">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-3xl p-8 shadow-sm`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Ringkasan Keuangan
          </h2>
          <div className="space-y-6">
            <div
              className={`flex items-center justify-between p-4 rounded-2xl ${theme === "dark" ? "bg-gray-700" : "bg-green-50"}`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-600" : "bg-green-100"}`}
                >
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Total Pemasukan
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {formatCurrency(totalIncome)}
                  </p>
                </div>
              </div>
              {period !== "all" && (
                <div
                  className={`flex items-center space-x-1 text-sm font-medium ${
                    incomeChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <span>{incomeChange >= 0 ? "↑" : "↓"}</span>
                  <span>{Math.abs(Math.round(incomeChange))}%</span>
                </div>
              )}
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-2xl ${theme === "dark" ? "bg-gray-700" : "bg-red-50"}`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-600" : "bg-red-100"}`}
                >
                  <span className="text-2xl">💸</span>
                </div>
                <div>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Total Pengeluaran
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    Rp {formatCurrency(totalExpense)}
                  </p>
                </div>
              </div>
              {period !== "all" && (
                <div
                  className={`flex items-center space-x-1 text-sm font-medium ${
                    (period === "month" || period === "year" || period === "daily" || period === "custom-day") 
                      ? (expenseChange <= 0 ? "text-green-600" : "text-red-600")
                      : (expenseChange >= 0 ? "text-green-600" : "text-red-600")
                  }`}
                >
                  <span>{expenseChange >= 0 ? "↑" : "↓"}</span>
                  <span>{Math.abs(Math.round(expenseChange))}%</span>
                </div>
              )}
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-2xl ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-600" : "bg-blue-100"}`}
                >
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <p
                    className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                  >
                    Saldo saat ini
                  </p>
                  <p
                    className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    Rp {formatCurrency(totalIncome - totalExpense)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-3xl p-8 shadow-sm`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Kategori Teratas
          </h2>
          {topCategories.length === 0 ? (
            <p
              className={`text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              Data tidak tersedia
            </p>
          ) : (
            <div className="space-y-4">
              {topCategories.map(([category, amount], index) => {
                const percentage =
                  total > 0 ? Math.round((amount / total) * 100) : 0;
                const isIncome =
                  filteredTransactions.find((t) => t.category === category)
                    ?.type === "income";

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isIncome
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                        >
                          {category}
                        </p>
                        <p
                          className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                        >
                          Rp {formatCurrency(amount)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        {percentage}%
                      </p>
                      <div
                        className={`w-20 rounded-full h-2 mt-1 ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}
                      >
                        <div
                          className={`h-2 rounded-full ${isIncome ? "bg-green-500" : "bg-red-500"}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-3xl p-8 shadow-sm`}
      >
        <h2
          className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Rincian Detail
        </h2>

        {sortedCategories.length === 0 ? (
          <p
            className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
          >
            Tidak ada transaksi ditemukan untuk periode yang dipilih.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                >
                  <th
                    className={`text-left py-3 px-4 font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Kategori
                  </th>
                  <th
                    className={`text-right py-3 px-4 font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Jumlah
                  </th>
                  <th
                    className={`text-right py-3 px-4 font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Persentase
                  </th>
                  <th
                    className={`text-center py-3 px-4 font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                  >
                    Tipe
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.map(([category, amount]) => {
                  const percentage =
                    total > 0 ? Math.round((amount / total) * 100) : 0;
                  const isIncome =
                    filteredTransactions.find((t) => t.category === category)
                      ?.type === "income";

                  return (
                    <tr
                      key={category}
                      className={`border-b transition-colors duration-200 ${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-100 hover:bg-gray-50"}`}
                    >
                      <td
                        className={`py-4 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                      >
                        {category}
                      </td>
                      <td
                        className={`py-4 px-4 text-right font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                      >
                        Rp {formatCurrency(amount)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span
                            className={`font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                          >
                            {percentage}%
                          </span>
                          <div
                            className={`w-16 rounded-full h-2 ${theme === "dark" ? "bg-gray-600" : "bg-gray-200"}`}
                          >
                            <div
                              className={`h-2 rounded-full ${isIncome ? "bg-green-500" : "bg-red-500"}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isIncome
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isIncome ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Operational Performance Report Section */}
      {(period === "month" || period === "year") && (
        <div className="mt-12 space-y-8">
          <div
            className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-3xl p-8 shadow-sm`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h2
                  className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  Laporan Kinerja Operasional
                </h2>
                <p
                  className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  Khusus kategori operasional (LAKU, T/KP, T/PTG, T/LBR, dll)
                </p>
              </div>
            </div>

            {/* Operational Table */}
            <div className="overflow-x-auto mb-10">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <th
                      className={`text-left py-3 px-4 font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                    >
                      Ringkasan Operasional
                    </th>
                    <th
                      className={`text-right py-3 px-4 font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                    >
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const opTransactions = filteredTransactions.filter((t) =>
                      OPERATIONAL_CATEGORIES.includes(t.category.toLowerCase()),
                    );
                    const opIncome = opTransactions
                      .filter((t) => t.type === "income")
                      .reduce((sum, t) => sum + t.amount, 0);
                    const opExpense = opTransactions
                      .filter((t) => t.type === "expense")
                      .reduce((sum, t) => sum + t.amount, 0);

                    return (
                      <>
                        <tr
                          className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}
                        >
                          <td
                            className={`py-4 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                          >
                            Pemasukan Operasional
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-green-600">
                            Rp {formatCurrency(opIncome)}
                          </td>
                        </tr>
                        <tr
                          className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}
                        >
                          <td
                            className={`py-4 px-4 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                          >
                            Pengeluaran Operasional
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-red-600">
                            Rp {formatCurrency(opExpense)}
                          </td>
                        </tr>
                        <tr className="bg-emerald-50 dark:bg-emerald-900/10">
                          <td
                            className={`py-4 px-4 font-bold ${theme === "dark" ? "text-emerald-400" : "text-emerald-700"}`}
                          >
                            Laba/Rugi Operasional
                          </td>
                          <td
                            className={`py-4 px-4 text-right font-black ${opIncome - opExpense >= 0 ? "text-emerald-600" : "text-red-600"}`}
                          >
                            Rp {formatCurrency(opIncome - opExpense)}
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>

            {/* Operational Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">
              {/* Line Chart - Trends */}
              <div className="h-80">
                <h3
                  className={`text-lg font-semibold mb-6 text-center ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                >
                  Tren Kinerja Operasional ({currentYear})
                </h3>
                <Line
                  data={{
                    labels: lineChartData.labels,
                    datasets: [
                      {
                        label: "Pemasukan Op",
                        data: lineChartData.incomeData,
                        borderColor: "rgba(34, 197, 94, 1)",
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: "rgba(34, 197, 94, 1)",
                      },
                      {
                        label: "Pengeluaran Op",
                        data: lineChartData.expenseData,
                        borderColor: "rgba(239, 68, 68, 1)",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: "rgba(239, 68, 68, 1)",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: {
                        callbacks: {
                          label: (ctx) =>
                            `${ctx.dataset.label}: Rp ${formatCurrency(ctx.parsed.y)}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (val) => "Rp " + formatCurrency(val),
                        },
                      },
                    },
                  }}
                />
              </div>

              {/* Bar Chart - Comparison */}
              <div className="h-80">
                <h3
                  className={`text-lg font-semibold mb-6 text-center ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
                >
                  Grafik Perbandingan Operasional ({currentYear})
                </h3>
                <Bar
                  data={{
                    labels: [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "Mei",
                      "Jun",
                      "Jul",
                      "Agu",
                      "Sep",
                      "Okt",
                      "Nov",
                      "Des",
                    ],
                    datasets: [
                      {
                        label: "Pemasukan Op",
                        data: Array.from({ length: 12 }, (_, i) => {
                          return safeTransactions
                            .filter((t) => {
                              const d = new Date(t.date);
                              return (
                                d.getFullYear() === currentYear &&
                                d.getMonth() === i &&
                                t.type === "income" &&
                                t.jenisTransaksi !== "Retur" &&
                                OPERATIONAL_CATEGORIES.includes(
                                  t.category.toLowerCase(),
                                )
                              );
                            })
                            .reduce((sum, t) => sum + t.amount, 0);
                        }),
                        backgroundColor: "rgba(34, 197, 94, 0.8)",
                        borderRadius: 6,
                      },
                      {
                        label: "Pengeluaran Op",
                        data: Array.from({ length: 12 }, (_, i) => {
                          return safeTransactions
                            .filter((t) => {
                              const d = new Date(t.date);
                              return (
                                d.getFullYear() === currentYear &&
                                d.getMonth() === i &&
                                t.type === "expense" &&
                                t.jenisTransaksi !== "Retur" &&
                                OPERATIONAL_CATEGORIES.includes(
                                  t.category.toLowerCase(),
                                )
                              );
                            })
                            .reduce((sum, t) => sum + t.amount, 0);
                        }),
                        backgroundColor: "rgba(239, 68, 68, 0.8)",
                        borderRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                      tooltip: {
                        callbacks: {
                          label: (ctx) =>
                            `${ctx.dataset.label}: Rp ${formatCurrency(ctx.parsed.y)}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (val) => "Rp " + formatCurrency(val),
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

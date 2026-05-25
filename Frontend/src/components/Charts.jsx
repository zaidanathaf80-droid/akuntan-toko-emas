import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { formatCurrency } from "../utils/formatCurrency";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
);

export default function Charts({
  income,
  expense,
  period,
  transactions,
  allTransactions = [],
  theme = "light",
}) {
  const safeAllTransactions = Array.isArray(allTransactions) ? allTransactions : [];
  const total = income + expense;
  const incomePercentage = total > 0 ? Math.round((income / total) * 100) : 0;
  const expensePercentage = total > 0 ? Math.round((expense / total) * 100) : 0;

  // Generate category data - show all categories without grouping
  const rawCategoryData = transactions.reduce((acc, t) => {
    const category = t.category.toLowerCase();
    if (!acc[category]) {
      acc[category] = { total: 0, type: t.type };
    }
    acc[category].total += t.amount;
    return acc;
  }, {});

  const categoryLabels = Object.keys(rawCategoryData);
  const categoryValues = Object.values(rawCategoryData).map((d) => d.total);
  const categoryColors = categoryLabels.map(
    (_, i) => `hsl(${(i * 360) / categoryLabels.length}, 70%, 50%)`,
  );

  // Generate time series data for line chart using real transaction data
  const generateTimeSeriesData = () => {
    const now = new Date();
    let labels = [];
    let incomeData = [];
    let expenseData = [];

    if (period === "daily") {
      // For daily, show last 7 days
      labels = [];
      incomeData = [];
      expenseData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        labels.push(
          date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        );

        const dayTransactions = safeAllTransactions.filter((t) =>
          t.date.startsWith(dateStr),
        );
        const dayIncome = dayTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        const dayExpense = dayTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(dayIncome);
        expenseData.push(dayExpense);
      }
    } else if (period === "monthly") {
      // For monthly, show last 12 months
      labels = [];
      incomeData = [];
      expenseData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth();
        labels.push(
          date.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        );

        const monthTransactions = safeAllTransactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === year && tDate.getMonth() === month;
        });
        const monthIncome = monthTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        const monthExpense = monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(monthIncome);
        expenseData.push(monthExpense);
      }
    } else if (period === "yearly") {
      // For yearly, show last 5 years
      labels = [];
      incomeData = [];
      expenseData = [];
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        labels.push(year.toString());

        const yearTransactions = safeAllTransactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() === year;
        });
        const yearIncome = yearTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);
        const yearExpense = yearTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        incomeData.push(yearIncome);
        expenseData.push(yearExpense);
      }
    }

    return { labels, incomeData, expenseData };
  };

  const {
    labels: timeLabels,
    incomeData,
    expenseData,
  } = generateTimeSeriesData();

  const periodLabel =
    period === "daily"
      ? "Harian"
      : period === "monthly"
        ? "Bulanan"
        : "Tahunan";

  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      } rounded-3xl p-8 shadow-sm`}
    >
      <h2
        className={`text-2xl font-bold mb-8 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
      >
        Analisis Keuangan
      </h2>

      {/* Line Chart - Income vs Expense over time */}
      <div className="mb-8">
        <h3
          className={`text-lg font-semibold mb-6 ${
            theme === "dark" ? "text-gray-200" : "text-gray-900"
          }`}
        >
          Tren Pemasukan vs Pengeluaran ({periodLabel})
        </h3>
        <div className="h-64">
          <Line
            data={{
              labels: timeLabels,
              datasets: [
                {
                  label: "Pemasukan",
                  data: incomeData,
                  borderColor: "rgba(34, 197, 94, 1)",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: "Pengeluaran",
                  data: expenseData,
                  borderColor: "rgba(239, 68, 68, 1)",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  tension: 0.4,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `${context.dataset.label}: Rp ${formatCurrency(context.parsed.y)}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function (value) {
                      return "Rp " + formatCurrency(value);
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Pie Chart - Category Breakdown */}
        <div>
          <h3
            className={`text-lg font-semibold mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}
          >
            Rincian Kategori
          </h3>
          <div className="relative h-64">
            <Pie
              data={{
                labels: categoryLabels.map(
                  (label) => label.charAt(0).toUpperCase() + label.slice(1),
                ),
                datasets: [
                  {
                    data: categoryValues,
                    backgroundColor: categoryColors,
                    borderColor: categoryColors.map((color) =>
                      color.replace("50%", "70%"),
                    ),
                    borderWidth: 2,
                    hoverBackgroundColor: categoryColors.map((color) =>
                      color.replace("50%", "60%"),
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      font: {
                        size: 12,
                        weight: "bold",
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0,
                        );
                        const percentage = Math.round(
                          (context.parsed / total) * 100,
                        );
                        return `${context.label}: Rp ${formatCurrency(context.parsed)} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={`mt-8 pt-8 border-t ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
      >
        <h3
          className={`text-lg font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Ringkasan Keuangan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`${theme === "dark" ? "bg-gray-700" : "bg-gradient-to-br from-green-50 to-green-100"} rounded-2xl p-6 border ${theme === "dark" ? "border-gray-600" : "border-green-200"}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📈</span>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${theme === "dark" ? "text-green-400" : "text-green-700"}`}
                >
                  Total Pemasukan
                </p>
                <p
                  className={`text-2xl font-bold ${theme === "dark" ? "text-green-300" : "text-green-800"}`}
                >
                  Rp {formatCurrency(income)}
                </p>
              </div>
            </div>
            <p
              className={`text-sm ${theme === "dark" ? "text-green-300" : "text-green-600"}`}
            >
              {incomePercentage}% dari total
            </p>
          </div>

          <div
            className={`${theme === "dark" ? "bg-gray-700" : "bg-gradient-to-br from-red-50 to-red-100"} rounded-2xl p-6 border ${theme === "dark" ? "border-gray-600" : "border-red-200"}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📉</span>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${theme === "dark" ? "text-red-400" : "text-red-700"}`}
                >
                  Total Pengeluaran
                </p>
                <p
                  className={`text-2xl font-bold ${theme === "dark" ? "text-red-300" : "text-red-800"}`}
                >
                  Rp {formatCurrency(expense)}
                </p>
              </div>
            </div>
            <p
              className={`text-sm ${theme === "dark" ? "text-red-300" : "text-red-600"}`}
            >
              {expensePercentage}% dari total
            </p>
          </div>

          <div
            className={`rounded-2xl p-6 border ${
              income - expense >= 0
                ? theme === "dark"
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                : theme === "dark"
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  income - expense >= 0 ? "bg-blue-500" : "bg-orange-500"
                }`}
              >
                <span className="text-white text-lg">💰</span>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    income - expense >= 0
                      ? theme === "dark"
                        ? "text-blue-400"
                        : "text-blue-700"
                      : theme === "dark"
                        ? "text-orange-400"
                        : "text-orange-700"
                  }`}
                >
                  Saldo saat ini
                </p>
                <p
                  className={`text-2xl font-bold ${
                    income - expense >= 0
                      ? theme === "dark"
                        ? "text-blue-300"
                        : "text-blue-800"
                      : theme === "dark"
                        ? "text-orange-300"
                        : "text-orange-800"
                  }`}
                >
                  Rp {formatCurrency(income - expense)}
                </p>
              </div>
            </div>
            <p
              className={`text-sm ${
                income - expense >= 0
                  ? theme === "dark"
                    ? "text-blue-300"
                    : "text-blue-600"
                  : theme === "dark"
                    ? "text-orange-300"
                    : "text-orange-600"
              }`}
            >
              {income - expense >= 0 ? "Saldo positif" : "Saldo negatif"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

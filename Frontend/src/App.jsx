import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Margin from "./pages/Margin";
import Etalase from "./pages/Etalase";
import TopNav from "./components/TopNav";
import TotalBerat from "./pages/TotalBerat";
import Hutang from "./pages/Hutang";
import Login from "./pages/Login";
import { transactionAPI } from "./utils/api";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem("lp_auth") === "true";
  });
  const [accessLevel, setAccessLevel] = useState(() => {
    return sessionStorage.getItem("lp_access") || "none";
  });

  // Fetch transactions dari backend
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll();
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Gagal memuat transaksi");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogin = (level) => {
    sessionStorage.setItem("lp_auth", "true");
    sessionStorage.setItem("lp_access", level);
    setIsLoggedIn(true);
    setAccessLevel(level);
  };

  // Tampilkan halaman login jika belum login
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} theme={theme} />;
  }

  const addTransaction = (data) => {
    setTransactions([data, ...transactions]);
    setPage("dashboard");
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const refreshTransactions = () => {
    fetchTransactions();
  };

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}
    >
      <TopNav
        currentPage={page}
        setPage={setPage}
        theme={theme}
        toggleTheme={toggleTheme}
        accessLevel={accessLevel}
      />
      <div className="max-w-6xl mx-auto pt-16 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}
        {loading && page !== "add" ? (
          <div className="flex justify-center items-center h-96">
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Memuat...
            </p>
          </div>
        ) : (
          <>
            {page === "dashboard" && (
              <Dashboard transactions={transactions} theme={theme} />
            )}
            {page === "add" && (
              <AddTransaction onSave={addTransaction} theme={theme} />
            )}
            {page === "history" && (
              <History
                transactions={transactions}
                onDelete={deleteTransaction}
                onRefresh={refreshTransactions}
                theme={theme}
              />
            )}
            {page === "reports" && (
              <Reports transactions={transactions} theme={theme} />
            )}
            {page === "margin" && (
              <Margin transactions={transactions} theme={theme} onRefresh={refreshTransactions} />
            )}
            {page === "etalase" && (
              <Etalase transactions={transactions} theme={theme} onRefresh={refreshTransactions} />
            )}
            {page === "total-berat" && (
              <TotalBerat theme={theme} />
            )}
            {page === "hutang" && (
              <Hutang theme={theme} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

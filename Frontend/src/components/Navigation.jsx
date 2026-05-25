import { Link, useLocation } from "react-router-dom";

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white p-4 shadow">
      <div className="max-w-7xl mx-auto flex gap-8">
        <Link
          to="/dashboard"
          className={`font-semibold hover:text-blue-100 ${
            isActive("/dashboard") ? "underline" : ""
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/transactions"
          className={`font-semibold hover:text-blue-100 ${
            isActive("/transactions") ? "underline" : ""
          }`}
        >
          Transaksi
        </Link>
        <Link
          to="/reports"
          className={`font-semibold hover:text-blue-100 ${
            isActive("/reports") ? "underline" : ""
          }`}
        >
          Laporan
        </Link>
      </div>
    </nav>
  );
}

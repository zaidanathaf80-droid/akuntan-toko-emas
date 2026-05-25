import { useState } from "react";

export default function TopNav({ currentPage, setPage, theme, toggleTheme, accessLevel = "full" }) {
  const [isOpen, setIsOpen] = useState(false);

  const allMenuItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "add", label: "Tambah Transaksi" },
    { key: "history", label: "Riwayat" },
    { key: "reports", label: "Laporan" },
    { key: "margin", label: "Margin" },
    { key: "etalase", label: "Etalase" },
    { key: "hutang", label: "Hutang" },
  ];

  // Filter menu berdasarkan access level
  const menuItems = accessLevel === "limited" 
    ? allMenuItems.filter(item => item.key === "dashboard" || item.key === "add")
    : allMenuItems;

  return (
    <nav
      className={`${
        theme === "dark"
          ? "bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-700"
          : "bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">💰</span>
            </div>
            <h1
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Lucky & Power
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === item.key || (item.key === "etalase" && currentPage === "total-berat")
                    ? "text-emerald-700 bg-emerald-50 shadow-sm"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
                {(currentPage === item.key || (item.key === "etalase" && currentPage === "total-berat")) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {(currentPage === "etalase" || currentPage === "total-berat") && (
              <>
                {currentPage === "etalase" && (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("toggle-etalase-sidebar"))}
                    className="mr-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 bg-emerald-500 hover:bg-emerald-650 text-white shadow-sm flex items-center gap-1.5"
                    title="Buka Data Terjual"
                  >
                    <span>📋</span>
                    <span className="hidden sm:inline">Data Terjual</span>
                  </button>
                )}
                <button
                  onClick={() => setPage(currentPage === "total-berat" ? "etalase" : "total-berat")}
                  className="mr-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex items-center gap-1.5"
                  title={currentPage === "total-berat" ? "Kembali ke Etalase" : "Lihat Total Berat"}
                >
                  <span>⚖️</span>
                  <span>{currentPage === "total-berat" ? "Kembali ke Etalase" : "Total Berat"}</span>
                </button>
              </>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                theme === "dark"
                  ? "text-yellow-400 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title={
                theme === "dark"
                  ? "Ganti ke mode terang"
                  : "Ganti ke mode gelap"
              }
            >
              {theme === "dark" ? (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className={`md:hidden backdrop-blur-md border-t shadow-lg ${
          theme === "dark"
            ? "bg-gray-900/95 border-gray-700"
            : "bg-white/95 border-gray-200"
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setPage(item.key);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  currentPage === item.key || (item.key === "etalase" && currentPage === "total-berat")
                    ? theme === "dark"
                      ? "text-emerald-400 bg-emerald-900/30 shadow-sm"
                      : "text-emerald-700 bg-emerald-50 shadow-sm"
                    : theme === "dark"
                    ? "text-gray-300 hover:text-emerald-400 hover:bg-gray-800"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

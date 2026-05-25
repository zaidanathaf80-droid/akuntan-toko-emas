import { useState } from "react";

const VALID_USERNAME = "Petruk Tumpang";
const VALID_PASSWORD_FULL = "Akuntan081208";      // Akses penuh
const VALID_PASSWORD_LIMITED = "Upload363036";    // Akses terbatas

export default function Login({ onLogin, theme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulasi delay kecil agar terasa natural
    setTimeout(() => {
      if (username === VALID_USERNAME) {
        if (password === VALID_PASSWORD_FULL) {
          onLogin("full");  // Akses penuh
        } else if (password === VALID_PASSWORD_LIMITED) {
          onLogin("limited");  // Akses terbatas
        } else {
          setError("Username atau password salah. Silakan coba lagi.");
        }
      } else {
        setError("Username atau password salah. Silakan coba lagi.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-slate-50 to-slate-100"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl shadow-xl overflow-hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-2xl font-black text-white">Lucky & Power</h1>
          <p className="text-white/70 text-sm mt-1">Sistem Manajemen Keuangan</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8 space-y-5">
          <div className="text-center mb-2">
            <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Masuk ke Akun
            </h2>
            <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Masukkan kredensial Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Masukkan username..."
                autoComplete="username"
                className={`w-full px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                  error
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-900/20"
                      : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                }`}
              />
            </div>

            {/* Password */}
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Masukkan password..."
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-12 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                    error
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-900/20"
                        : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-lg transition-opacity hover:opacity-70`}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                <span className="text-red-500">⚠️</span>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 mt-2 ${
                loading || !username || !password
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-emerald-200 active:scale-95"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Memverifikasi...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

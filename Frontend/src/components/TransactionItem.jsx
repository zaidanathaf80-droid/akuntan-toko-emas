import { formatCurrency } from "../utils/formatCurrency";

export default function TransactionItem({ data, onDelete, theme }) {
  const handleDelete = () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus transaksi ${data.type} sebesar Rp ${formatCurrency(data.amount)}?`,
      )
    ) {
      onDelete(data.id);
    }
  };

  return (
    <div
      className={`p-6 transition-colors duration-200 border-b ${theme === "dark" ? "hover:bg-gray-700 border-gray-700" : "hover:bg-gray-50 border-gray-100"} last:border-b-0`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
              data.type === "income"
                ? "bg-gradient-to-br from-green-100 to-green-200"
                : "bg-gradient-to-br from-red-100 to-red-200"
            }`}
          >
            <span
              className={`text-2xl ${data.type === "income" ? "text-green-600" : "text-red-600"}`}
            >
              {data.type === "income" ? "💰" : "💸"}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p
                className={`font-bold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {data.category}
              </p>
              {data.jenisTransaksi === "Retur" && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  ↩️ Retur
                </span>
              )}
            </div>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {new Date(data.date).toLocaleDateString("id-ID")}
            </p>
            {data.notes && (
              <p
                className={`text-sm mt-1 italic ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                "{data.notes}"
              </p>
            )}
          </div>
        </div>
        <div className="text-right flex items-center space-x-4">
          <div>
            <p
              className={`text-2xl font-bold ${
                data.type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {data.type === "income" ? "+" : "-"}Rp{" "}
              {formatCurrency(data.amount)}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-xl transition-all duration-200 ${theme === "dark" ? "text-gray-500 hover:text-red-400 hover:bg-red-900/30" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`}
            title="Hapus transaksi"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

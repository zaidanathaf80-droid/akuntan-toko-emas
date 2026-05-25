import { useState, useEffect } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { lockedSnapshotAPI, transactionAPI } from "../utils/api";

const CATEGORIES = [
  { key: "T/KP", label: "T/KP", icon: "💍", color: "amber" },
  { key: "T/LBR", label: "T/LBR", icon: "🔥", color: "blue" },
  { key: "T/PTG", label: "T/PTG", icon: "⚡", color: "purple" },
  { key: "LAKU", label: "LAKU", icon: "💰", color: "green" },
];

const colorMap = {
  amber: {
    activeBg: "bg-gradient-to-r from-amber-500 to-amber-600",
    activeText: "text-white",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconText: "text-amber-600 dark:text-amber-400",
    headerBg: "bg-gradient-to-r from-amber-500 to-orange-500",
    badgeBg: "bg-amber-100 text-amber-800",
  },
  blue: {
    activeBg: "bg-gradient-to-r from-blue-500 to-blue-600",
    activeText: "text-white",
    hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconText: "text-blue-600 dark:text-blue-400",
    headerBg: "bg-gradient-to-r from-blue-500 to-indigo-500",
    badgeBg: "bg-blue-100 text-blue-800",
  },
  purple: {
    activeBg: "bg-gradient-to-r from-purple-500 to-purple-600",
    activeText: "text-white",
    hoverBg: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconText: "text-purple-600 dark:text-purple-400",
    headerBg: "bg-gradient-to-r from-purple-500 to-violet-500",
    badgeBg: "bg-purple-100 text-purple-800",
  },
  green: {
    activeBg: "bg-gradient-to-r from-green-500 to-emerald-600",
    activeText: "text-white",
    hoverBg: "hover:bg-green-50 dark:hover:bg-green-900/20",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconText: "text-green-600 dark:text-green-400",
    headerBg: "bg-gradient-to-r from-green-500 to-emerald-500",
    badgeBg: "bg-green-100 text-green-800",
  },
};

export default function Margin({ transactions = [], theme, onRefresh }) {
  const [activeCategory, setActiveCategory] = useState("T/KP");
  const [hargaEmasPerGram, setHargaEmasPerGram] = useState("");
  const [hargaEmasStatus, setHargaEmasStatus] = useState("cek_harga");
  const [period, setPeriod] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showMonthList, setShowMonthList] = useState(false);
  const [isTableHidden, setIsTableHidden] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterKadar, setFilterKadar] = useState("");
  const [filterBeratAwal, setFilterBeratAwal] = useState("");
  const [filterSubNama, setFilterSubNama] = useState("");
  const [pendingProsesChange, setPendingProsesChange] = useState(null);
  const [tempProsesValues, setTempProsesValues] = useState({});

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [activeRankingKadar, setActiveRankingKadar] = useState("Semua");
  const [showLakuCompare, setShowLakuCompare] = useState(false);

  useEffect(() => {
    setSearchQuery("");
    setFilterKadar("");
    setFilterBeratAwal("");
    setFilterSubNama("");
  }, [activeCategory]);

  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const [lockedSnapshots, setLockedSnapshots] = useState([]);
  const [snapshotToDelete, setSnapshotToDelete] = useState(null);
  const [snapshotToDiscard, setSnapshotToDiscard] = useState(null);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [lockedTransactionIds, setLockedTransactionIds] = useState([]);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const response = await lockedSnapshotAPI.getAll(activeCategory);
        const snaps = response.data || [];
        setLockedSnapshots(snaps);
        
        // Reconstruct locked transaction IDs from all active snapshots
        const ids = snaps.flatMap(s => s.transaction_ids || []);
        setLockedTransactionIds(ids);
      } catch (error) {
        console.error("Error fetching locked snapshots:", error);
      }
    };

    fetchSnapshots();
  }, [activeCategory]);

  const handleUpdateSnapshot = async (id, updates) => {
    try {
      await lockedSnapshotAPI.update(id, updates);
      setLockedSnapshots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (error) {
      console.error("Failed to update snapshot in database:", error);
    }
  };
  const allTransactions = Array.isArray(transactions) ? transactions : [];

  const getSnapshotKemurnianTambahan = (snap) => {
    if (!snap.transaction_ids || !Array.isArray(snap.transaction_ids)) return 0;
    const snapTxIds = new Set(snap.transaction_ids.map(id => Number(id)));
    const snapTxs = allTransactions.filter(t => snapTxIds.has(Number(t.id)));
    return snapTxs.reduce((sum, t) => {
      if (t.jenisTransaksi === "Tambahan" || (t.amount || 0) === 0) {
        const bt = parseFloat(t.beratTerima) || 0;
        const k = parseFloat(t.kadar) || 0;
        return sum + (bt * k / 100);
      }
      return sum;
    }, 0);
  };

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const isTransactionInPeriod = (dateStr) => {
    if (period === "all") return true;
    const date = new Date(dateStr);
    switch (period) {
      case "daily":
        return (
          date.getDate() === currentDay &&
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      case "weekly": {
        const startOfWeek = getStartOfWeek(now);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return date >= startOfWeek && date <= endOfWeek;
      }
      case "monthly":
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === currentYear
        );
      case "yearly":
        return date.getFullYear() === currentYear;
      default:
        return true;
    }
  };

  // Filter transactions by category (case-insensitive) and strict transaction type
  let filteredTransactions = allTransactions.filter((t) => {
    const isCategoryMatch = t.category?.toLowerCase() === activeCategory.toLowerCase();
    if (!isCategoryMatch) return false;

    // Khusus T/LBR, T/KP, T/PTG hanya memuat transaksi Pengeluaran (expense)
    if (["t/lbr", "t/kp", "t/ptg"].includes(activeCategory.toLowerCase())) {
      return t.type === "expense";
    }
    // Khusus LAKU hanya memuat transaksi Pemasukan (income)
    if (activeCategory.toLowerCase() === "laku") {
      return t.type === "income";
    }
    return true;
  });

  // Filter by period
  filteredTransactions = filteredTransactions.filter((t) => isTransactionInPeriod(t.date));

  // Store period transactions count/total before search query filters it
  const hasTransactionsInPeriod = filteredTransactions.length > 0;

  // Filter by search query and optional multi-filters
  let searchedTransactions = [...filteredTransactions];
  if (activeCategory === "T/LBR" || activeCategory === "T/KP" || activeCategory === "T/PTG" || activeCategory === "LAKU") {
    if (searchQuery.trim() !== "") {
      searchedTransactions = searchedTransactions.filter((t) =>
        t.namaBarang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.kadar_karat?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filterKadar.trim() !== "") {
      const cleanedKadar = filterKadar.replace('%', '').trim().toLowerCase();
      searchedTransactions = searchedTransactions.filter((t) => {
        if (activeCategory === "T/PTG" || activeCategory === "LAKU") {
          return t.kadar_karat !== undefined && t.kadar_karat !== null && String(t.kadar_karat).toLowerCase().includes(cleanedKadar);
        }
        return t.kadar !== undefined && t.kadar !== null && String(t.kadar).toLowerCase().includes(cleanedKadar);
      });
    }
    if (filterBeratAwal.trim() !== "") {
      const cleanedBeratAwal = filterBeratAwal.toLowerCase().replace('gram', '').replace('g', '').trim();
      searchedTransactions = searchedTransactions.filter((t) => {
        if (activeCategory === "T/PTG" || activeCategory === "LAKU") {
          return t.berat !== undefined && t.berat !== null && String(t.berat).toLowerCase().includes(cleanedBeratAwal);
        }
        return t.beratAwal !== undefined && t.beratAwal !== null && String(t.beratAwal).toLowerCase().includes(cleanedBeratAwal);
      });
    }
    if (filterSubNama.trim() !== "") {
      const cleanedSub = filterSubNama.trim().toLowerCase();
      searchedTransactions = searchedTransactions.filter((t) =>
        t.namaSpesifik?.toLowerCase().includes(cleanedSub) ||
        t.notes?.toLowerCase().includes(cleanedSub)
      );
    }
  }

  const hasAnyFilterActive = searchQuery.trim() !== "" || filterKadar.trim() !== "" || filterBeratAwal.trim() !== "" || filterSubNama.trim() !== "";

  // Sort by date descending
  const sortedTransactions = [...searchedTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Calculate summary stats
  const totalAmount = sortedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalCount = sortedTransactions.length;

  const activeCatInfo = CATEGORIES.find((c) => c.key === activeCategory);
  const colors = colorMap[activeCatInfo?.color || "amber"];

  // Determine which columns to show based on category
  const showDetailColumns = activeCategory === "T/KP" || activeCategory === "T/LBR";

  // Transactions for math calculations (excluding locked ones)
  const mathTransactions = sortedTransactions.filter(
    (t) => !lockedTransactionIds.includes(t.id)
  );

  // === MATH CALCULATIONS (using mathTransactions) ===
  const totalModal = mathTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const nilaiKemurnianEmas = mathTransactions.reduce((sum, t) => {
    const bt = parseFloat(t.beratTerima) || 0;
    const k = parseFloat(t.kadar) || 0;
    return sum + (bt * k / 100);
  }, 0);
  const totalBeratTerima = mathTransactions.reduce((sum, t) => sum + (parseFloat(t.beratTerima) || 0), 0);
  let rataRataLantak = 0;
  if (activeCategory === "T/KP") {
    const mathCount = mathTransactions.length;
    if (mathCount > 0) {
      const sumLantak = mathTransactions.reduce((sum, t) => {
        const bt = parseFloat(t.beratTerima) || 0;
        const k = (parseFloat(t.kadar) || 0) / 100;
        if (bt > 0 && k > 0) {
          const harga = t.amount || 0;
          return sum + (harga / bt / k / 1000);
        }
        return sum;
      }, 0);
      rataRataLantak = sumLantak / mathCount;
    }
  } else {
    const lantakTransactions = mathTransactions.filter(
      (t) => (t.jenisTransaksi || "").toLowerCase() !== "tambahan"
    );
    const lantakCount = lantakTransactions.length;
    rataRataLantak = lantakCount > 0
      ? lantakTransactions.reduce((sum, t) => sum + (parseFloat(t.lantak) || 0), 0) / lantakCount
      : 0;
  }
  const totalBeratAwal = mathTransactions.reduce((sum, t) => sum + (parseFloat(t.beratAwal) || 0), 0);
  const totalBeratTambahan = mathTransactions.reduce((sum, t) => {
    const harga = t.amount || 0;
    if (harga === 0) {
      return sum + (parseFloat(t.beratTerima) || 0);
    }
    return sum;
  }, 0);

  const nilaiKemurnianEmasTambahan = mathTransactions.reduce((sum, t) => {
    if (t.jenisTransaksi === "Tambahan" || (t.amount || 0) === 0) {
      const bt = parseFloat(t.beratTerima) || 0;
      const k = parseFloat(t.kadar) || 0;
      return sum + (bt * k / 100);
    }
    return sum;
  }, 0);

  const rataRataKadarTambahan = totalBeratTambahan > 0
    ? (nilaiKemurnianEmasTambahan / totalBeratTambahan) * 100
    : 0;
  
  const hargaNum = parseFloat(hargaEmasPerGram.replace(/\D/g, "")) || 0;
  const netKemurnianEmas = activeCategory === "T/LBR"
    ? (nilaiKemurnianEmas - nilaiKemurnianEmasTambahan)
    : nilaiKemurnianEmas;
  const nilaiSaatIni = netKemurnianEmas * hargaNum;
  const labaBersih = nilaiSaatIni - totalModal;
  const gpm = totalModal > 0 ? (labaBersih / totalModal) * 100 : 0;

  const formatHargaInput = (value) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? parseInt(num).toLocaleString("id-ID") : "";
  };

  const getJenisProses = (t) => {
    if (tempProsesValues[t.id] !== undefined) {
      return tempProsesValues[t.id];
    }
    if (t.jenisProses) return t.jenisProses;
    if (t.category?.toLowerCase() === "t/kp") return "KULLAK";
    if (t.category?.toLowerCase() === "t/lbr") return "DiLebur";
    return "";
  };

  const handleProsesChange = (t, newValue) => {
    const oldValue = t.jenisProses || "";
    if (newValue === oldValue) return;

    setTempProsesValues((prev) => ({ ...prev, [t.id]: newValue }));

    setPendingProsesChange({
      transaction: t,
      oldValue: oldValue,
      newValue: newValue,
    });
  };

  const getProsesChangeDescription = () => {
    if (!pendingProsesChange) return "";
    const { newValue } = pendingProsesChange;
    if (activeCategory === "T/LBR" && newValue === "KULLAK") {
      return "Apakah Anda yakin ingin memindahkan data ini ke kategori T/KP (KULLAK) dengan mempertahankan tanggal asli?";
    }
    if (activeCategory === "T/KP" && newValue === "DiLebur") {
      return "Apakah Anda yakin ingin memindahkan data ini ke kategori T/LBR (DiLebur) dengan mempertahankan tanggal asli?";
    }
    return `Apakah Anda yakin ingin mengubah proses transaksi menjadi ${newValue}?`;
  };

  const handleCancelProsesChange = () => {
    if (pendingProsesChange) {
      const { transaction } = pendingProsesChange;
      setTempProsesValues((prev) => {
        const next = { ...prev };
        delete next[transaction.id];
        return next;
      });
    }
    setPendingProsesChange(null);
  };

  const handleConfirmProsesChange = async () => {
    if (!pendingProsesChange) return;
    const { transaction, newValue } = pendingProsesChange;
    try {
      const updatePayload = { jenisProses: newValue };
      if (activeCategory === "T/LBR" && newValue === "KULLAK") {
        updatePayload.category = "T/KP";
      } else if (activeCategory === "T/KP" && newValue === "DiLebur") {
        updatePayload.category = "T/LBR";
      }

      await transactionAPI.update(transaction.id, updatePayload);
      setTempProsesValues((prev) => {
        const next = { ...prev };
        delete next[transaction.id];
        return next;
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to update transaction status:", error);
      alert("Gagal memindahkan status proses transaksi!");
      setTempProsesValues((prev) => {
        const next = { ...prev };
        delete next[transaction.id];
        return next;
      });
    } finally {
      setPendingProsesChange(null);
    }
  };

  const handleJenisTransaksiChange = async (t, newValue) => {
    try {
      await transactionAPI.update(t.id, { jenisTransaksi: newValue });
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to update jenis transaksi:", error);
      alert("Gagal memperbarui jenis transaksi!");
    }
  };

  const handleEditClick = (t) => {
    setEditingTransaction(t);
    setEditForm({
      id: t.id,
      namaBarang: t.namaBarang || "",
      namaSpesifik: t.namaSpesifik || "",
      kadar: t.kadar || "",
      beratAwal: t.beratAwal || "",
      beratTerima: t.beratTerima || "",
      amount: t.amount || "",
      notes: t.notes || "",
      jenisProses: t.jenisProses || (t.category?.toLowerCase() === "t/kp" ? "KULLAK" : "DiLebur"),
      jenisTransaksi: t.jenisTransaksi || (t.category?.toLowerCase() === "t/ptg" ? "Transaksi" : "TRANSAKSI"),
      kadar_karat: t.kadar_karat || "",
      berat: t.berat || "",
      ongkos: t.ongkos || "",
      harga_per_gram: t.harga_per_gram || "",
      kode_baki: t.kode_baki || "",
      baris_ke: t.baris_ke || ""
    });
  };

  // Auto-calculate harga_per_gram inside editForm for T/PTG and LAKU
  useEffect(() => {
    if (editingTransaction && (editingTransaction.category === "T/PTG" || editingTransaction.category === "LAKU") && editForm) {
      const harga = parseFloat(editForm.amount) || 0;
      const berat = parseFloat(editForm.berat) || 0;
      if (berat > 0) {
        const result = Math.round(harga / berat);
        if (editForm.harga_per_gram !== result) {
          setEditForm(prev => ({ ...prev, harga_per_gram: result }));
        }
      } else {
        if (editForm.harga_per_gram !== "") {
          setEditForm(prev => ({ ...prev, harga_per_gram: "" }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editForm?.amount, editForm?.berat, editingTransaction]);

  const handleSaveEdit = async () => {
    if (!editingTransaction || !editForm) return;

    if (!editForm.namaBarang.trim()) {
      alert("Nama barang wajib diisi!");
      return;
    }

    const updatedData = {
      namaBarang: editForm.namaBarang,
      namaSpesifik: editForm.namaSpesifik,
      kadar: editForm.kadar !== "" ? parseFloat(editForm.kadar) : null,
      beratAwal: editForm.beratAwal !== "" ? parseFloat(editForm.beratAwal) : null,
      beratTerima: editForm.beratTerima !== "" ? parseFloat(editForm.beratTerima) : null,
      amount: editForm.jenisTransaksi === "Tambahan" ? 0 : (editForm.amount !== "" ? parseFloat(editForm.amount) : 0),
      notes: editForm.notes,
      jenisProses: editForm.jenisProses,
      jenisTransaksi: editForm.jenisTransaksi,
      kadar_karat: editForm.kadar_karat,
      berat: editForm.berat !== "" ? parseFloat(editForm.berat) : null,
      ongkos: editForm.ongkos !== "" ? parseFloat(editForm.ongkos) : null,
      harga_per_gram: editForm.harga_per_gram !== "" ? parseFloat(editForm.harga_per_gram) : null,
      kode_baki: editForm.kode_baki || null,
      baris_ke: editForm.baris_ke !== "" ? parseInt(editForm.baris_ke) : null
    };

    if (updatedData.jenisTransaksi !== "Tambahan" && updatedData.amount > 0 && updatedData.beratTerima > 0 && updatedData.kadar > 0) {
      updatedData.lantak = Math.round(updatedData.amount / updatedData.beratTerima / (updatedData.kadar / 100) / 1000);
    } else {
      updatedData.lantak = 0;
    }

    // Category migration logic in edit modal
    if (editingTransaction.category === "T/LBR" && updatedData.jenisProses === "KULLAK") {
      updatedData.category = "T/KP";
    } else if (editingTransaction.category === "T/KP" && updatedData.jenisProses === "DiLebur") {
      updatedData.category = "T/LBR";
    }

    try {
      await transactionAPI.update(editForm.id, updatedData);
      setEditingTransaction(null);
      setEditForm(null);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
      alert("Gagal menyimpan perubahan transaksi!");
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Margin
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          Pengelompokan data transaksi berdasarkan kategori
        </p>
      </div>

      {/* Category Icon Bar */}
      <div
        className={`max-w-4xl mx-auto mb-4 rounded-2xl p-2 shadow-sm ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const catColors = colorMap[cat.color];
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex flex-col items-center py-4 px-2 rounded-xl font-semibold transition-all duration-300 ${
                  isActive
                    ? `${catColors.activeBg} ${catColors.activeText} shadow-lg transform scale-105`
                    : theme === "dark"
                      ? `bg-gray-700 text-gray-300 ${catColors.hoverBg}`
                      : `bg-gray-50 text-gray-600 ${catColors.hoverBg}`
                }`}
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className="text-sm font-bold">{cat.label}</span>
                <span
                  className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : theme === "dark"
                        ? "bg-gray-600 text-gray-400"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {allTransactions.filter(
                    (t) => t.category?.toLowerCase() === cat.key.toLowerCase() && isTransactionInPeriod(t.date)
                  ).length}{" "}
                  data
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Filter Bar */}
      <div className="flex flex-col items-center justify-center mb-8 gap-4">
        <div
          className={`${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } rounded-2xl p-1 shadow-sm flex flex-wrap justify-center gap-1`}
        >
          {[
            { id: "all", label: "Semua" },
            { id: "daily", label: "Harian" },
            { id: "weekly", label: "Mingguan" },
            { id: "monthly", label: "Bulanan" },
            { id: "yearly", label: "Tahunan" },
          ].filter((p) => {
            if (activeCategory === "T/LBR") {
              return p.id === "all" || p.id === "daily";
            }
            return true;
          }).map((p) => {
            if (p.id === "monthly") {
              return (
                <div key={p.id} className="relative">
                  <button
                    onClick={() => {
                      if (period === "monthly") {
                        setShowMonthList(!showMonthList);
                      } else {
                        setPeriod("monthly");
                        setShowMonthList(true);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-1 ${
                      period === "monthly"
                        ? "bg-emerald-600 text-white shadow-md"
                        : theme === "dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {period === "monthly" ? MONTHS[selectedMonth] : p.label}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${showMonthList && period === "monthly" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              );
            }

            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  period === p.id
                    ? "bg-emerald-600 text-white shadow-md"
                    : theme === "dark"
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Removed redundant Month Selector for Bulanan as it's now a dropdown */}
      </div>

      {/* Summary Cards */}
      <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`rounded-2xl p-6 shadow-sm ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors.iconBg}`}
            >
              <span className="text-2xl">{activeCatInfo?.icon}</span>
            </div>
            <div>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              >
                Total Transaksi
              </p>
              <p
                className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {totalCount}
              </p>
            </div>
          </div>
        </div>
        <div
          className={`rounded-2xl p-6 shadow-sm ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors.iconBg}`}
            >
              <span className="text-2xl">💵</span>
            </div>
            <div>
              <p
                className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              >
                Total Nominal
              </p>
              <p
                className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Rp {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div
        className={`max-w-4xl mx-auto rounded-3xl shadow-sm overflow-hidden ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Table Header Banner */}
        <div className={`${colors.headerBg} text-white px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{activeCatInfo?.icon}</span>
              <div>
                <h2 className="text-xl font-bold">
                  Data {activeCategory}
                </h2>
                <p className="text-white/80 text-sm">
                  {totalCount} transaksi ditemukan
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {(activeCategory === "T/LBR" || activeCategory === "T/KP" || activeCategory === "T/PTG" || activeCategory === "LAKU") && (period === "all" || period === "weekly" || period === "monthly" || period === "yearly") && (
                <button
                  onClick={() => setIsTableHidden(!isTableHidden)}
                  className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                >
                  {isTableHidden ? "Tampilkan Data" : "Sembunyikan Data"}
                </button>
              )}
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
                Rp {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {(activeCategory === "T/LBR" || activeCategory === "T/KP" || activeCategory === "T/PTG" || activeCategory === "LAKU") && (period === "all" || period === "weekly" || period === "monthly" || period === "yearly") && isTableHidden ? (
          <div className="p-12 text-center">
            <span className="text-4xl mb-4 block">🙈</span>
            <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Data Disembunyikan
            </h3>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Klik tombol "Tampilkan Data" di atas untuk melihat tabel transaksi.
            </p>
          </div>
        ) : (
          <>
            {/* Search Bar & Optional Multi-Filters */}
            {(activeCategory === "T/LBR" || activeCategory === "T/KP" || activeCategory === "T/PTG") && hasTransactionsInPeriod && (
              <div className={`px-6 py-5 border-b flex flex-col gap-4 ${
                theme === "dark" ? "bg-gray-800/40 border-gray-700" : "bg-gray-50 border-gray-100"
              }`}>
                {/* Main Search Input & Clear All Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                  <div className="relative flex-1 w-full">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama BARANG (contoh: Gelang)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-900/20"
                          : "bg-white border-gray-200 text-gray-855 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                    />
                  </div>
                  {hasAnyFilterActive && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterKadar("");
                        setFilterBeratAwal("");
                        setFilterSubNama("");
                      }}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-sm hover:scale-102 active:scale-98 ${
                        theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-red-400 hover:text-red-300"
                          : "bg-white hover:bg-red-50 hover:text-red-650 text-red-600 border border-gray-200"
                      }`}
                    >
                      <span>🧹</span>
                      <span>Bersihkan Filter</span>
                    </button>
                  )}
                </div>

                {/* Additional Multi-Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {/* Filter Kadar */}
                  <div className="relative w-full">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      🧪
                    </span>
                    <input
                      type="text"
                      placeholder="Filter Kadar (contoh: 43%, 50%)"
                      value={filterKadar}
                      onChange={(e) => setFilterKadar(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 text-xs font-semibold transition-all duration-200 outline-none ${
                        theme === "dark"
                          ? "bg-gray-700/60 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-900/20"
                          : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                    />
                  </div>

                  {/* Filter Berat Awal */}
                  <div className="relative w-full">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      ⚖️
                    </span>
                    <input
                      type="text"
                      placeholder="Filter Berat Awal (contoh: 1.7g, 5g)"
                      value={filterBeratAwal}
                      onChange={(e) => setFilterBeratAwal(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 text-xs font-semibold transition-all duration-200 outline-none ${
                        theme === "dark"
                          ? "bg-gray-700/60 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-900/20"
                          : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                    />
                  </div>

                  {/* Filter Sub-nama / Catatan */}
                  <div className="relative w-full">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${
                      theme === "dark" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      📝
                    </span>
                    <input
                      type="text"
                      placeholder="Sub-nama / Catatan (contoh: SQ5, L.L)"
                      value={filterSubNama}
                      onChange={(e) => setFilterSubNama(e.target.value)}
                      className={`w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 text-xs font-semibold transition-all duration-200 outline-none ${
                        theme === "dark"
                          ? "bg-gray-700/60 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-900/20"
                          : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {sortedTransactions.length === 0 ? (
              <div className="p-12 text-center">
                {hasAnyFilterActive ? (
                  <>
                    <span className="text-4xl mb-4 block">🔍</span>
                    <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Tidak ada hasil pencarian yang cocok
                    </h3>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                      Coba filter pencarian lain atau bersihkan filter Anda.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">{activeCatInfo?.icon}</div>
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Belum ada data {activeCategory}
                    </h3>
                    <p
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      Data akan muncul setelah Anda menambahkan transaksi kategori{" "}
                      {activeCategory}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b ${
                        theme === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <th
                        className={`text-left py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        No
                      </th>
                      <th
                        className={`text-left py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Tanggal
                      </th>
                      {activeCategory !== "T/KP" && activeCategory !== "T/PTG" && activeCategory !== "LAKU" && (
                        <th
                          className={`text-left py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Tipe
                        </th>
                      )}
                      {showDetailColumns && (
                        <>
                          <th
                            className={`text-left py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Barang
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Kadar
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Brt Awal
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Brt Terima
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Lantak
                          </th>
                        </>
                      )}
                      {activeCategory === "T/PTG" && (
                        <>
                          <th
                            className={`text-left py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Kadar
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Berat Emas
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Ongkos
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Harga / Gram
                          </th>
                        </>
                      )}
                      {activeCategory === "LAKU" && (
                        <>
                          <th
                            className={`text-left py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Kadar
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Berat Emas
                          </th>
                          <th
                            className={`text-center py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Baki
                          </th>
                          <th
                            className={`text-center py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Baris
                          </th>
                          <th
                            className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Harga / Gram
                          </th>
                        </>
                      )}
                      <th
                        className={`text-right py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Jumlah
                      </th>
                      <th
                        className={`text-left py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Catatan
                      </th>
                      {(activeCategory === "T/LBR" || activeCategory === "T/KP" || activeCategory === "T/PTG" || activeCategory === "LAKU") && (
                        <>
                          {(activeCategory === "T/LBR" || activeCategory === "T/KP") && (
                            <th
                              className={`text-center py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                                theme === "dark" ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Proses
                            </th>
                          )}
                          {(activeCategory === "T/LBR" || activeCategory === "T/PTG") && (
                            <th
                              className={`text-center py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                                theme === "dark" ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Jns. Transaksi
                            </th>
                          )}
                          <th
                            className={`text-center py-4 px-5 text-xs font-bold uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Aksi
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map((t, index) => (
                      <tr
                        key={t.id || index}
                        className={`border-b transition-colors duration-200 ${
                          theme === "dark"
                            ? "border-gray-700 hover:bg-gray-700/50"
                            : "border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        {/* No */}
                        <td
                          className={`py-4 px-5 text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </td>
                        {/* Tanggal */}
                        <td
                          className={`py-4 px-5 text-sm font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-900"
                          }`}
                        >
                          {new Date(t.date).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        {/* Tipe */}
                        {activeCategory !== "T/KP" && activeCategory !== "T/PTG" && activeCategory !== "LAKU" && (
                          <td className="py-4 px-5">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                t.type === "income"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {t.type === "income" ? "Masuk" : "Keluar"}
                            </span>
                          </td>
                        )}
                        {/* Detail columns for T/KP and T/LBR */}
                        {showDetailColumns && (
                          <>
                            <td
                              className={`py-4 px-5 text-sm font-medium ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              <div>
                                {t.namaBarang || "-"}
                                {t.namaSpesifik && (
                                  <span
                                    className={`block text-xs ${
                                      theme === "dark"
                                        ? "text-gray-500"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {t.namaSpesifik}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td
                              className={`py-4 px-5 text-sm text-right ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {t.kadar ? `${t.kadar}%` : "-"}
                            </td>
                            <td
                              className={`py-4 px-5 text-sm text-right ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {t.beratAwal ? `${t.beratAwal}g` : "-"}
                            </td>
                            <td
                              className={`py-4 px-5 text-sm text-right ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {t.beratTerima ? `${t.beratTerima}g` : "-"}
                            </td>
                            <td
                              className={`py-4 px-5 text-sm text-right font-semibold ${
                                theme === "dark"
                                  ? "text-amber-400"
                                  : "text-amber-700"
                              }`}
                            >
                              {activeCategory === "T/KP" ? (
                                (() => {
                                  const bt = parseFloat(t.beratTerima) || 0;
                                  const k = (parseFloat(t.kadar) || 0) / 100;
                                  if (bt > 0 && k > 0) {
                                    const val = Math.round((t.amount || 0) / bt / k / 1000);
                                    return `Rp ${formatCurrency(val)}`;
                                  }
                                  return "-";
                                })()
                              ) : t.lantak ? (
                                `Rp ${formatCurrency(t.lantak)}`
                              ) : (
                                "-"
                              )}
                            </td>
                          </>
                        )}
                        {/* T/PTG detail columns - rendered BEFORE Jumlah/Catatan to match header order */}
                        {activeCategory === "T/PTG" && (
                          <>
                            {/* Kadar */}
                            <td
                              className={`py-4 px-5 text-sm ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {t.kadar_karat || "-"}
                            </td>
                            {/* Berat Emas */}
                            <td
                              className={`py-4 px-5 text-sm text-right ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {t.berat ? `${t.berat}g` : "-"}
                            </td>
                            {/* Ongkos */}
                            <td
                              className={`py-4 px-5 text-sm text-right ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {t.ongkos ? `Rp ${formatCurrency(t.ongkos)}` : "-"}
                            </td>
                            {/* Harga per Gram */}
                            <td
                              className={`py-4 px-5 text-sm text-right font-semibold ${
                                theme === "dark"
                                  ? "text-purple-400"
                                  : "text-purple-700"
                              }`}
                            >
                              {t.harga_per_gram ? `Rp ${formatCurrency(t.harga_per_gram)}` : "-"}
                            </td>
                          </>
                        )}
                        {activeCategory === "LAKU" && (
                          <>
                            {/* Kadar */}
                            <td
                              className={`py-4 px-5 text-sm ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {t.kadar_karat || "-"}
                            </td>
                            {/* Berat Emas */}
                            <td
                              className={`py-4 px-5 text-sm text-right ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-900"
                              }`}
                            >
                              {t.berat ? `${t.berat}g` : "-"}
                            </td>
                            {/* Baki */}
                            <td
                              className={`py-4 px-5 text-sm text-center font-bold ${
                                theme === "dark"
                                  ? "text-emerald-400"
                                  : "text-emerald-700"
                              }`}
                            >
                              {t.kode_baki || "-"}
                            </td>
                            {/* Baris */}
                            <td
                              className={`py-4 px-5 text-sm text-center ${
                                theme === "dark"
                                  ? "text-gray-350"
                                  : "text-gray-800"
                              }`}
                            >
                              {t.baris_ke || "-"}
                            </td>
                            {/* Harga per Gram */}
                            <td
                              className={`py-4 px-5 text-sm text-right font-semibold ${
                                theme === "dark"
                                  ? "text-emerald-400"
                                  : "text-emerald-700"
                              }`}
                            >
                              {t.harga_per_gram ? `Rp ${formatCurrency(t.harga_per_gram)}` : "-"}
                            </td>
                          </>
                        )}
                        {/* Jumlah */}
                        <td
                          className={`py-4 px-5 text-sm text-right font-bold ${
                            t.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {t.amount ? `Rp ${formatCurrency(t.amount)}` : "-"}
                        </td>
                        {/* Catatan - For T/PTG, show combined Kategori Barang + Nama Spesifik */}
                        <td
                          className={`py-4 px-5 text-sm max-w-[150px] truncate ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {activeCategory === "T/PTG" || activeCategory === "LAKU" ? (
                            <>
                              {t.namaBarang || ""}
                              {t.namaBarang && t.namaSpesifik ? " - " : ""}
                              {t.namaSpesifik || ""}
                              {!t.namaBarang && !t.namaSpesifik ? (t.notes || "-") : ""}
                            </>
                          ) : (
                            t.notes || "-"
                          )}
                        </td>
                        {/* T/LBR or T/KP specific columns (Proses, Jns. Transaksi, Aksi) */}
                        {(activeCategory === "T/LBR" || activeCategory === "T/KP") && (
                          <>
                            <td className="py-4 px-5 text-center">
                              <select
                                value={getJenisProses(t)}
                                onChange={(e) => handleProsesChange(t, e.target.value)}
                                className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 cursor-pointer outline-none ${
                                  getJenisProses(t) === "DiLebur"
                                    ? "bg-orange-50 border-orange-200 text-orange-850 dark:bg-orange-950/40 dark:border-orange-900/50 dark:text-orange-300"
                                    : getJenisProses(t) === "KULLAK"
                                    ? "bg-sky-50 border-sky-200 text-sky-850 dark:bg-sky-950/40 dark:border-sky-900/50 dark:text-sky-300"
                                    : theme === "dark"
                                    ? "bg-gray-700 border-gray-600 text-gray-300"
                                    : "bg-gray-50 border-gray-200 text-gray-600"
                                }`}
                              >
                                <option value="DiLebur" className={theme === "dark" ? "bg-gray-800 text-orange-400" : "bg-white text-orange-800"}>DiLebur</option>
                                <option value="KULLAK" className={theme === "dark" ? "bg-gray-800 text-sky-400" : "bg-white text-sky-850"}>KULLAK</option>
                              </select>
                            </td>
                            {activeCategory === "T/LBR" && (
                              <td className="py-4 px-5 text-center">
                                {t.jenisTransaksi ? (
                                  <span
                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                      t.jenisTransaksi === "Tambahan"
                                        ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400"
                                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    }`}
                                  >
                                    {t.jenisTransaksi}
                                  </span>
                                ) : (
                                  <span
                                    className={`text-sm ${
                                      theme === "dark"
                                        ? "text-gray-500"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    -
                                  </span>
                                )}
                              </td>
                            )}
                            <td className="py-4 px-5 text-center">
                              <button
                                onClick={() => handleEditClick(t)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-250 shadow-sm ${
                                  theme === "dark"
                                    ? "bg-amber-600 hover:bg-amber-500 text-white hover:scale-105 active:scale-95"
                                    : "bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 active:scale-95"
                                  }`}
                              >
                                <span>✏️</span>
                                <span>Edit</span>
                              </button>
                            </td>
                          </>
                        )}
                        {/* T/PTG columns (Jns. Transaksi, Aksi) */}
                        {activeCategory === "T/PTG" && (
                          <>
                            <td className="py-4 px-5 text-center">
                              <select
                                value={t.jenisTransaksi || "Transaksi"}
                                onChange={(e) => handleJenisTransaksiChange(t, e.target.value)}
                                className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 cursor-pointer outline-none ${
                                  (t.jenisTransaksi || "Transaksi") === "Transaksi"
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-850 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300"
                                    : (t.jenisTransaksi || "Transaksi") === "Retur"
                                    ? "bg-rose-50 border-rose-200 text-rose-850 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300"
                                    : theme === "dark"
                                    ? "bg-gray-700 border-gray-600 text-gray-300"
                                    : "bg-gray-50 border-gray-200 text-gray-600"
                                }`}
                              >
                                <option value="Transaksi" className={theme === "dark" ? "bg-gray-800 text-emerald-400" : "bg-white text-emerald-800"}>Transaksi</option>
                                <option value="Retur" className={theme === "dark" ? "bg-gray-800 text-rose-400" : "bg-white text-rose-800"}>Retur</option>
                              </select>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <button
                                onClick={() => handleEditClick(t)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-250 shadow-sm ${
                                  theme === "dark"
                                    ? "bg-amber-600 hover:bg-amber-500 text-white hover:scale-105 active:scale-95"
                                    : "bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 active:scale-95"
                                  }`}
                              >
                                <span>✏️</span>
                                <span>Edit</span>
                              </button>
                            </td>
                          </>
                        )}
                        {/* LAKU columns (Aksi) */}
                        {activeCategory === "LAKU" && (
                          <td className="py-4 px-5 text-center">
                            <button
                              onClick={() => handleEditClick(t)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-250 shadow-sm ${
                                theme === "dark"
                                  ? "bg-amber-600 hover:bg-amber-500 text-white hover:scale-105 active:scale-95"
                                  : "bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 active:scale-95"
                                }`}
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  {/* Table Footer with Total */}
                  <tfoot>
                    <tr
                      className={`${
                        theme === "dark"
                          ? "bg-gray-700/50"
                          : "bg-gray-50"
                      }`}
                    >
                      <td
                        colSpan={activeCategory === "T/PTG" ? 6 : (activeCategory === "LAKU" ? 7 : (showDetailColumns ? (activeCategory === "T/LBR" ? 8 : 7) : 3))}
                        className={`py-4 px-5 text-sm font-bold ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        TOTAL ({totalCount} transaksi)
                      </td>
                      <td
                        className={`py-4 px-5 text-sm text-right font-black ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Rp {formatCurrency(totalAmount)}
                      </td>
                      <td
                        colSpan={
                          activeCategory === "T/PTG"
                            ? 3
                            : activeCategory === "LAKU"
                            ? 2
                            : (activeCategory === "T/LBR" || activeCategory === "T/KP")
                            ? (activeCategory === "T/LBR" ? 4 : 3)
                            : 1
                        }
                      ></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ============ RINGKASAN MATEMATIKA OTOMATIS T/PTG ============ */}
      {activeCategory === "T/PTG" && sortedTransactions.length > 0 && (() => {
        const sortKadars = (keys) => [...keys].sort((a, b) => { const nA=parseInt(a),nB=parseInt(b); if(!isNaN(nA)&&!isNaN(nB)) return nA-nB; return a.localeCompare(b); });
        const ptgSummary = sortedTransactions.reduce((acc, t) => { const k=t.kadar_karat||"-"; if(!acc[k]) acc[k]={totalModal:0,totalBerat:0,totalOngkos:0}; if(t.jenisTransaksi!=="Retur"){acc[k].totalOngkos+=parseFloat(t.ongkos)||0;acc[k].totalModal+=parseFloat(t.amount)||0;acc[k].totalBerat+=parseFloat(t.berat)||0;} return acc; }, {});
        const ptgKadars = sortKadars(Object.keys(ptgSummary));
        const totalPtgModal=ptgKadars.reduce((s,k)=>s+ptgSummary[k].totalModal,0);
        const totalPtgOngkos=ptgKadars.reduce((s,k)=>s+ptgSummary[k].totalOngkos,0);
        const gpmTotal=totalPtgModal>0?(totalPtgOngkos/totalPtgModal)*100:0;
        const lakuTxs=allTransactions.filter(t=>t.category?.toLowerCase()==="laku"&&t.type==="income"&&isTransactionInPeriod(t.date));
        const lakuSummary=lakuTxs.reduce((acc,t)=>{const k=t.kadar_karat||"-";if(!acc[k])acc[k]={totalSales:0,totalBerat:0};acc[k].totalSales+=parseFloat(t.amount)||0;acc[k].totalBerat+=parseFloat(t.berat)||0;return acc;},{});
        const lakuKadars=sortKadars(Object.keys(lakuSummary));
        const totalLakuSales=lakuKadars.reduce((s,k)=>s+lakuSummary[k].totalSales,0);
        const totalLakuBerat=lakuKadars.reduce((s,k)=>s+lakuSummary[k].totalBerat,0);
        const rrLakuGabungan=totalLakuBerat>0?Math.round(totalLakuSales/totalLakuBerat):0;
        const allKadars=sortKadars([...new Set([...ptgKadars,...lakuKadars])]);
        return (
          <div className="mt-8 space-y-6">
            {/* Baris dua kartu */}
            <div className={`flex flex-col lg:flex-row gap-6 ${showLakuCompare?"":"max-w-4xl mx-auto"}`}>
              {/* Kartu T/PTG */}
              <div className={`${showLakuCompare?"flex-1 min-w-0":"w-full max-w-4xl mx-auto"} rounded-3xl shadow-sm overflow-hidden ${theme==="dark"?"bg-gray-800":"bg-white"}`}>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚡</span>
                      <div><h2 className="text-xl font-bold">Ringkasan Matematika Otomatis</h2><p className="text-white/80 text-sm">Kalkulasi statistik T/PTG berdasarkan kadar emas</p></div>
                    </div>
                    <button onClick={()=>setShowLakuCompare(prev=>!prev)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${showLakuCompare?"bg-white text-purple-700 shadow-md":"bg-white/20 hover:bg-white/30 text-white"}`}>
                      <span>⚖️</span>{showLakuCompare?"Tutup Compare":"Compare"}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto p-6">
                  <table className={`w-full border-collapse border-2 ${theme==="dark"?"border-gray-700":"border-purple-200"}`}>
                    <thead><tr className={theme==="dark"?"bg-gray-700/50":"bg-purple-50"}>
                      <th className={`border-2 p-3 text-left font-bold text-sm ${theme==="dark"?"border-gray-700 text-purple-400":"border-purple-200 text-purple-800"}`}>KETERANGAN</th>
                      {ptgKadars.map(k=><th key={k} className={`border-2 p-3 text-center font-black text-base ${theme==="dark"?"border-gray-700 text-white":"border-purple-200 text-gray-900"}`}>{k}</th>)}
                    </tr></thead>
                    <tbody>
                      <tr><td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-purple-200 text-gray-700"}`}>TOTAL BERAT</td>{ptgKadars.map(k=><td key={k} className={`border-2 p-3 text-center text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-purple-200 text-gray-800"}`}>{ptgSummary[k].totalBerat>0?`${ptgSummary[k].totalBerat.toLocaleString("id-ID",{maximumFractionDigits:2})} g`:"-"}</td>)}</tr>
                      <tr><td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-purple-200 text-gray-700"}`}>TOTAL MODAL</td>{ptgKadars.map(k=><td key={k} className={`border-2 p-3 text-center text-sm font-semibold ${theme==="dark"?"border-gray-700 text-emerald-400":"border-purple-200 text-emerald-600"}`}>{ptgSummary[k].totalModal>0?`Rp ${formatCurrency(ptgSummary[k].totalModal)}`:"-"}</td>)}</tr>
                      {!showLakuCompare && <tr><td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-purple-200 text-gray-700"}`}>TOTAL ONGKOS</td>{ptgKadars.map(k=><td key={k} className={`border-2 p-3 text-center text-sm font-semibold ${theme==="dark"?"border-gray-700 text-amber-400":"border-purple-200 text-amber-600"}`}>{ptgSummary[k].totalOngkos>0?`Rp ${formatCurrency(ptgSummary[k].totalOngkos)}`:"-"}</td>)}</tr>}
                      <tr className={theme==="dark"?"bg-gray-800/80":"bg-purple-50/50"}><td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-purple-400":"border-purple-200 text-purple-700"}`}>RATA-RATA / GRAM</td>{ptgKadars.map(k=>{const rr=ptgSummary[k].totalBerat>0?Math.round(ptgSummary[k].totalModal/ptgSummary[k].totalBerat):0;return <td key={k} className={`border-2 p-3 text-center font-black text-sm ${theme==="dark"?"border-gray-700 text-purple-300":"border-purple-200 text-purple-800"}`}>{rr>0?`Rp ${formatCurrency(rr)}`:"-"}</td>;})}</tr>
                    </tbody>
                  </table>
                  {!showLakuCompare && (
                    <div className={`mt-4 p-4 rounded-2xl border-2 grid grid-cols-3 gap-4 ${theme==="dark"?"bg-gray-800 border-gray-700":"bg-purple-50/50 border-purple-100"}`}>
                      <div><p className={`text-xs font-bold uppercase ${theme==="dark"?"text-gray-400":"text-gray-500"}`}>Total Modal</p><p className={`text-xl font-black ${theme==="dark"?"text-emerald-400":"text-emerald-600"}`}>Rp {formatCurrency(totalPtgModal)}</p></div>
                      <div className={`border-l pl-4 border-dashed ${theme==="dark"?"border-gray-600":"border-gray-300"}`}><p className={`text-xs font-bold uppercase ${theme==="dark"?"text-gray-400":"text-gray-500"}`}>Total Ongkos</p><p className={`text-xl font-black ${theme==="dark"?"text-amber-400":"text-amber-600"}`}>Rp {formatCurrency(totalPtgOngkos)}</p></div>
                      <div className={`border-l pl-4 border-dashed ${theme==="dark"?"border-gray-600":"border-gray-300"}`}><p className={`text-xs font-bold uppercase ${theme==="dark"?"text-gray-400":"text-gray-500"}`}>GPM</p><p className={`text-xl font-black ${theme==="dark"?"text-purple-400":"text-purple-700"}`}>{gpmTotal>0?`${gpmTotal.toFixed(2)}%`:"0.00%"}</p></div>
                    </div>
                  )}
                  <p className={`mt-3 text-xs ${theme==="dark"?"text-gray-500":"text-gray-400"}`}>⚠️ Retur dikecualikan dari seluruh perhitungan.</p>
                </div>
              </div>

              {/* Kartu LAKU */}
              {showLakuCompare && (
                <div className={`flex-1 min-w-0 rounded-3xl shadow-sm overflow-hidden ${theme==="dark"?"bg-gray-800":"bg-white"}`}>
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <div><h2 className="text-xl font-bold">Ringkasan Matematika Otomatis LAKU</h2><p className="text-white/80 text-sm">Kalkulasi statistik LAKU berdasarkan kadar emas</p></div>
                    </div>
                  </div>
                  {lakuTxs.length===0?(
                    <div className="p-12 text-center"><span className="text-4xl mb-4 block">💸</span><p className={`font-semibold ${theme==="dark"?"text-gray-400":"text-gray-500"}`}>Belum ada data LAKU pada periode ini</p></div>
                  ):(
                    <div className="overflow-x-auto p-6">
                      <table className={`w-full border-collapse border-2 ${theme==="dark"?"border-gray-700":"border-emerald-200"}`}>
                        <thead><tr className={theme==="dark"?"bg-gray-700/50":"bg-emerald-50"}>
                          <th className={`border-2 p-3 text-left font-bold text-sm ${theme==="dark"?"border-gray-700 text-emerald-400":"border-emerald-200 text-emerald-800"}`}>KETERANGAN</th>
                          {lakuKadars.map(k=><th key={k} className={`border-2 p-3 text-center font-black text-base ${theme==="dark"?"border-gray-700 text-white":"border-emerald-200 text-gray-900"}`}>{k}</th>)}
                        </tr></thead>
                        <tbody>
                          <tr><td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-emerald-200 text-gray-700"}`}>TOTAL BERAT</td>{lakuKadars.map(k=><td key={k} className={`border-2 p-3 text-center text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-emerald-200 text-gray-800"}`}>{lakuSummary[k].totalBerat>0?`${lakuSummary[k].totalBerat.toLocaleString("id-ID",{maximumFractionDigits:2})} g`:"-"}</td>)}</tr>
                          <tr><td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-emerald-200 text-gray-700"}`}>TOTAL PENJUALAN</td>{lakuKadars.map(k=><td key={k} className={`border-2 p-3 text-center text-sm font-semibold ${theme==="dark"?"border-gray-700 text-emerald-400":"border-emerald-200 text-emerald-600"}`}>{lakuSummary[k].totalSales>0?`Rp ${formatCurrency(lakuSummary[k].totalSales)}`:"-"}</td>)}</tr>
                          <tr className={theme==="dark"?"bg-gray-800/80":"bg-emerald-50/50"}><td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-emerald-400":"border-emerald-200 text-emerald-700"}`}>RATA-RATA / GRAM</td>{lakuKadars.map(k=>{const rr=lakuSummary[k].totalBerat>0?Math.round(lakuSummary[k].totalSales/lakuSummary[k].totalBerat):0;return <td key={k} className={`border-2 p-3 text-center font-black text-sm ${theme==="dark"?"border-gray-700 text-emerald-300":"border-emerald-200 text-emerald-800"}`}>{rr>0?`Rp ${formatCurrency(rr)}`:"-"}</td>;})}</tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tabel Selisih */}
            {showLakuCompare && lakuTxs.length>0 && (
              <div className={`rounded-3xl shadow-sm overflow-hidden ${theme==="dark"?"bg-gray-800":"bg-white"}`}>
                <div className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div><h2 className="text-xl font-bold">Selisih LAKU − T/PTG</h2><p className="text-white/80 text-sm">Perbandingan per kadar emas · Rumus: LAKU − T/PTG</p></div>
                  </div>
                </div>
                <div className="overflow-x-auto p-6">
                  <table className={`w-full border-collapse border-2 ${theme==="dark"?"border-gray-700":"border-orange-200"}`}>
                    <thead><tr className={theme==="dark"?"bg-gray-700/50":"bg-orange-50"}>
                      <th className={`border-2 p-3 text-left font-bold text-sm ${theme==="dark"?"border-gray-700 text-orange-400":"border-orange-200 text-orange-800"}`}>KETERANGAN</th>
                      {allKadars.map(k=><th key={k} className={`border-2 p-3 text-center font-black text-base ${theme==="dark"?"border-gray-700 text-white":"border-orange-200 text-gray-900"}`}>{k}</th>)}
                    </tr></thead>
                    <tbody>
                      <tr>
                        <td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-orange-200 text-gray-700"}`}>SELISIH BERAT<span className={`block text-xs font-normal ${theme==="dark"?"text-gray-500":"text-gray-400"}`}>LAKU − T/PTG</span></td>
                        {allKadars.map(k=>{const lB=lakuSummary[k]?.totalBerat||0,pB=ptgSummary[k]?.totalBerat||0,d=lB-pB,has=lB>0||pB>0;return <td key={k} className={`border-2 p-3 text-center font-bold text-sm ${theme==="dark"?"border-gray-700":"border-orange-200"}`}>{has?<span className={d>=0?(theme==="dark"?"text-emerald-400":"text-emerald-600"):(theme==="dark"?"text-red-400":"text-red-600")}>{d>=0?"+":""}{d.toLocaleString("id-ID",{maximumFractionDigits:2})} g</span>:"-"}</td>;})}
                      </tr>
                      <tr>
                        <td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-gray-300":"border-orange-200 text-gray-700"}`}>SELISIH NOMINAL<span className={`block text-xs font-normal ${theme==="dark"?"text-gray-500":"text-gray-400"}`}>LAKU Penjualan − T/PTG Modal</span></td>
                        {allKadars.map(k=>{const lS=lakuSummary[k]?.totalSales||0,pM=ptgSummary[k]?.totalModal||0,d=lS-pM,has=lS>0||pM>0;return <td key={k} className={`border-2 p-3 text-center font-bold text-sm ${theme==="dark"?"border-gray-700":"border-orange-200"}`}>{has?<span className={d>=0?(theme==="dark"?"text-emerald-400":"text-emerald-600"):(theme==="dark"?"text-red-400":"text-red-600")}>{d>=0?"+":""}Rp {formatCurrency(Math.abs(d))}{d<0?" (−)":""}</span>:"-"}</td>;})}
                      </tr>
                      <tr className={theme==="dark"?"bg-gray-800/80":"bg-orange-50/60"}>
                        <td className={`border-2 p-3 font-bold text-sm ${theme==="dark"?"border-gray-700 text-orange-400":"border-orange-200 text-orange-700"}`}>SELISIH / GRAM<span className={`block text-xs font-normal ${theme==="dark"?"text-gray-500":"text-gray-400"}`}>LAKU Rata-rata − T/PTG Rata-rata</span></td>
                        {allKadars.map(k=>{const lRR=lakuSummary[k]?.totalBerat>0?Math.round(lakuSummary[k].totalSales/lakuSummary[k].totalBerat):0,pRR=ptgSummary[k]?.totalBerat>0?Math.round(ptgSummary[k].totalModal/ptgSummary[k].totalBerat):0,d=lRR-pRR,has=lRR>0||pRR>0;return <td key={k} className={`border-2 p-3 text-center font-black text-sm ${theme==="dark"?"border-gray-700":"border-orange-200"}`}>{has?<span className={d>=0?(theme==="dark"?"text-emerald-400":"text-emerald-600"):(theme==="dark"?"text-red-400":"text-red-600")}>{d>=0?"+":""}Rp {formatCurrency(Math.abs(d))}{d<0?" (−)":""}</span>:"-"}</td>;})}
                      </tr>
                    </tbody>
                  </table>
                  <p className={`mt-3 text-xs ${theme==="dark"?"text-gray-500":"text-gray-400"}`}>
                    💡 <span className={theme==="dark"?"text-emerald-400 font-semibold":"text-emerald-600 font-semibold"}>Hijau (+)</span> = LAKU lebih tinggi dari T/PTG. <span className={theme==="dark"?"text-red-400 font-semibold":"text-red-600 font-semibold"}>Merah (−)</span> = T/PTG lebih tinggi.
                  </p>
                </div>
              </div>
            )}

            {/* ── Grand Total berdampingan di bawah tabel selisih ── */}
            {showLakuCompare && lakuTxs.length>0 && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Grand Total T/PTG */}
              <div className={`flex-1 rounded-3xl shadow-sm overflow-hidden ${theme==="dark"?"bg-gray-800":"bg-white"}`}>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-4">
                  <div className="flex items-center gap-2"><span className="text-lg">⚡</span><h3 className="font-bold text-base">Ringkasan Total T/PTG</h3></div>
                </div>
                <div className={`p-5 grid grid-cols-3 gap-4 ${theme==="dark"?"bg-gray-800":"bg-white"}`}>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${theme==="dark"?"text-gray-400":"text-gray-500"}`}>Total Modal</p>
                    <p className={`text-xl font-black mt-1 ${theme==="dark"?"text-emerald-400":"text-emerald-600"}`}>Rp {formatCurrency(totalPtgModal)}</p>
                  </div>
                  <div className={`border-l pl-4 border-dashed ${theme==="dark"?"border-gray-600":"border-gray-300"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${theme==="dark"?"text-gray-400":"text-gray-500"}`}>Total Ongkos</p>
                    <p className={`text-xl font-black mt-1 ${theme==="dark"?"text-amber-400":"text-amber-600"}`}>Rp {formatCurrency(totalPtgOngkos)}</p>
                  </div>
                  <div className={`border-l pl-4 border-dashed ${theme==="dark"?"border-gray-600":"border-gray-300"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${theme==="dark"?"text-gray-400":"text-gray-500"}`}>GPM</p>
                    <p className={`text-xl font-black mt-1 ${theme==="dark"?"text-purple-400":"text-purple-700"}`}>{gpmTotal>0?`${gpmTotal.toFixed(2)}%`:"0.00%"}</p>
                  </div>
                </div>
                <p className={`px-5 pb-4 text-xs ${theme==="dark"?"text-gray-500":"text-gray-400"}`}>⚠️ Retur dikecualikan dari seluruh perhitungan.</p>
              </div>
              {/* Grand Total LAKU */}
              <div className={`flex-1 rounded-3xl shadow-sm overflow-hidden ${theme==="dark"?"bg-gray-800":"bg-white"}`}>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-4">
                  <div className="flex items-center gap-2"><span className="text-lg">💰</span><h3 className="font-bold text-base">Ringkasan Total LAKU</h3></div>
                </div>
                <div className={`p-5 ${theme==="dark"?"bg-gray-800":"bg-white"}`}>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${theme==="dark"?"text-gray-400":"text-gray-500"}`}>Total Penjualan</p>
                    <p className={`text-xl font-black mt-1 ${theme==="dark"?"text-emerald-400":"text-emerald-600"}`}>Rp {formatCurrency(totalLakuSales)}</p>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        );
      })()}

      {/* ============ RINGKASAN MATEMATIKA OTOMATIS LAKU ============ */}
      {activeCategory === "LAKU" && sortedTransactions.length > 0 && (
        <div className={`max-w-4xl mx-auto mt-8 rounded-3xl shadow-sm overflow-hidden ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-5">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <h2 className="text-xl font-bold">Ringkasan Matematika Otomatis LAKU</h2>
                <p className="text-white/80 text-sm">Kalkulasi statistik LAKU berdasarkan kadar emas</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto p-6">
            {(() => {
              // Logika Grouping (Group by Kadar)
              const lakuSummary = sortedTransactions.reduce((acc, t) => {
                const kadar = t.kadar_karat || "-";
                if (!acc[kadar]) {
                  acc[kadar] = { totalSales: 0, totalBerat: 0 };
                }
                
                acc[kadar].totalSales += parseFloat(t.amount) || 0;
                acc[kadar].totalBerat += parseFloat(t.berat) || 0;
                return acc;
              }, {});

              // Logika Top Rangking Terlaku
              const ITEM_CATEGORIES = ["CINCIN", "KALUNG", "GELANG", "ANTING", "LIONTIN", "LOGAM MULIA"];
              const KADAR_OPTIONS = ["Semua", "8K", "9K", "16K", "24K"];
              
              const itemStats = ITEM_CATEGORIES.map(item => ({ name: item, totalBerat: 0, count: 0 }));

              let grandTotalBeratItem = 0;
              let grandTotalCountItem = 0;

              sortedTransactions.forEach(t => {
                const namaBarang = (t.namaBarang || "").toUpperCase();
                const kadarKarat = (t.kadar_karat || "").toUpperCase();
                
                // Filter by activeRankingKadar
                if (activeRankingKadar !== "Semua") {
                  if (!kadarKarat.includes(activeRankingKadar)) return;
                }

                const matchedItem = ITEM_CATEGORIES.find(item => namaBarang.includes(item));

                if (matchedItem) {
                  const berat = parseFloat(t.berat) || 0;
                  const stat = itemStats.find(s => s.name === matchedItem);
                  stat.totalBerat += berat;
                  stat.count += 1;
                  
                  grandTotalBeratItem += berat;
                  grandTotalCountItem += 1;
                }
              });

              // Sort for Berat
              const rankedByBerat = [...itemStats].sort((a, b) => b.totalBerat - a.totalBerat);
              // Sort for Count
              const rankedByCount = [...itemStats].sort((a, b) => b.count - a.count);

              // Sort kadar (numeric first, then alphabetical)
              const kadars = Object.keys(lakuSummary).sort((a, b) => {
                const numA = parseInt(a);
                const numB = parseInt(b);
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                return a.localeCompare(b);
              });

              // Hitung Grand Total
              const totalSemuaSales = kadars.reduce((sum, k) => sum + lakuSummary[k].totalSales, 0);
              const totalSemuaBerat = kadars.reduce((sum, k) => sum + lakuSummary[k].totalBerat, 0);
              const rataRataGabungan = totalSemuaBerat > 0 ? Math.round(totalSemuaSales / totalSemuaBerat) : 0;

              return (
                <div className="space-y-6">
                  <table className={`w-full border-collapse border-2 ${theme === "dark" ? "border-gray-700" : "border-emerald-200"}`}>
                    <thead>
                      <tr className={theme === "dark" ? "bg-gray-700/50" : "bg-emerald-50"}>
                        <th className={`border-2 p-4 text-left font-bold ${theme === "dark" ? "border-gray-700 text-emerald-400" : "border-emerald-200 text-emerald-800"}`}>
                          KETERANGAN
                        </th>
                        {kadars.map(k => (
                          <th key={k} className={`border-2 p-4 text-center font-black text-lg ${theme === "dark" ? "border-gray-700 text-white" : "border-emerald-200 text-gray-900"}`}>
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={`border-2 p-4 font-bold ${theme === "dark" ? "border-gray-700 text-gray-300" : "border-emerald-200 text-gray-700"}`}>
                          TOTAL BERAT
                        </td>
                        {kadars.map(k => (
                          <td key={k} className={`border-2 p-4 text-center font-semibold ${theme === "dark" ? "border-gray-700 text-gray-300" : "border-emerald-200 text-gray-800"}`}>
                            {lakuSummary[k].totalBerat > 0 ? `${lakuSummary[k].totalBerat.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} g` : "-"}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className={`border-2 p-4 font-bold ${theme === "dark" ? "border-gray-700 text-gray-300" : "border-emerald-200 text-gray-700"}`}>
                          TOTAL PENJUALAN
                        </td>
                        {kadars.map(k => (
                          <td key={k} className={`border-2 p-4 text-center font-semibold ${theme === "dark" ? "border-gray-700 text-emerald-400" : "border-emerald-200 text-emerald-600"}`}>
                            {lakuSummary[k].totalSales > 0 ? `Rp ${formatCurrency(lakuSummary[k].totalSales)}` : "-"}
                          </td>
                        ))}
                      </tr>
                      <tr className={theme === "dark" ? "bg-gray-800/80" : "bg-emerald-50/50"}>
                        <td className={`border-2 p-4 font-bold ${theme === "dark" ? "border-gray-700 text-emerald-400" : "border-emerald-200 text-emerald-700"}`}>
                          RATA-RATA / GRAM
                        </td>
                        {kadars.map(k => {
                          const rataRata = lakuSummary[k].totalBerat > 0 ? Math.round(lakuSummary[k].totalSales / lakuSummary[k].totalBerat) : 0;
                          return (
                            <td key={k} className={`border-2 p-4 text-center font-black ${theme === "dark" ? "border-gray-700 text-emerald-300" : "border-emerald-200 text-emerald-800"}`}>
                              {rataRata > 0 ? `Rp ${formatCurrency(rataRata)}` : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>

                  {/* Keseluruhan (Grand Total) */}
                  <div className={`mt-6 p-5 rounded-2xl border-2 grid grid-cols-1 md:grid-cols-3 gap-6 ${
                    theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-emerald-50/50 border-emerald-100"
                  }`}>
                    <div className="flex flex-col space-y-1">
                      <span className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Total Seluruh Penjualan
                      </span>
                      <span className={`text-2xl font-black ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                        Rp {formatCurrency(totalSemuaSales)}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-dashed border-gray-300 dark:border-gray-600">
                      <span className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Total Seluruh Berat
                      </span>
                      <span className={`text-2xl font-black ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>
                        {totalSemuaBerat.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} g
                      </span>
                    </div>
                    <div className="flex flex-col space-y-1 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-dashed border-gray-300 dark:border-gray-600">
                      <span className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Rata-Rata Penjualan / Gram
                      </span>
                      <span className={`text-2xl font-black ${
                        rataRataGabungan > 0 
                          ? (theme === "dark" ? "text-emerald-400" : "text-emerald-700") 
                          : (theme === "dark" ? "text-gray-500" : "text-gray-400")
                      }`}>
                        {rataRataGabungan > 0 ? `Rp ${formatCurrency(rataRataGabungan)}` : "Rp 0"}
                      </span>
                    </div>
                  </div>

                  {/* Top Rangking Terlaku */}
                  <div className={`mt-8 pt-6 border-t-2 border-dashed ${theme === "dark" ? "border-gray-700" : "border-emerald-200"}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-emerald-400" : "text-emerald-700"}`}>
                        <span className="text-2xl">🏆</span> Top Rangking Terlaku
                      </h3>
                      
                      {/* Kadar Filter Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {KADAR_OPTIONS.map(kadar => (
                          <button
                            key={kadar}
                            onClick={() => setActiveRankingKadar(kadar)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                              activeRankingKadar === kadar
                                ? "bg-emerald-600 text-white shadow-md"
                                : theme === "dark"
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {kadar === "Semua" ? "Semua" : `Top Kadar ${kadar}`}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Section A: Paling Laku (Berdasarkan Berat) */}
                      <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-gray-800/80 border-gray-700" : "bg-white border-emerald-100 shadow-sm"}`}>
                        <div className="flex items-center justify-between mb-4 border-b pb-3 border-dashed border-gray-200 dark:border-gray-700">
                          <span className={`font-black text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Paling Laku (Berdasarkan Berat)</span>
                          <span className="text-xl">⚖️</span>
                        </div>
                        <div className="space-y-4">
                          {rankedByBerat.map((item, index) => {
                            if (item.totalBerat === 0) return null;
                            const percentage = grandTotalBeratItem > 0 ? ((item.totalBerat / grandTotalBeratItem) * 100).toFixed(1) : 0;
                            return (
                              <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 text-center font-bold ${index === 0 ? 'text-amber-500 text-lg' : index === 1 ? 'text-gray-400 text-lg' : index === 2 ? 'text-amber-700 text-lg' : 'text-gray-500'}`}>#{index + 1}</span>
                                  <span className={`font-bold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-black ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                                    {item.totalBerat.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}g
                                  </span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-emerald-50 text-emerald-700"} min-w-[3.5rem] text-center`}>
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {rankedByBerat.filter(i => i.totalBerat > 0).length === 0 && (
                            <p className={`text-sm text-center py-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Belum ada data penjualan</p>
                          )}
                        </div>
                      </div>

                      {/* Section B: Paling Laku (Secara Jumlah Bijian) */}
                      <div className={`p-5 rounded-2xl border ${theme === "dark" ? "bg-gray-800/80 border-gray-700" : "bg-white border-blue-100 shadow-sm"}`}>
                        <div className="flex items-center justify-between mb-4 border-b pb-3 border-dashed border-gray-200 dark:border-gray-700">
                          <span className={`font-black text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Paling Laku (Jumlah Bijian)</span>
                          <span className="text-xl">📦</span>
                        </div>
                        <div className="space-y-4">
                          {rankedByCount.map((item, index) => {
                            if (item.count === 0) return null;
                            const percentage = grandTotalCountItem > 0 ? ((item.count / grandTotalCountItem) * 100).toFixed(1) : 0;
                            return (
                              <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 text-center font-bold ${index === 0 ? 'text-amber-500 text-lg' : index === 1 ? 'text-gray-400 text-lg' : index === 2 ? 'text-amber-700 text-lg' : 'text-gray-500'}`}>#{index + 1}</span>
                                  <span className={`font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>{item.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm font-black ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
                                    {item.count} terjual
                                  </span>
                                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-blue-50 text-blue-700"} min-w-[3.5rem] text-center`}>
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {rankedByCount.filter(i => i.count > 0).length === 0 && (
                            <p className={`text-sm text-center py-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Belum ada data penjualan</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============ SISTEM MATEMATIKA OTOMATIS (T/LBR & T/KP) ============ */}
      {showDetailColumns && sortedTransactions.length > 0 && (
        <div
          className={`max-w-4xl mx-auto mt-8 rounded-3xl shadow-sm overflow-hidden ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-5">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🧮</span>
              <div>
                <h2 className="text-xl font-bold">Sistem Matematika Otomatis</h2>
                <p className="text-white/80 text-sm">Kalkulasi margin & profitabilitas {activeCategory}</p>
              </div>
            </div>
          </div>

          {/* Input Harga Emas */}
          <div className={`px-6 py-5 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <label className={`block text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Harga Emas per Gram Murni (Rp) <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(masukkan angka untuk menghitung Nilai Saat Ini)</span>
              </label>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <button
                  onClick={() => setHargaEmasStatus('cek_harga')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    hargaEmasStatus === 'cek_harga'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  1. Cek Harga
                </button>
                <button
                  onClick={() => setHargaEmasStatus('terjual')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 ${
                    hargaEmasStatus === 'terjual'
                      ? 'bg-red-500 text-white shadow-sm'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span>{hargaEmasStatus === 'terjual' ? '🔒' : '🔓'}</span>
                  <span>2. Terjual</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${
                hargaEmasStatus === 'terjual'
                  ? theme === "dark" ? "text-gray-600" : "text-gray-400"
                  : theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>Rp</span>
              <input
                type="text"
                placeholder="Contoh: 1.100.000"
                value={hargaEmasPerGram}
                onChange={(e) => setHargaEmasPerGram(formatHargaInput(e.target.value))}
                disabled={hargaEmasStatus === 'terjual'}
                className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 text-xl font-bold transition-all duration-200 ${
                  hargaEmasStatus === 'terjual'
                    ? theme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      : "bg-white border-gray-200 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                }`}
              />
            </div>
          </div>

          {/* Calculation Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <th className={`text-left py-4 px-6 text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Keterangan</th>
                  <th className={`text-left py-4 px-6 text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Rumus</th>
                  <th className={`text-right py-4 px-6 text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Hasil</th>
                </tr>
              </thead>
              <tbody>
                {/* Extra: Total Berat Tambahan (only for T/LBR) */}
                {activeCategory === "T/LBR" && (
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-4 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                      <div className="flex items-center gap-2"><span>📦</span> Total Berat Tambahan</div>
                    </td>
                    <td className={`py-4 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Σ Berat Terima (Tanpa Harga)</td>
                    <td className={`py-4 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{totalBeratTambahan.toFixed(2)} gram</td>
                  </tr>
                )}
                {/* Nilai Kemurnian Emas Tambahan dari Etalase */}
                {activeCategory === "T/LBR" && (
                  <tr className={`border-b-4 border-emerald-800 dark:border-emerald-600 ${theme === "dark" ? "bg-amber-950/10" : "bg-amber-50/50"}`}>
                    <td className={`py-4 px-6 font-bold ${theme === "dark" ? "text-amber-400" : "text-amber-700"}`}>
                      <div className="flex items-center gap-2"><span>✨</span> Nilai Kemurnian Emas Tambahan dari Etalase</div>
                    </td>
                    <td className={`py-4 px-6 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      Total Berat Tambahan × Persentase Kadar Emas Tambahan
                    </td>
                    <td className={`py-4 px-6 text-right font-black text-lg ${theme === "dark" ? "text-amber-400" : "text-amber-700"}`}>
                      {nilaiKemurnianEmasTambahan.toFixed(2)} gram
                    </td>
                  </tr>
                )}
                {/* Extra: Rata-rata Kadar Tambahan (only for T/LBR) */}
                {activeCategory === "T/LBR" && (
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-4 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                      <div className="flex items-center gap-2"><span>🧪</span> Rata-rata Kadar Tambahan</div>
                    </td>
                    <td className={`py-4 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Nilai Kemurnian Tambahan / Total Berat Tambahan × 100</td>
                    <td className={`py-4 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{rataRataKadarTambahan.toFixed(2)}%</td>
                  </tr>
                )}
                {/* 1. Total Modal */}
                <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                  <td className={`py-4 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                    <div className="flex items-center gap-2"><span>💰</span> Total Modal</div>
                  </td>
                  <td className={`py-4 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Σ Seluruh Harga</td>
                  <td className={`py-4 px-6 text-right font-bold text-lg ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Rp {formatCurrency(totalModal)}</td>
                </tr>
                {/* Extra: Total Berat Terima (for T/KP and T/LBR) */}
                {(activeCategory === "T/KP" || activeCategory === "T/LBR") && (
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-4 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                      <div className="flex items-center gap-2"><span>⚖️</span> Total Berat Terima</div>
                    </td>
                    <td className={`py-4 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Σ Berat Terima</td>
                    <td className={`py-4 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{totalBeratTerima.toFixed(2)} gram</td>
                  </tr>
                )}
                {/* Extra: Rata-rata Lantak (for T/KP and T/LBR) */}
                {(activeCategory === "T/KP" || activeCategory === "T/LBR") && (
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-4 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                      <div className="flex items-center gap-2"><span>🔨</span> Rata-rata Lantak</div>
                    </td>
                    <td className={`py-4 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                      {activeCategory === "T/KP"
                        ? "Σ (Harga ÷ BRT Terima ÷ Kadar ÷ 1000) / Jumlah Data"
                        : "Σ Lantak / Jumlah Data"}
                    </td>
                    <td className={`py-4 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Rp {formatCurrency(Math.round(rataRataLantak))}</td>
                  </tr>
                )}
                {/* Extra: Total Berat Awal (only for T/LBR) */}
                {activeCategory === "T/LBR" && (
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-4 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                      <div className="flex items-center gap-2"><span>⚖️</span> Total Berat Awal</div>
                    </td>
                    <td className={`py-4 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Σ Berat Awal</td>
                    <td className={`py-4 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{totalBeratAwal.toFixed(2)} gram</td>
                  </tr>
                )}
                {/* 2. Nilai Kemurnian Emas */}
                <tr className={`border-b ${theme === "dark" ? "border-gray-700 bg-emerald-900/10" : "border-gray-100 bg-emerald-50/50"}`}>
                  <td className={`py-4 px-6 font-semibold ${theme === "dark" ? "text-emerald-400" : "text-emerald-700"}`}>
                    <div className="flex items-center gap-2"><span>✨</span> Nilai Kemurnian Emas</div>
                  </td>
                  <td className={`py-4 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Σ (Berat Terima × Kadar%)</td>
                  <td className={`py-4 px-6 text-right font-bold text-lg ${theme === "dark" ? "text-emerald-400" : "text-emerald-700"}`}>{nilaiKemurnianEmas.toFixed(2)} gram</td>
                </tr>
                {/* 3. Nilai Saat Ini */}
                <tr className={`border-b ${theme === "dark" ? "border-gray-700 bg-blue-900/10" : "border-gray-100 bg-blue-50/50"}`}>
                  <td className={`py-4 px-6 font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>
                    <div className="flex items-center gap-2"><span>💎</span> Nilai Saat Ini</div>
                  </td>
                  <td className={`py-4 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    {activeCategory === "T/LBR"
                      ? "(Kemurnian Emas − Nilai Kemurnian Emas Tambahan dari Etalase) × Harga/gram"
                      : "Kemurnian × Harga/gram"
                    }
                  </td>
                  <td className={`py-4 px-6 text-right font-bold text-lg ${hargaNum > 0 ? (theme === "dark" ? "text-blue-400" : "text-blue-700") : (theme === "dark" ? "text-gray-500" : "text-gray-400")}`}>
                    {hargaNum > 0 ? `Rp ${formatCurrency(Math.round(nilaiSaatIni))}` : "Masukkan harga emas"}
                  </td>
                </tr>
                {/* 4. Laba Bersih */}
                <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"} ${hargaNum > 0 ? (labaBersih >= 0 ? (theme === "dark" ? "bg-green-900/10" : "bg-green-50/50") : (theme === "dark" ? "bg-red-900/10" : "bg-red-50/50")) : ""}`}>
                  <td className={`py-5 px-6 font-bold text-lg ${hargaNum > 0 ? (labaBersih >= 0 ? "text-green-600" : "text-red-600") : (theme === "dark" ? "text-gray-200" : "text-gray-900")}`}>
                    <div className="flex items-center gap-2"><span>{labaBersih >= 0 ? "📈" : "📉"}</span> Laba Bersih</div>
                  </td>
                  <td className={`py-5 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Nilai Saat Ini − Total Modal</td>
                  <td className={`py-5 px-6 text-right font-black text-xl ${hargaNum > 0 ? (labaBersih >= 0 ? "text-green-600" : "text-red-600") : (theme === "dark" ? "text-gray-500" : "text-gray-400")}`}>
                    {hargaNum > 0 ? `${labaBersih >= 0 ? "+" : ""}Rp ${formatCurrency(Math.round(labaBersih))}` : "-"}
                  </td>
                </tr>
                {/* 5. GPM */}
                <tr className={`${theme === "dark" ? "bg-gray-700/30" : "bg-gray-50"}`}>
                  <td className={`py-5 px-6 font-bold text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                    <div className="flex items-center gap-2"><span>📊</span> GPM (Gross Profit Margin)</div>
                  </td>
                  <td className={`py-5 px-6 text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Laba Bersih / Modal × 100</td>
                  <td className={`py-5 px-6 text-right font-black text-xl ${hargaNum > 0 ? (gpm >= 0 ? "text-green-600" : "text-red-600") : (theme === "dark" ? "text-gray-500" : "text-gray-400")}`}>
                    {hargaNum > 0 ? `${gpm >= 0 ? "+" : ""}${gpm.toFixed(2)}%` : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Kunci Tabbel Button */}
          {activeCategory === "T/LBR" && (period === "all" || period === "monthly" || period === "yearly") && (
            <div className={`p-4 border-t flex justify-end ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
              <button
                onClick={() => setShowLockConfirm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <span>🔒</span>
                <span>Kunci Tabbel</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============ SNAPSHOTS MATEMATIKA OTOMATIS ============ */}
      {activeCategory === "T/LBR" && (period === "all" || period === "monthly" || period === "yearly") && lockedSnapshots.map((snap, idx) => {
        const snapHargaNum = parseFloat((snap.hargaEmasPerGram || "").replace(/\D/g, "")) || 0;
        const snapNetKemurnianEmas = snap.category === "T/LBR"
          ? (snap.nilaiKemurnianEmas - getSnapshotKemurnianTambahan(snap))
          : snap.nilaiKemurnianEmas;
        const snapNilaiSaatIni = snapNetKemurnianEmas * snapHargaNum;
        const snapLabaBersih = snapNilaiSaatIni - snap.totalModal;
        const snapGpm = snap.totalModal > 0 ? (snapLabaBersih / snap.totalModal) * 100 : 0;
        const snapNilaiKemurnianEmasTambahan = getSnapshotKemurnianTambahan(snap);
        const snapRataRataKadarTambahan = (snap.totalBeratTambahan || 0) > 0
          ? (snapNilaiKemurnianEmasTambahan / snap.totalBeratTambahan) * 100
          : 0;

        const updateSnapshot = (id, updates) => {
          handleUpdateSnapshot(id, updates);
        };

        return (
          <div
            key={snap.id}
            className={`max-w-4xl mx-auto mt-8 rounded-3xl shadow-sm overflow-hidden border-2 border-indigo-500/50 ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h2 className="text-xl font-bold">Data Terkunci #{idx + 1}</h2>
                  <p className="text-white/80 text-sm">T/LBR {snap.period === 'all' ? 'Semua' : snap.period === 'yearly' ? 'Tahunan' : 'Bulanan'} - {new Date(snap.date).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSnapshotToDiscard({ snap, idx })}
                  className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 shadow-md hover:scale-105"
                >
                  Buang
                </button>
                <button
                  onClick={() => setSnapshotToDelete({ snap, idx })}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            {/* Input Harga Emas Snapshot */}
            <div className={`px-6 py-5 border-b ${theme === "dark" ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <label className={`block text-sm font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Harga Emas per Gram Murni (Rp) <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Khusus Data Ini)</span>
                </label>
                <div className="flex space-x-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => updateSnapshot(snap.id, { hargaEmasStatus: 'cek_harga' })}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      snap.hargaEmasStatus === 'cek_harga'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    1. Cek Harga
                  </button>
                  <button
                    onClick={() => updateSnapshot(snap.id, { hargaEmasStatus: 'terjual' })}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 ${
                      snap.hargaEmasStatus === 'terjual'
                        ? 'bg-red-500 text-white shadow-sm'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <span>{snap.hargaEmasStatus === 'terjual' ? '🔒' : '🔓'}</span>
                    <span>2. Terjual</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${
                  snap.hargaEmasStatus === 'terjual'
                    ? theme === "dark" ? "text-gray-600" : "text-gray-400"
                    : theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>Rp</span>
                <input
                  type="text"
                  placeholder="Contoh: 1.100.000"
                  value={snap.hargaEmasPerGram || ""}
                  onChange={(e) => updateSnapshot(snap.id, { hargaEmasPerGram: formatHargaInput(e.target.value) })}
                  disabled={snap.hargaEmasStatus === 'terjual'}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl border-2 text-lg font-bold transition-all duration-200 ${
                    snap.hargaEmasStatus === 'terjual'
                      ? theme === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : theme === "dark"
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        : "bg-white border-gray-200 placeholder-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
              </div>
            </div>
            {/* Calculation Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                    <th className={`text-left py-4 px-6 text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Keterangan</th>
                    <th className={`text-right py-4 px-6 text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Hasil (Terkunci)</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.category === "T/LBR" && (
                    <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                      <td className={`py-3 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>📦 Total Berat Tambahan</td>
                      <td className={`py-3 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{(snap.totalBeratTambahan || 0).toFixed(2)} gram</td>
                    </tr>
                  )}
                  {snap.category === "T/LBR" && (
                    <tr className={`border-b-4 border-emerald-800 dark:border-emerald-600 ${theme === "dark" ? "bg-amber-950/10" : "bg-amber-50/50"}`}>
                      <td className={`py-3 px-6 font-bold ${theme === "dark" ? "text-amber-400" : "text-amber-700"}`}>✨ Nilai Kemurnian Emas Tambahan dari Etalase</td>
                      <td className={`py-3 px-6 text-right font-black text-lg ${theme === "dark" ? "text-amber-400" : "text-amber-700"}`}>{getSnapshotKemurnianTambahan(snap).toFixed(2)} gram</td>
                    </tr>
                  )}
                  {snap.category === "T/LBR" && (
                    <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                      <td className={`py-3 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>🧪 Rata-rata Kadar Tambahan</td>
                      <td className={`py-3 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{snapRataRataKadarTambahan.toFixed(2)}%</td>
                    </tr>
                  )}
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-3 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>💰 Total Modal</td>
                    <td className={`py-3 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Rp {formatCurrency(snap.totalModal)}</td>
                  </tr>
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-3 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>⚖️ Total Berat Terima</td>
                    <td className={`py-3 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{snap.totalBeratTerima.toFixed(2)} gram</td>
                  </tr>
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-3 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>🔨 Rata-rata Lantak</td>
                    <td className={`py-3 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Rp {formatCurrency(Math.round(snap.rataRataLantak))}</td>
                  </tr>
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-3 px-6 font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>⚖️ Total Berat Awal</td>
                    <td className={`py-3 px-6 text-right font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{snap.totalBeratAwal.toFixed(2)} gram</td>
                  </tr>
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700 bg-emerald-900/10" : "border-gray-100 bg-emerald-50/50"}`}>
                    <td className={`py-3 px-6 font-semibold ${theme === "dark" ? "text-emerald-400" : "text-emerald-700"}`}>✨ Nilai Kemurnian Emas</td>
                    <td className={`py-3 px-6 text-right font-bold ${theme === "dark" ? "text-emerald-400" : "text-emerald-700"}`}>{snap.nilaiKemurnianEmas.toFixed(2)} gram</td>
                  </tr>
                  {/* Dynamic sections based on snapshot's hargaEmasPerGram */}
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700 bg-blue-900/10" : "border-gray-100 bg-blue-50/50"}`}>
                    <td className={`py-3 px-6 font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>💎 Nilai Saat Ini (Dinamis)</td>
                    <td className={`py-3 px-6 text-right font-bold ${snapHargaNum > 0 ? (theme === "dark" ? "text-blue-400" : "text-blue-700") : (theme === "dark" ? "text-gray-500" : "text-gray-400")}`}>
                      {snapHargaNum > 0 ? `Rp ${formatCurrency(Math.round(snapNilaiSaatIni))}` : "Masukkan harga emas"}
                    </td>
                  </tr>
                  <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-100"}`}>
                    <td className={`py-4 px-6 font-bold ${snapHargaNum > 0 ? (snapLabaBersih >= 0 ? "text-green-600" : "text-red-600") : (theme === "dark" ? "text-gray-200" : "text-gray-900")}`}>
                      {snapLabaBersih >= 0 ? "📈" : "📉"} Laba Bersih (Dinamis)
                    </td>
                    <td className={`py-4 px-6 text-right font-black text-lg ${snapHargaNum > 0 ? (snapLabaBersih >= 0 ? "text-green-600" : "text-red-600") : (theme === "dark" ? "text-gray-500" : "text-gray-400")}`}>
                      {snapHargaNum > 0 ? `${snapLabaBersih >= 0 ? "+" : ""}Rp ${formatCurrency(Math.round(snapLabaBersih))}` : "-"}
                    </td>
                  </tr>
                  <tr className={`${theme === "dark" ? "bg-gray-700/30" : "bg-gray-50"}`}>
                    <td className={`py-4 px-6 font-bold ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>📊 GPM (Dinamis)</td>
                    <td className={`py-4 px-6 text-right font-black text-lg ${snapHargaNum > 0 ? (snapGpm >= 0 ? "text-green-600" : "text-red-600") : (theme === "dark" ? "text-gray-500" : "text-gray-400")}`}>
                      {snapHargaNum > 0 ? `${snapGpm >= 0 ? "+" : ""}${snapGpm.toFixed(2)}%` : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Delete / Cancel Confirmation Modal */}
      {snapshotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl transform transition-all ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <span className="text-3xl text-blue-600 dark:text-blue-400">🔄</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Cancel Kunci Data?
              </h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Apakah yakin ingin membatalkan kunci dan mengembalikan data dari <strong>Data Terkunci #{snapshotToDelete.idx + 1}</strong> ke kalkulasi utama?<br />
                <span className="text-sm mt-1 block text-gray-500">T/LBR {snapshotToDelete.snap.period === 'all' ? 'Semua' : snapshotToDelete.snap.period === 'yearly' ? 'Tahunan' : 'Bulanan'} - {new Date(snapshotToDelete.snap.date).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
              </p>
              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setSnapshotToDelete(null)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    try {
                      await lockedSnapshotAPI.delete(snapshotToDelete.snap.id);
                      setLockedSnapshots(lockedSnapshots.filter(s => s.id !== snapshotToDelete.snap.id));
                      const idsToRemove = snapshotToDelete.snap.transaction_ids || [];
                      setLockedTransactionIds(lockedTransactionIds.filter(id => !idsToRemove.includes(id)));
                    } catch (error) {
                      console.error("Failed to delete snapshot from database:", error);
                    }
                    setSnapshotToDelete(null);
                  }}
                  className="flex-1 bg-blue-650 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors shadow-md"
                >
                  Ya, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {snapshotToDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl transform transition-all ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <span className="text-3xl text-red-600 dark:text-red-400">⚠️</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Buang Data Terkunci?
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin menghapus <strong>Data Terkunci #{snapshotToDiscard.idx + 1}</strong> beserta seluruh transaksi di dalamnya secara permanen?
              </p>
              <p className={`mb-6 text-xs ${theme === 'dark' ? 'text-red-450 font-semibold' : 'text-red-650 font-semibold'}`}>
                ⚠️ Tindakan ini permanen. Data tidak akan dikembalikan ke dalam Sistem Matematika Otomatis.
              </p>
              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setSnapshotToDiscard(null)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    try {
                      // 1. Delete all transactions associated with this snapshot from database
                      const txIds = snapshotToDiscard.snap.transaction_ids || [];
                      await Promise.all(txIds.map(id => transactionAPI.delete(id)));

                      // 2. Delete the locked snapshot record from database
                      await lockedSnapshotAPI.delete(snapshotToDiscard.snap.id);

                      // 3. Update local state variables
                      setLockedSnapshots(lockedSnapshots.filter(s => s.id !== snapshotToDiscard.snap.id));
                      setLockedTransactionIds(lockedTransactionIds.filter(id => !txIds.includes(id)));

                      // 4. Refresh parent component data
                      if (onRefresh) {
                        onRefresh();
                      }
                    } catch (error) {
                      console.error("Failed to discard snapshot and its transactions:", error);
                      alert("Gagal membuang data transaksi!");
                    }
                    setSnapshotToDiscard(null);
                  }}
                  className="flex-1 bg-red-650 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-colors shadow-md"
                >
                  Ya, Buang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lock Confirmation Modal */}
      {showLockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl transform transition-all ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Kunci Data Tabel?
              </h3>
              <p className={`mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Apakah Anda yakin ingin mengunci data ini?
              </p>
              <p className={`mb-6 text-xs ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
                ⚠️ Data Sistem Matematika Otomatis akan di-restart setelah dikunci.
              </p>
              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setShowLockConfirm(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    const currentIds = sortedTransactions.map(t => t.id);
                    const snapshotData = {
                      category: activeCategory,
                      date: new Date().toISOString(),
                      period: period,
                      totalModal,
                      totalBeratTerima,
                      rataRataLantak,
                      totalBeratAwal,
                      totalBeratTambahan,
                      nilaiKemurnianEmas,
                      hargaEmasPerGram: hargaEmasPerGram,
                      hargaEmasStatus: hargaEmasStatus,
                      transaction_ids: currentIds
                    };

                    try {
                      const response = await lockedSnapshotAPI.create(snapshotData);
                      if (response.data) {
                        setLockedSnapshots([...lockedSnapshots, response.data]);
                        setLockedTransactionIds([...lockedTransactionIds, ...currentIds]);
                      }
                    } catch (error) {
                      console.error("Failed to save snapshot to database:", error);
                    }

                    // Reset harga emas input
                    setHargaEmasPerGram("");
                    setHargaEmasStatus("cek_harga");
                    setShowLockConfirm(false);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-colors shadow-md"
                >
                  Ya, Kunci
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proses Confirmation Modal */}
      {pendingProsesChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl transform transition-all ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <span className="text-3xl text-blue-600 dark:text-blue-400">❓</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Konfirmasi Perubahan
              </h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {getProsesChangeDescription()}
              </p>
              <div className="flex space-x-3 w-full">
                <button
                  onClick={handleCancelProsesChange}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmProsesChange}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors shadow-md animate-pulse"
                >
                  Ya, Yakin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-lg p-6 rounded-3xl shadow-xl transform transition-all overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✏️</span>
                <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Edit Transaksi {activeCategory}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setEditForm(null);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Nama Barang / Kategori Barang */}
                <div className="col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {editingTransaction.category === "T/PTG" || editingTransaction.category === "LAKU" ? "Kategori Barang" : "Nama Barang"}
                  </label>
                  {editingTransaction.category === "T/PTG" || editingTransaction.category === "LAKU" ? (
                    <select
                      value={editForm.namaBarang}
                      onChange={(e) => setEditForm({ ...editForm, namaBarang: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                          : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                      }`}
                    >
                      <option value="" disabled>Pilih Kategori Barang</option>
                      <option value="Cincin">Cincin</option>
                      <option value="Anting">Anting</option>
                      <option value="Liontin">Liontin</option>
                      <option value="Gelang">Gelang</option>
                      <option value="Kalung">Kalung</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editForm.namaBarang}
                      onChange={(e) => setEditForm({ ...editForm, namaBarang: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-900/20'
                          : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
                      }`}
                    />
                  )}
                </div>

                {/* Nama Spesifik */}
                <div className="col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Nama Spesifik (Sub-Nama)
                  </label>
                  <input
                    type="text"
                    value={editForm.namaSpesifik}
                    onChange={(e) => setEditForm({ ...editForm, namaSpesifik: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-900/20'
                        : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
                    }`}
                  />
                </div>

                {/* Kadar / Kadar Karat */}
                <div>
                  {editingTransaction.category === "T/PTG" || editingTransaction.category === "LAKU" ? (
                    <>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Kadar
                      </label>
                      <select
                        value={editForm.kadar_karat}
                        onChange={(e) => setEditForm({ ...editForm, kadar_karat: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                            : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                        }`}
                      >
                        <option value="" disabled>Pilih Kadar</option>
                        <option value="8K">8K</option>
                        <option value="9K">9K</option>
                        <option value="16K">16K</option>
                        <option value="24K">24K</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Kadar (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.kadar}
                        onChange={(e) => setEditForm({ ...editForm, kadar: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                            : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                        }`}
                      />
                    </>
                  )}
                </div>

                {/* Berat / Berat Awal */}
                <div>
                  {editingTransaction.category === "T/PTG" || editingTransaction.category === "LAKU" ? (
                    <>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Berat Emas (g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.berat}
                        onChange={(e) => setEditForm({ ...editForm, berat: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                            : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                        }`}
                      />
                    </>
                  ) : (
                    <>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Berat Awal (g)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.beratAwal}
                        onChange={(e) => setEditForm({ ...editForm, beratAwal: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                            : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                        }`}
                      />
                    </>
                  )}
                </div>

                {/* Ongkos / Berat Terima */}
                {editingTransaction.category !== "LAKU" && (
                  <div>
                    {editingTransaction.category === "T/PTG" ? (
                      <>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Ongkos (Rp)
                        </label>
                        <input
                          type="number"
                          value={editForm.ongkos}
                          onChange={(e) => setEditForm({ ...editForm, ongkos: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                              : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                          }`}
                        />
                      </>
                    ) : (
                      <>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Berat Terima (g)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.beratTerima}
                          onChange={(e) => setEditForm({ ...editForm, beratTerima: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                              : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                          }`}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Jenis Transaksi */}
                {editingTransaction.category !== "LAKU" && (
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Jenis Transaksi
                    </label>
                    <select
                      value={editForm.jenisTransaksi}
                      onChange={(e) => setEditForm({ ...editForm, jenisTransaksi: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                          : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                      }`}
                    >
                      {editingTransaction.category === "T/PTG" ? (
                        <>
                          <option value="Transaksi">Transaksi</option>
                          <option value="Retur">Retur</option>
                        </>
                      ) : (
                        <>
                          <option value="TRANSAKSI">TRANSAKSI</option>
                          <option value="Tambahan">Tambahan</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* Jumlah (Harga) */}
                <div className="col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {editingTransaction.category === "T/PTG" || editingTransaction.category === "LAKU" ? "Total Nominal / Harga (Rp)" : "Jumlah / Harga (Rp)"}
                  </label>
                  {editForm.jenisTransaksi === "Tambahan" && editingTransaction.category !== "T/PTG" && editingTransaction.category !== "LAKU" ? (
                    <div className={`px-4 py-2.5 rounded-2xl border-2 text-sm font-bold ${
                      theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-600' : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      Rp 0 (Otomatis dinonaktifkan untuk transaksi Tambahan)
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-900/20'
                          : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
                      }`}
                    />
                  )}
                </div>

                {/* Kode Baki Etalase (Only for LAKU) */}
                {editingTransaction.category === "LAKU" && (
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Kode Baki Etalase
                    </label>
                    <select
                      value={editForm.kode_baki}
                      onChange={(e) => setEditForm({ ...editForm, kode_baki: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                          : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                      }`}
                    >
                      <option value="" disabled>Pilih Kode Baki (A-Z)</option>
                      {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].map((letter) => (
                        <option key={letter} value={letter}>{letter}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Baris ke (Only for LAKU) */}
                {editingTransaction.category === "LAKU" && (
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Baris ke
                    </label>
                    <select
                      value={editForm.baris_ke}
                      onChange={(e) => setEditForm({ ...editForm, baris_ke: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                          : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                      }`}
                    >
                      <option value="" disabled>Pilih Baris (1-9)</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Proses */}
                {editingTransaction.category !== "T/PTG" && editingTransaction.category !== "LAKU" && (
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Proses
                    </label>
                    <select
                      value={editForm.jenisProses}
                      onChange={(e) => setEditForm({ ...editForm, jenisProses: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500'
                          : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500'
                      }`}
                    >
                      <option value="DiLebur">DiLebur</option>
                      <option value="KULLAK">KULLAK</option>
                    </select>
                  </div>
                )}

                {/* Catatan */}
                <div className="col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Catatan
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-900/20'
                        : 'bg-white border-gray-200 text-gray-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="flex space-x-3 w-full pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                onClick={() => {
                  setEditingTransaction(null);
                  setEditForm(null);
                }}
                className={`flex-1 py-3 rounded-2xl font-bold transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl font-bold transition-colors shadow-md shadow-amber-500/20 hover:scale-102 active:scale-98"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "../utils/formatCurrency";

// Helper to calculate Jatuh Tempo (3 months after date)
const calculateDueDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
};

// Helper to parse weight from collateral string (e.g. C/24K/58.75g -> 58.75)
const parseWeight = (str) => {
  if (!str) return 0;
  const match = str.match(/(\d+(?:\.\d+)?)\s*g/i);
  return match ? parseFloat(match[1]) : 0;
};

// Helper to parse period days from keterangan (e.g. "/15 hari" -> 15)
const parsePeriodDays = (keterangan) => {
  if (!keterangan) return 15; // default 15 hari
  const match = keterangan.match(/(\d+)/); 
  return match ? parseInt(match[1], 10) : 15;
};

// Helper to calculate running interest (bunga berjalan)
// Formula: TTL_Bunga × (hari_berjalan / periode_hari)
// TTL_Bunga = jumlah × bunga% 
// hari_berjalan = selisih hari dari tgl hutang sampai hari ini
// periode_hari = angka dari keterangan (misal 15)
const calcBungaBerjalan = (item) => {
  if (item.lunas) return 0;
  const ttlBunga = (item.jumlah * item.bunga) / 100;
  const periodDays = parsePeriodDays(item.keterangan);
  if (periodDays <= 0) return 0;
  const startDate = new Date(item.tgl);
  const today = new Date();
  // reset jam agar hitungan hari bersih
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today - startDate;
  const daysBerjalan = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return ttlBunga * (daysBerjalan / periodDays);
};

// Mock Initial Data matching the user's Excel screenshot
const initialHutang = [
  {
    id: "h_1",
    tgl: "2026-02-24",
    atasNama: "BSI IBUK",
    jumlah: 129300,
    bunga: 1.01,
    keterangan: "/15 hari",
    jatuhTempo: "2026-05-24",
    penanggungJawab: "ARDI/SWJJR",
    jaminanBerupa: "C/24K/58.75g",
    jaminanDetail: "Cincin Emas 24K berat 58.75 gram",
    pelunasanTgl: "",
    pelunasanByrBunga: "",
    lunas: false
  },
  {
    id: "h_2",
    tgl: "2026-03-04",
    atasNama: "BSI UTI",
    jumlah: 134800,
    bunga: 1.01,
    keterangan: "/15 hari",
    jatuhTempo: "2026-06-04",
    penanggungJawab: "ISMAIL/sukun",
    jaminanBerupa: "C/24K/61.25g",
    jaminanDetail: "Cincin Emas 24K berat 61.25 gram",
    pelunasanTgl: "",
    pelunasanByrBunga: "",
    lunas: false
  },
  {
    id: "h_3",
    tgl: "2026-03-17",
    atasNama: "BSI IBUK",
    jumlah: 100500,
    bunga: 1.01,
    keterangan: "/15 hari",
    jatuhTempo: "2026-06-17",
    penanggungJawab: "ENDAH/PAKIS",
    jaminanBerupa: "P/16K/69.28G",
    jaminanDetail: "Liontin/Perhiasan 16K berat 69.28 gram",
    pelunasanTgl: "",
    pelunasanByrBunga: "",
    lunas: false
  }
];

export default function Hutang({ theme }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("lucky_hutang_data");
    return saved ? JSON.parse(saved) : initialHutang;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, lunas, belum, jatuh-tempo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formState, setFormState] = useState({
    tgl: "",
    atasNama: "",
    jumlah: "",
    bunga: "1.01",
    keterangan: "/15 hari",
    jatuhTempo: "",
    penanggungJawab: "",
    jaminanBerupa: "",
    jaminanDetail: "",
    pelunasanTgl: "",
    pelunasanByrBunga: "",
    lunas: false
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("lucky_hutang_data", JSON.stringify(data));
  }, [data]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === "checkbox" ? checked : value;
    
    setFormState(prev => {
      const updated = { ...prev, [name]: newVal };
      // Auto calculate jatuh tempo if tgl changes
      if (name === "tgl" && !prev.jatuhTempo) {
        updated.jatuhTempo = calculateDueDate(value);
      }
      return updated;
    });
  };

  // Open modal for add
  const openAddModal = () => {
    setEditingId(null);
    setFormState({
      tgl: new Date().toISOString().split("T")[0],
      atasNama: "",
      jumlah: "",
      bunga: "1.01",
      keterangan: "/15 hari",
      jatuhTempo: calculateDueDate(new Date().toISOString().split("T")[0]),
      penanggungJawab: "",
      jaminanBerupa: "",
      jaminanDetail: "",
      pelunasanTgl: "",
      pelunasanByrBunga: "",
      lunas: false
    });
    setIsModalOpen(true);
  };

  // Open modal for edit
  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormState({ ...item });
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan hutang ini?")) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  // Toggle quick lunas status directly
  const handleToggleLunas = (id) => {
    setData(prev => prev.map(item => {
      if (item.id === id) {
        const nextLunas = !item.lunas;
        return {
          ...item,
          lunas: nextLunas,
          pelunasanTgl: nextLunas ? new Date().toISOString().split("T")[0] : "",
          pelunasanByrBunga: nextLunas ? (item.jumlah + (item.jumlah * item.bunga / 100)) : ""
        };
      }
      return item;
    }));
  };

  // Save form handler
  const handleSave = (e) => {
    e.preventDefault();
    const cleanJumlah = parseFloat(formState.jumlah) || 0;
    const cleanBunga = parseFloat(formState.bunga) || 0;
    const cleanByrBunga = parseFloat(formState.pelunasanByrBunga) || 0;

    const savedRecord = {
      ...formState,
      jumlah: cleanJumlah,
      bunga: cleanBunga,
      pelunasanByrBunga: formState.lunas ? (cleanByrBunga || (cleanJumlah + (cleanJumlah * cleanBunga / 100))) : ""
    };

    if (editingId) {
      setData(prev => prev.map(item => item.id === editingId ? { ...savedRecord, id: editingId } : item));
    } else {
      setData(prev => [
        ...prev,
        {
          ...savedRecord,
          id: `h_${Date.now()}`
        }
      ]);
    }
    setIsModalOpen(false);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `catatan_hutang_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import from JSON
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            setData(parsed);
            alert("Data hutang berhasil di-import!");
          } else {
            alert("Format berkas JSON tidak valid.");
          }
        } catch (err) {
          alert("Gagal membaca berkas JSON.");
        }
      };
    }
  };

  // Memoized Calculations
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    let totalHutangBelumLunas = 0;
    let totalBungaBerjalan = 0;
    let totalTtlBunga = 0;
    let totalHutangLunas = 0;
    let totalBeratJaminan = 0;
    let countJatuhTempo = 0;

    data.forEach(item => {
      const isPastDue = item.jatuhTempo && item.jatuhTempo < today && !item.lunas;
      if (isPastDue) countJatuhTempo++;
      
      const itemWeight = parseWeight(item.jaminanBerupa);
      totalBeratJaminan += itemWeight;

      const ttlBunga = (item.jumlah * item.bunga) / 100;
      totalTtlBunga += ttlBunga;

      // Bunga berjalan = TTL Bunga × (hari sejak tgl hutang / periode hari)
      const bungaBerjalan = calcBungaBerjalan(item);

      if (item.lunas) {
        totalHutangLunas += item.jumlah;
      } else {
        totalHutangBelumLunas += item.jumlah;
        totalBungaBerjalan += bungaBerjalan;
      }
    });

    return {
      totalHutangBelumLunas,
      totalBungaBerjalan,
      totalTtlBunga,
      totalHutangLunas,
      totalBeratJaminan,
      countJatuhTempo,
      totalRecord: data.length
    };
  }, [data]);

  // Filtered Data
  const filteredData = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return data.filter(item => {
      const matchText = 
        item.atasNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jaminanBerupa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === "lunas") {
        matchStatus = item.lunas;
      } else if (statusFilter === "belum") {
        matchStatus = !item.lunas;
      } else if (statusFilter === "jatuh-tempo") {
        matchStatus = !item.lunas && item.jatuhTempo && item.jatuhTempo < today;
      }

      return matchText && matchStatus;
    }).sort((a, b) => new Date(b.tgl) - new Date(a.tgl)); // Sort by date descending
  }, [data, searchTerm, statusFilter]);

  const isDark = theme === "dark";

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-4xl font-extrabold mb-2 tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
          💰 Catatan Hutang Toko
        </h1>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Kelola data hutang, tempo bunga, jaminan perhiasan emas, dan status pelunasan
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Hutang Belum Lunas */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] shadow-sm ${
          isDark ? "bg-gray-800 border-amber-500/20" : "bg-white border-amber-200"
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              Hutang Belum Lunas
            </span>
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            Rp {formatCurrency(stats.totalHutangBelumLunas)}
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Dari {data.filter(i => !i.lunas).length} transaksi aktif
          </p>
        </div>

        {/* Total Bunga Berjalan */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] shadow-sm ${
          isDark ? "bg-gray-800 border-yellow-500/20" : "bg-white border-yellow-200"
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
              Bunga Berjalan
            </span>
            <span className="text-2xl">📈</span>
          </div>
          <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            Rp {formatCurrency(Math.round(stats.totalBungaBerjalan))}
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            = TTL Bunga × (hari berjalan / periode)
          </p>
          <p className={`text-[10px] mt-0.5 ${isDark ? "text-gray-600" : "text-gray-300"}`}>
            Total TTL Bunga: Rp {formatCurrency(Math.round(stats.totalTtlBunga))}
          </p>
        </div>

        {/* Total Jaminan Emas */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] shadow-sm ${
          isDark ? "bg-gray-800 border-rose-500/20" : "bg-white border-rose-200"
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-rose-400" : "text-rose-600"}`}>
              Total Jaminan Emas
            </span>
            <span className="text-2xl">💍</span>
          </div>
          <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
            {stats.totalBeratJaminan.toFixed(2)} g
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Berat emas jaminan aktif terdeteksi
          </p>
        </div>

        {/* Jatuh Tempo Alert / Total Lunas */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.02] shadow-sm ${
          stats.countJatuhTempo > 0 
            ? (isDark ? "bg-red-950/20 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700")
            : (isDark ? "bg-gray-800 border-emerald-500/20" : "bg-white border-emerald-200")
        }`}>
          <div className="flex justify-between items-start mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              stats.countJatuhTempo > 0 
                ? (isDark ? "text-red-400" : "text-red-600")
                : (isDark ? "text-emerald-400" : "text-emerald-600")
            }`}>
              {stats.countJatuhTempo > 0 ? "Lewat Jatuh Tempo!" : "Hutang Lunas"}
            </span>
            <span className="text-2xl">{stats.countJatuhTempo > 0 ? "🚨" : "✅"}</span>
          </div>
          <h2 className={`text-2xl font-black ${isDark && stats.countJatuhTempo === 0 ? "text-white" : ""}`}>
            {stats.countJatuhTempo > 0 ? `${stats.countJatuhTempo} Transaksi` : `Rp ${formatCurrency(stats.totalHutangLunas)}`}
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            {stats.countJatuhTempo > 0 ? "Memerlukan penagihan segera" : "Total hutang berhasil diselesaikan"}
          </p>
        </div>
      </div>

      {/* Control Area */}
      <div className={`p-6 rounded-3xl shadow-sm mb-6 border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Cari nama, penanggung jawab, jaminan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-all duration-200 text-sm ${
                isDark 
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500" 
                  : "bg-white border-gray-200 placeholder-gray-400 focus:border-emerald-500"
              }`}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-3 rounded-2xl border text-sm transition-all duration-200 ${
              isDark 
                ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" 
                : "bg-white border-gray-200 text-gray-700 focus:border-emerald-500"
            }`}
          >
            <option value="all">Semua Status</option>
            <option value="belum">Belum Lunas</option>
            <option value="lunas">Sudah Lunas</option>
            <option value="jatuh-tempo">Lewat Jatuh Tempo</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <span>➕</span> Tambah Hutang
          </button>
          
          <button
            onClick={handleExportJSON}
            className={`p-3 rounded-2xl border text-sm transition-all hover:scale-[1.02] ${
              isDark ? "border-gray-600 text-gray-300 bg-gray-750 hover:bg-gray-700" : "border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100"
            }`}
            title="Export Backup JSON"
          >
            📥 Export
          </button>

          <label className={`p-3 rounded-2xl border text-sm cursor-pointer transition-all hover:scale-[1.02] flex items-center ${
            isDark ? "border-gray-600 text-gray-300 bg-gray-750 hover:bg-gray-700" : "border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100"
          }`} title="Import Backup JSON">
            📤 Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Excel-styled Glassmorphic Table */}
      <div className={`rounded-3xl shadow-sm border overflow-hidden ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            {/* Super Headers (Excel Merged Header Style) */}
            <thead>
              <tr className="text-center font-black text-white">
                {/* HUTANG GROUP - Kuning */}
                <th colSpan={8} className="bg-amber-500 border border-amber-600/30 py-2.5 uppercase tracking-wider text-[10px]">
                  📊 Rincian Catatan Hutang
                </th>
                {/* PENANGGUNG JAWAB GROUP - Hijau */}
                <th colSpan={1} className="bg-emerald-600 border border-emerald-700/30 py-2.5 uppercase tracking-wider text-[10px]">
                  👤 PIC
                </th>
                {/* JAMINAN GROUP - Merah */}
                <th colSpan={2} className="bg-rose-600 border border-rose-700/30 py-2.5 uppercase tracking-wider text-[10px]">
                  🛡️ Jaminan
                </th>
                {/* PELUNASAN GROUP - Teal */}
                <th colSpan={3} className="bg-teal-600 border border-teal-700/30 py-2.5 uppercase tracking-wider text-[10px]">
                  💸 Pelunasan & Status
                </th>
                {/* AKSIS */}
                <th rowSpan={2} className={`px-4 py-3 align-middle text-center border text-[10px] uppercase font-bold tracking-wider ${
                  isDark ? "bg-gray-750 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"
                }`}>
                  Aksi
                </th>
              </tr>
              {/* Secondary Headers */}
              <tr className={`border-b ${isDark ? "bg-gray-750 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                {/* Hutang */}
                <th className={`px-3 py-3 border text-center font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>TGL</th>
                <th className={`px-3 py-3 border font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>ATAS NAMA</th>
                <th className={`px-3 py-3 border text-right font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>JUMLAH</th>
                <th className={`px-3 py-3 border text-center font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>BUNGA</th>
                <th className={`px-3 py-3 border text-center font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>KETERANGAN</th>
                <th className={`px-3 py-3 border text-center font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>JATUH TEMPO</th>
                <th className={`px-3 py-3 border text-right font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>TTL BUNGA</th>
                <th className={`px-3 py-3 border text-right font-bold ${isDark ? "border-gray-700 text-yellow-300" : "border-gray-200 text-yellow-700"}`}>BUNGA BERJALAN</th>
                
                {/* Penanggung Jawab */}
                <th className={`px-3 py-3 border font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>PENANGGUNG JAWAB</th>

                {/* Jaminan */}
                <th className={`px-3 py-3 border font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>BERUPA</th>
                <th className={`px-3 py-3 border font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>DETAIL</th>

                {/* Pelunasan */}
                <th className={`px-3 py-3 border text-center font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>TGL</th>
                <th className={`px-3 py-3 border text-right font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>BYR+BUNGA</th>
                <th className={`px-3 py-3 border text-center font-bold ${isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}>LUNAS</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-150"}`}>
              {filteredData.map(item => {
                const today = new Date().toISOString().split("T")[0];
                const isPastDue = item.jatuhTempo && item.jatuhTempo < today && !item.lunas;
                const ttlBunga = (item.jumlah * item.bunga) / 100;
                const bungaBerjalan = calcBungaBerjalan(item);
                const periodDays = parsePeriodDays(item.keterangan);
                const startDate = new Date(item.tgl);
                const todayDate = new Date();
                startDate.setHours(0,0,0,0);
                todayDate.setHours(0,0,0,0);
                const daysBerjalan = Math.max(0, Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24)));
                
                // Format dates for display (DD/MM/YYYY)
                const formatDate = (dateStr) => {
                  if (!dateStr) return "-";
                  const parts = dateStr.split("-");
                  if (parts.length !== 3) return dateStr;
                  return `${parts[2]}/${parts[1]}/${parts[0]}`;
                };

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors duration-150 ${
                      item.lunas 
                        ? (isDark ? "bg-emerald-950/10 hover:bg-emerald-950/20 text-gray-400" : "bg-emerald-50/30 hover:bg-emerald-50/50 text-gray-500")
                        : isPastDue
                        ? (isDark ? "bg-red-950/25 hover:bg-red-950/40" : "bg-red-50/40 hover:bg-red-50/60")
                        : (isDark ? "hover:bg-gray-750/30" : "hover:bg-gray-50/50")
                    }`}
                  >
                    {/* HUTANG FIELDS */}
                    {/* Tgl */}
                    <td className="px-3 py-3 border text-center font-medium">{formatDate(item.tgl)}</td>
                    
                    {/* Atas Nama */}
                    <td className={`px-3 py-3 border font-black ${isDark ? "text-white" : "text-gray-900"}`}>{item.atasNama}</td>
                    
                    {/* Jumlah */}
                    <td className="px-3 py-3 border text-right font-bold text-sm">Rp {formatCurrency(item.jumlah)}</td>
                    
                    {/* Bunga % */}
                    <td className="px-3 py-3 border text-center font-bold text-amber-500">{item.bunga.toFixed(2)}%</td>
                    
                    {/* Keterangan */}
                    <td className="px-3 py-3 border text-center text-gray-400">{item.keterangan || "-"}</td>
                    
                    {/* Jatuh Tempo */}
                    <td className={`px-3 py-3 border text-center font-bold ${
                      isPastDue ? "text-red-500" : ""
                    }`}>
                      {formatDate(item.jatuhTempo)}
                      {isPastDue && <span className="block text-[8px] font-black uppercase text-red-500">EXPIRED</span>}
                    </td>
                    
                    {/* Ttl Bunga */}
                    <td className="px-3 py-3 border text-right font-semibold text-amber-600">Rp {formatCurrency(ttlBunga)}</td>

                    {/* Bunga Berjalan */}
                    <td className="px-3 py-3 border text-right">
                      <span className={`font-bold ${item.lunas ? "text-gray-400" : "text-yellow-500"}`}>
                        {item.lunas ? "-" : `Rp ${formatCurrency(Math.round(bungaBerjalan))}`}
                      </span>
                      {!item.lunas && (
                        <span className={`block text-[8px] mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {daysBerjalan}hr / {periodDays}hr
                        </span>
                      )}
                    </td>

                    {/* PIC */}
                    <td className="px-3 py-3 border font-medium text-emerald-500">{item.penanggungJawab || "-"}</td>

                    {/* JAMINAN */}
                    <td className="px-3 py-3 border font-semibold text-rose-500">{item.jaminanBerupa || "-"}</td>
                    <td className="px-3 py-3 border max-w-[140px] truncate text-gray-400" title={item.jaminanDetail}>
                      {item.jaminanDetail || "-"}
                    </td>

                    {/* PELUNASAN */}
                    <td className="px-3 py-3 border text-center">{formatDate(item.pelunasanTgl)}</td>
                    <td className="px-3 py-3 border text-right font-bold text-teal-600">
                      {item.pelunasanByrBunga ? `Rp ${formatCurrency(item.pelunasanByrBunga)}` : "-"}
                    </td>
                    
                    {/* Lunas Status Quick Action */}
                    <td className="px-3 py-3 border text-center">
                      <button
                        onClick={() => handleToggleLunas(item.id)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm transition-all ${
                          item.lunas
                            ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
                            : isPastDue
                            ? "bg-red-500 text-white border-red-650 hover:bg-red-600"
                            : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40 hover:bg-amber-200"
                        }`}
                        title="Klik untuk mengubah status pelunasan"
                      >
                        {item.lunas ? "LUNAS" : isPastDue ? "TEMPO" : "BELUM"}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-3 py-3 border text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className={`p-1.5 rounded-lg border hover:scale-105 transition-all ${
                            isDark ? "border-gray-600 text-amber-400 hover:bg-gray-700" : "border-gray-200 text-amber-600 hover:bg-gray-100"
                          }`}
                          title="Edit Catatan"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className={`p-1.5 rounded-lg border hover:scale-105 transition-all ${
                            isDark ? "border-gray-600 text-red-400 hover:bg-gray-700" : "border-gray-200 text-red-600 hover:bg-gray-100"
                          }`}
                          title="Hapus Catatan"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-sm font-semibold text-gray-500">
                    📭 Tidak ada data hutang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Footer Row */}
            <tfoot>
              <tr className={`font-black text-xs ${isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
                <td colSpan={2} className="px-3 py-4 border text-center font-extrabold uppercase">TOTAL</td>
                
                {/* Sum of debt amount */}
                <td className="px-3 py-4 border text-right text-sm">
                  Rp {formatCurrency(filteredData.reduce((sum, i) => sum + i.jumlah, 0))}
                </td>

                {/* Total TTL Bunga */}
                <td colSpan={3} className="px-3 py-4 border"></td>
                <td className="px-3 py-4 border text-right text-amber-600 font-black">
                  Rp {formatCurrency(Math.round(filteredData.reduce((sum, i) => sum + ((i.jumlah * i.bunga) / 100), 0)))}
                </td>
                {/* Total Bunga Berjalan */}
                <td className="px-3 py-4 border text-right text-yellow-500 font-black">
                  Rp {formatCurrency(Math.round(filteredData.reduce((sum, i) => sum + calcBungaBerjalan(i), 0)))}
                </td>

                {/* Guarantor / PIC column */}
                <td className="px-3 py-4 border text-center font-medium">
                  {new Set(filteredData.filter(i => i.penanggungJawab).map(i => i.penanggungJawab)).size} PIC
                </td>

                {/* Collaterals weight parsed */}
                <td className="px-3 py-4 border text-center text-rose-500">
                  {filteredData.reduce((sum, i) => sum + parseWeight(i.jaminanBerupa), 0).toFixed(2)} g
                </td>

                <td colSpan={2} className="px-3 py-4 border"></td>

                {/* Sum of paid amount + interest */}
                <td className="px-3 py-4 border text-right text-sm text-teal-600">
                  Rp {formatCurrency(filteredData.reduce((sum, i) => sum + (parseFloat(i.pelunasanByrBunga) || 0), 0))}
                </td>

                {/* Count of Lunas */}
                <td className="px-3 py-4 border text-center">
                  {filteredData.filter(i => i.lunas).length} / {filteredData.length} Lunas
                </td>
                
                <td className="px-3 py-4 border"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* CRUD Modal Form overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border transition-all ${
            isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
          }`}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-5">
              <h3 className="text-xl font-bold">
                {editingId ? "✏️ Edit Catatan Hutang" : "➕ Tambah Catatan Hutang"}
              </h3>
              <p className="text-emerald-100 text-xs mt-0.5">
                Isi form rincian hutang berikut dengan lengkap
              </p>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Tanggal Hutang */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Tanggal Hutang *
                  </label>
                  <input
                    type="date"
                    name="tgl"
                    required
                    value={formState.tgl}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm ${
                      isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                    }`}
                  />
                </div>

                {/* Atas Nama Debitur */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Atas Nama (Debitur) *
                  </label>
                  <input
                    type="text"
                    name="atasNama"
                    required
                    placeholder="Contoh: BSI IBUK"
                    value={formState.atasNama}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm ${
                      isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500"
                    }`}
                  />
                </div>

                {/* Jumlah Hutang */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Jumlah (Rp) *
                  </label>
                  <input
                    type="number"
                    name="jumlah"
                    required
                    placeholder="Contoh: 129300"
                    value={formState.jumlah}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm ${
                      isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500"
                    }`}
                  />
                </div>

                {/* Bunga % */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Bunga (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="bunga"
                    required
                    placeholder="Contoh: 1.01"
                    value={formState.bunga}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm ${
                      isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500"
                    }`}
                  />
                </div>

                {/* Keterangan Tempo (misal /15 hari) */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Keterangan (Periode Bunga)
                  </label>
                  <input
                    type="text"
                    name="keterangan"
                    placeholder="Contoh: /15 hari"
                    value={formState.keterangan}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm ${
                      isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500"
                    }`}
                  />
                </div>

                {/* Jatuh Tempo */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Jatuh Tempo *
                  </label>
                  <input
                    type="date"
                    name="jatuhTempo"
                    required
                    value={formState.jatuhTempo}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm ${
                      isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                    }`}
                  />
                </div>

                {/* Penanggung Jawab */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Penanggung Jawab (PIC)
                  </label>
                  <input
                    type="text"
                    name="penanggungJawab"
                    placeholder="Contoh: ARDI/SWJJR"
                    value={formState.penanggungJawab}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm ${
                      isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500"
                    }`}
                  />
                </div>

                {/* Jaminan Berupa */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Jaminan Berupa
                  </label>
                  <input
                    type="text"
                    name="jaminanBerupa"
                    placeholder="Contoh: C/24K/58.75g"
                    value={formState.jaminanBerupa}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-xl border text-sm ${
                      isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500"
                    }`}
                  />
                </div>
              </div>

              {/* Jaminan Detail */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Detail Jaminan
                </label>
                <textarea
                  name="jaminanDetail"
                  rows="2"
                  placeholder="Rincian kondisi fisik jaminan atau catatan penting tambahan..."
                  value={formState.jaminanDetail}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-xl border text-sm resize-none ${
                    isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500"
                  }`}
                />
              </div>

              {/* Status Lunas Toggle */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isDark ? "bg-gray-750 border-gray-700" : "bg-gray-50 border-gray-200"
              }`}>
                <div>
                  <h4 className="text-sm font-bold">Status Pelunasan</h4>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Apakah pinjaman ini telah lunas dibayar?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="lunas"
                    checked={formState.lunas}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* conditional Pelunasan Inputs */}
              {formState.lunas && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/5">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Tanggal Pelunasan
                    </label>
                    <input
                      type="date"
                      name="pelunasanTgl"
                      value={formState.pelunasanTgl}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-xl border text-sm ${
                        isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Total Dibayar (Bayar + Bunga)
                    </label>
                    <input
                      type="number"
                      name="pelunasanByrBunga"
                      placeholder={`Default: Rp ${formatCurrency(parseFloat(formState.jumlah) + (parseFloat(formState.jumlah) * parseFloat(formState.bunga) / 100) || 0)}`}
                      value={formState.pelunasanByrBunga}
                      onChange={handleInputChange}
                      className={`w-full p-3 rounded-xl border text-sm ${
                        isDark ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500" : "bg-white border-gray-200 text-gray-800 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/20 dark:border-gray-600/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                    isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md hover:scale-[1.01] transition-all"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

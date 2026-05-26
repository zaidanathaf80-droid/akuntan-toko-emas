import { useState, useEffect } from "react";
import { transactionAPI } from "../utils/api";

export default function AddTransaction({ onSave, theme }) {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});

  // T/KP specific states
  const [namaBarang, setNamaBarang] = useState("");
  const [namaSpesifik, setNamaSpesifik] = useState("");
  const [kadar, setKadar] = useState("");
  const [beratAwal, setBeratAwal] = useState("");
  const [beratTerima, setBeratTerima] = useState("");
  const [lantak, setLantak] = useState("");

  // T/LBR specific states
  const [lbrNamaBarang, setLbrNamaBarang] = useState("");
  const [lbrNamaSpesifik, setLbrNamaSpesifik] = useState("");
  const [lbrKadar, setLbrKadar] = useState("");
  const [lbrBeratAwal, setLbrBeratAwal] = useState("");
  const [lbrBeratTerima, setLbrBeratTerima] = useState("");
  const [lbrLantak, setLbrLantak] = useState("");
  const [lbrJenisProses, setLbrJenisProses] = useState(""); // DiLebur or KULLAK
  const [lbrJenisTransaksi, setLbrJenisTransaksi] = useState(""); // TRANSAKSI or Tambahan

  // T/PTG specific states
  const [ptgKategoriBarang, setPtgKategoriBarang] = useState("");
  const [ptgNamaSpesifik, setPtgNamaSpesifik] = useState("");
  const [ptgKadar, setPtgKadar] = useState("");
  const [ptgBerat, setPtgBerat] = useState("");
  const [ptgOngkos, setPtgOngkos] = useState("");
  const [ptgHargaPerGram, setPtgHargaPerGram] = useState("");
  const [ptgJenisTransaksi, setPtgJenisTransaksi] = useState("Transaksi"); // Transaksi or Retur

  // LAKU specific states
  const [lakuKategoriBarang, setLakuKategoriBarang] = useState("");
  const [lakuNamaSpesifik, setLakuNamaSpesifik] = useState("");
  const [lakuKadar, setLakuKadar] = useState("");
  const [lakuBerat, setLakuBerat] = useState("");
  const [lakuHargaPerGram, setLakuHargaPerGram] = useState("");
  const [lakuKodeBaki, setLakuKodeBaki] = useState("");
  const [lakuBarisKe, setLakuBarisKe] = useState("");
  // LAKU optional extra fields
  const [lakuPanjang, setLakuPanjang] = useState("");           // P = panjang (cm)
  const [lakuTi, setLakuTi] = useState(false);                  // Ti = bekas pesok diperbaiki
  const [lakuTiJumlah, setLakuTiJumlah] = useState("");         // Ti = jumlah titik pesok
  const [lakuPt, setLakuPt] = useState("");                     // Pt = jumlah patrian
  const [lakuSelisihTipe, setLakuSelisihTipe] = useState("");   // "T:C=" atau "C;T="
  const [lakuSelisihNilai, setLakuSelisihNilai] = useState(""); // nilai selisih berat

  // Auto-calculate Lantak for T/KP = Harga / Berat Terima / Kadar / 1000
  useEffect(() => {
    if (category === "T/KP" && amount && beratTerima && kadar) {
      const harga = parseInt(amount.replace(/\D/g, "")) || 0;
      const bt = parseFloat(beratTerima) || 0;
      const k = parseFloat(kadar) / 100;
      if (bt > 0 && k > 0) {
        const result = harga / bt / k / 1000;
        setLantak(Math.round(result).toLocaleString("id-ID"));
      } else {
        setLantak("");
      }
    } else {
      setLantak("");
    }
  }, [amount, beratTerima, kadar, category]);

  // Auto-calculate Lantak for T/LBR = Harga / Berat Terima / Kadar / 1000
  useEffect(() => {
    if (category === "T/LBR" && amount && lbrBeratTerima && lbrKadar) {
      const harga = parseInt(amount.replace(/\D/g, "")) || 0;
      const bt = parseFloat(lbrBeratTerima) || 0;
      const k = parseFloat(lbrKadar) / 100;
      if (bt > 0 && k > 0) {
        const result = harga / bt / k / 1000;
        setLbrLantak(Math.round(result).toLocaleString("id-ID"));
      } else {
        setLbrLantak("");
      }
    } else {
      setLbrLantak("");
    }
  }, [amount, lbrBeratTerima, lbrKadar, category]);

  // Auto-calculate Harga per Gram for T/PTG = Total Nominal (amount) / Berat Emas
  useEffect(() => {
    if (category === "T/PTG" && amount && ptgBerat) {
      const harga = parseInt(amount.replace(/\D/g, "")) || 0;
      const berat = parseFloat(ptgBerat) || 0;
      if (berat > 0) {
        const result = harga / berat;
        setPtgHargaPerGram(Math.round(result).toLocaleString("id-ID"));
      } else {
        setPtgHargaPerGram("");
      }
    } else {
      setPtgHargaPerGram("");
    }
  }, [amount, ptgBerat, category]);

  // Auto-calculate Harga per Gram for LAKU = Total Nominal (amount) / Berat Emas
  useEffect(() => {
    if (category === "LAKU" && amount && lakuBerat) {
      const harga = parseInt(amount.replace(/\D/g, "")) || 0;
      const berat = parseFloat(lakuBerat) || 0;
      if (berat > 0) {
        const result = harga / berat;
        setLakuHargaPerGram(Math.round(result).toLocaleString("id-ID"));
      } else {
        setLakuHargaPerGram("");
      }
    } else {
      setLakuHargaPerGram("");
    }
  }, [amount, lakuBerat, category]);

  const validateForm = () => {
    const newErrors = {};
    // Skip amount validation when T/LBR + Tambahan
    const isTambahanLBR = category === "T/LBR" && lbrJenisTransaksi === "Tambahan";
    if (!isTambahanLBR && (!amount || parseInt(amount.replace(/\D/g, "")) <= 0)) {
      newErrors.amount = "Masukkan jumlah yang valid (lebih dari 0)";
    }
    if (!category.trim()) {
      newErrors.category = "Pilih kategori";
    } else if (category === "DLL" && !customCategory.trim()) {
      newErrors.customCategory = "Masukkan kategori lainnya";
    }
    if (!date) {
      newErrors.date = "Pilih tanggal";
    }
    // T/KP validations
    if (category === "T/KP") {
      if (!namaBarang) newErrors.namaBarang = "Pilih nama barang";
      if (!kadar) newErrors.kadar = "Pilih kadar";
      if (!beratAwal || parseFloat(beratAwal) <= 0) newErrors.beratAwal = "Masukkan berat awal yang valid";
      if (!beratTerima || parseFloat(beratTerima) <= 0) newErrors.beratTerima = "Masukkan berat terima yang valid";
    }
    // T/LBR validations
    if (category === "T/LBR") {
      if (!lbrNamaBarang) newErrors.lbrNamaBarang = "Pilih nama barang";
      if (!lbrKadar || parseFloat(lbrKadar) <= 0 || parseFloat(lbrKadar) > 100) newErrors.lbrKadar = "Masukkan kadar yang valid (1-100%)";
      if (!lbrBeratAwal || parseFloat(lbrBeratAwal) <= 0) newErrors.lbrBeratAwal = "Masukkan berat awal yang valid";
      if (!lbrBeratTerima || parseFloat(lbrBeratTerima) <= 0) newErrors.lbrBeratTerima = "Masukkan berat terima yang valid";
      if (!lbrJenisProses) newErrors.lbrJenisProses = "Pilih jenis proses";
      if (!lbrJenisTransaksi) newErrors.lbrJenisTransaksi = "Pilih jenis transaksi";
    }
    // T/PTG validations
    if (category === "T/PTG") {
      if (!ptgKategoriBarang) newErrors.ptgKategoriBarang = "Pilih kategori barang";
      if (!ptgKadar) newErrors.ptgKadar = "Pilih kadar";
      if (!ptgBerat || parseFloat(ptgBerat) <= 0) newErrors.ptgBerat = "Masukkan berat emas yang valid (lebih dari 0)";
      if (!ptgOngkos || parseFloat(ptgOngkos) < 0) newErrors.ptgOngkos = "Masukkan ongkos yang valid";
    }
    // LAKU validations
    if (category === "LAKU") {
      if (!lakuKategoriBarang) newErrors.lakuKategoriBarang = "Pilih kategori barang";
      if (!lakuKadar) newErrors.lakuKadar = "Pilih kadar";
      if (!lakuBerat || parseFloat(lakuBerat) <= 0) newErrors.lakuBerat = "Masukkan berat emas yang valid (lebih dari 0)";
      if (!lakuKodeBaki) newErrors.lakuKodeBaki = "Pilih kode baki etalase";
      if (!lakuBarisKe || parseInt(lakuBarisKe) < 1) newErrors.lakuBarisKe = "Masukkan nomor baris yang valid";
      if (lakuKategoriBarang === "Kalung" && (!lakuPanjang || parseFloat(lakuPanjang) <= 0)) newErrors.lakuPanjang = "Panjang wajib diisi untuk Kalung";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCurrencyInput = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return numericValue ? parseInt(numericValue).toLocaleString("id-ID") : "";
  };

  const handleAmountChange = (e) => {
    const formatted = formatCurrencyInput(e.target.value);
    setAmount(formatted);
    if (errors.amount) {
      setErrors({ ...errors, amount: null });
    }
  };

  const resetTKPFields = () => {
    setNamaBarang("");
    setNamaSpesifik("");
    setKadar("");
    setBeratAwal("");
    setBeratTerima("");
    setLantak("");
  };

  const resetTLBRFields = () => {
    setLbrNamaBarang("");
    setLbrNamaSpesifik("");
    setLbrKadar("");
    setLbrBeratAwal("");
    setLbrBeratTerima("");
    setLbrLantak("");
    setLbrJenisProses("");
    setLbrJenisTransaksi("");
  };

  const resetPTGFields = () => {
    setPtgKategoriBarang("");
    setPtgNamaSpesifik("");
    setPtgKadar("");
    setPtgBerat("");
    setPtgOngkos("");
    setPtgHargaPerGram("");
    setPtgJenisTransaksi("Transaksi");
  };

  const resetLakuFields = () => {
    setLakuKategoriBarang("");
    setLakuNamaSpesifik("");
    setLakuKadar("");
    setLakuBerat("");
    setLakuHargaPerGram("");
    setLakuKodeBaki("");
    setLakuBarisKe("");
    setLakuPanjang("");
    setLakuTi(false);
    setLakuTiJumlah("");
    setLakuPt("");
    setLakuSelisihTipe("");
    setLakuSelisihNilai("");
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage("");

    try {
      const finalCategory = category === "DLL" ? customCategory.trim() : category.trim();

      const transaction = {
        type,
        amount: amount ? parseInt(amount.replace(/\D/g, "")) || 0 : 0,
        category: finalCategory,
        date: new Date(date).toISOString(),
        notes: notes.trim(),
      };

      // Add T/KP specific data
      if (category === "T/KP") {
        transaction.namaBarang = namaBarang;
        transaction.namaSpesifik = namaSpesifik.trim();
        transaction.kadar = parseFloat(kadar);
        transaction.beratAwal = parseFloat(beratAwal);
        transaction.beratTerima = parseFloat(beratTerima);
        const lantakKPRaw = lantak ? parseFloat(lantak.replace(/\./g, "").replace(/,/g, ".")) : null;
        transaction.lantak = isNaN(lantakKPRaw) ? null : lantakKPRaw;
      }

      // Add T/LBR specific data
      if (category === "T/LBR") {
        transaction.namaBarang = lbrNamaBarang;
        transaction.namaSpesifik = lbrNamaSpesifik.trim();
        transaction.kadar = parseFloat(lbrKadar);
        transaction.beratAwal = parseFloat(lbrBeratAwal);
        transaction.beratTerima = parseFloat(lbrBeratTerima);
        const lantakRaw = lbrLantak ? parseFloat(lbrLantak.replace(/\./g, "").replace(/,/g, ".")) : null;
        transaction.lantak = isNaN(lantakRaw) ? null : lantakRaw;
        transaction.jenisProses = lbrJenisProses;
        transaction.jenisTransaksi = lbrJenisTransaksi;
      }

      // Add T/PTG specific data
      if (category === "T/PTG") {
        transaction.namaBarang = ptgKategoriBarang;
        transaction.namaSpesifik = ptgNamaSpesifik.trim();
        transaction.kadar_karat = ptgKadar;
        transaction.berat = parseFloat(ptgBerat);
        transaction.ongkos = parseFloat(ptgOngkos) || 0;
        transaction.harga_per_gram = ptgHargaPerGram ? parseFloat(ptgHargaPerGram.replace(/\./g, "")) || 0 : 0;
        transaction.jenisTransaksi = ptgJenisTransaksi;
      }

      // Add LAKU specific data
      if (category === "LAKU") {
        transaction.namaBarang = lakuKategoriBarang;
        transaction.namaSpesifik = lakuNamaSpesifik.trim();
        transaction.kadar_karat = lakuKadar;
        transaction.berat = parseFloat(lakuBerat);
        transaction.harga_per_gram = lakuHargaPerGram ? parseFloat(lakuHargaPerGram.replace(/\./g, "")) || 0 : 0;
        transaction.kode_baki = lakuKodeBaki;
        transaction.baris_ke = parseInt(lakuBarisKe);
        // Optional extra fields
        if (lakuPanjang) transaction.laku_panjang = parseFloat(lakuPanjang);
        if (lakuTi) transaction.laku_ti = lakuTiJumlah ? parseInt(lakuTiJumlah) : true;
        if (lakuPt) transaction.laku_pt = parseInt(lakuPt);
        if (lakuSelisihTipe && lakuSelisihNilai) {
          transaction.laku_selisih = `${lakuSelisihTipe}${lakuSelisihNilai}`;
        }
      }

      // Kirim ke backend
      const response = await transactionAPI.create(transaction);
      console.log("Transaction saved:", response.data);

      // Update UI setelah berhasil
      onSave(response.data);
      setSuccessMessage("Transaksi berhasil ditambahkan!");
      setAmount("");
      setCategory("");
      setCustomCategory("");
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
      setType("expense");
      setErrors({});
      resetTKPFields();
      resetTLBRFields();
      resetPTGFields();
      resetLakuFields();
    } catch (error) {
      console.error("Error saving transaction:", error);
      setSuccessMessage(
        `Error: ${error.response?.data?.message || "Gagal menyimpan transaksi"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (errorKey) =>
    `w-full p-4 rounded-2xl border-2 transition-all duration-200 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-white"} ${
      errors[errorKey]
        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
        : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
    }`;

  const labelClass = `block text-sm font-semibold mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`;

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Tambah Transaksi
        </h1>
        <p
          className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          Catat pemasukan atau pengeluaran Anda
        </p>
      </div>

      <div
        className={`max-w-2xl mx-auto rounded-3xl p-8 shadow-sm ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}
      >
        {successMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl ${theme === "dark" ? "bg-gray-700 border border-gray-600" : "bg-green-50 border border-green-200"}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-green-600 text-xl">✓</span>
              <p
                className={`font-medium ${theme === "dark" ? "text-gray-300" : "text-green-800"}`}
              >
                {successMessage}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Type Toggle */}
          <div>
            <label className={labelClass}>
              Tipe Transaksi
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setType("income");
                  setCategory("");
                  setCustomCategory("");
                  resetTKPFields();
                  resetTLBRFields();
                  setErrors((prev) => ({ ...prev, category: null, customCategory: null }));
                }}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-200 ${
                  type === "income"
                    ? "bg-green-600 text-white shadow-lg transform scale-105"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                💰 Pemasukan
              </button>
              <button
                onClick={() => {
                  setType("expense");
                  setCategory("");
                  setCustomCategory("");
                  resetTKPFields();
                  resetTLBRFields();
                  setErrors((prev) => ({ ...prev, category: null, customCategory: null }));
                }}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-200 ${
                  type === "expense"
                    ? "bg-red-600 text-white shadow-lg transform scale-105"
                    : theme === "dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                💸 Pengeluaran
              </button>
            </div>
          </div>

          {/* Category Input */}
          <div>
            <label className={labelClass}>
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value !== "T/KP") resetTKPFields();
                if (e.target.value !== "T/LBR") resetTLBRFields();
                if (e.target.value !== "T/PTG") resetPTGFields();
                if (e.target.value !== "LAKU") resetLakuFields();
                if (errors.category) {
                  setErrors({ ...errors, category: null });
                }
              }}
              className={inputClass("category")}
              style={{ appearance: "none" }}
            >
              <option value="" disabled>Pilih Kategori</option>
              {type === "income" ? (
                <>
                  <option value="LAKU">LAKU</option>
                  <option value="TF">TF</option>
                  <option value="DLL">DLL</option>
                </>
              ) : (
                <>
                  <option value="T/KP">T/KP</option>
                  <option value="T/PTG">T/PTG</option>
                  <option value="T/LBR">T/LBR</option>
                  <option value="karyawan">karyawan</option>
                  <option value="Cuci">Cuci</option>
                  <option value="SRV">SRV</option>
                  <option value="uangMakan">uangMakan</option>
                  <option value="OPR">OPR</option>
                  <option value="Zakat">Zakat</option>
                  <option value="TF">TF</option>
                  <option value="DLL">DLL</option>
                </>
              )}
            </select>
            {errors.category && (
              <p className="mt-2 text-sm text-red-600">{errors.category}</p>
            )}

            {category === "DLL" && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Masukkan kategori lainnya..."
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    if (errors.customCategory) {
                      setErrors({ ...errors, customCategory: null });
                    }
                  }}
                  className={inputClass("customCategory")}
                />
                {errors.customCategory && (
                  <p className="mt-2 text-sm text-red-600">{errors.customCategory}</p>
                )}
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className={labelClass}>
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) {
                  setErrors({ ...errors, date: null });
                }
              }}
              className={inputClass("date")}
            />
            {errors.date && (
              <p className="mt-2 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* ============ T/KP SPECIFIC FIELDS ============ */}
          {category === "T/KP" && (
            <div
              className={`rounded-2xl p-6 space-y-5 border-2 ${
                theme === "dark"
                  ? "bg-gray-750 border-amber-500/30 bg-gradient-to-br from-gray-800 to-gray-700"
                  : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💍</span>
                <h3 className={`font-bold text-lg ${theme === "dark" ? "text-amber-400" : "text-amber-700"}`}>
                  Detail Barang T/KP
                </h3>
              </div>

              {/* Row 1: Nama Barang + Nama Spesifik (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Nama Barang
                  </label>
                  <select
                    value={namaBarang}
                    onChange={(e) => {
                      setNamaBarang(e.target.value);
                      if (errors.namaBarang) setErrors({ ...errors, namaBarang: null });
                    }}
                    className={inputClass("namaBarang")}
                    style={{ appearance: "none" }}
                  >
                    <option value="" disabled>Pilih Barang</option>
                    <option value="Cincin">Cincin</option>
                    <option value="Anting">Anting</option>
                    <option value="Liontin">Liontin</option>
                    <option value="Gelang">Gelang</option>
                    <option value="Kalung">Kalung</option>
                    <option value="Logam Mulia">Logam Mulia</option>
                  </select>
                  {errors.namaBarang && (
                    <p className="mt-2 text-sm text-red-600">{errors.namaBarang}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    Nama Spesifik <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Keterangan spesifik barang..."
                    value={namaSpesifik}
                    onChange={(e) => setNamaSpesifik(e.target.value)}
                    className={inputClass("")}
                  />
                </div>
              </div>

              {/* Row 2: Kadar */}
              <div>
                <label className={labelClass}>
                  Kadar
                </label>
                <select
                  value={kadar}
                  onChange={(e) => {
                    setKadar(e.target.value);
                    if (errors.kadar) setErrors({ ...errors, kadar: null });
                  }}
                  className={inputClass("kadar")}
                  style={{ appearance: "none" }}
                >
                  <option value="" disabled>Pilih Kadar</option>
                  <option value="35">35%</option>
                  <option value="39">39%</option>
                  <option value="68">68%</option>
                  <option value="100">100%</option>
                </select>
                {errors.kadar && (
                  <p className="mt-2 text-sm text-red-600">{errors.kadar}</p>
                )}
              </div>

              {/* Row 3: Berat Awal + Berat Terima (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Berat Awal <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(gram)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={beratAwal}
                    onChange={(e) => {
                      setBeratAwal(e.target.value);
                      if (errors.beratAwal) setErrors({ ...errors, beratAwal: null });
                    }}
                    className={inputClass("beratAwal")}
                  />
                  {errors.beratAwal && (
                    <p className="mt-2 text-sm text-red-600">{errors.beratAwal}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    Berat Terima <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(gram)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={beratTerima}
                    onChange={(e) => {
                      setBeratTerima(e.target.value);
                      if (errors.beratTerima) setErrors({ ...errors, beratTerima: null });
                    }}
                    className={inputClass("beratTerima")}
                  />
                  {errors.beratTerima && (
                    <p className="mt-2 text-sm text-red-600">{errors.beratTerima}</p>
                  )}
                </div>
              </div>

              {/* Harga inside T/KP */}
              <div>
                <label className={labelClass}>
                  Harga (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className={`w-full p-4 rounded-2xl border-2 text-xl font-bold transition-all duration-200 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""} ${
                    errors.amount
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Row 5: Lantak (auto-calculated) */}
              <div>
                <label className={labelClass}>
                  Lantak <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Harga ÷ Berat Terima ÷ Kadar ÷ 1000)</span>
                </label>
                <div
                  className={`w-full p-4 rounded-2xl border-2 font-bold text-lg ${
                    theme === "dark"
                      ? "bg-gray-600 border-gray-500 text-amber-400"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}
                >
                  {lantak ? `Rp ${lantak}` : "—"}
                </div>
                <p className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Dihitung otomatis: Harga ÷ Berat Terima ÷ Kadar ÷ 1000
                </p>
              </div>
            </div>
          )}

          {/* ============ T/LBR SPECIFIC FIELDS ============ */}
          {category === "T/LBR" && (
            <div
              className={`rounded-2xl p-6 space-y-5 border-2 ${
                theme === "dark"
                  ? "bg-gray-750 border-blue-500/30 bg-gradient-to-br from-gray-800 to-gray-700"
                  : "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔥</span>
                <h3 className={`font-bold text-lg ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}>
                  Detail Barang T/LBR
                </h3>
              </div>

              {/* Row 1: Nama Barang + Nama Spesifik (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Nama Barang
                  </label>
                  <select
                    value={lbrNamaBarang}
                    onChange={(e) => {
                      setLbrNamaBarang(e.target.value);
                      if (errors.lbrNamaBarang) setErrors({ ...errors, lbrNamaBarang: null });
                    }}
                    className={inputClass("lbrNamaBarang")}
                    style={{ appearance: "none" }}
                  >
                    <option value="" disabled>Pilih Barang</option>
                    <option value="Cincin">Cincin</option>
                    <option value="Anting">Anting</option>
                    <option value="Liontin">Liontin</option>
                    <option value="Gelang">Gelang</option>
                    <option value="Kalung">Kalung</option>
                    <option value="Logam Mulia">Logam Mulia</option>
                  </select>
                  {errors.lbrNamaBarang && (
                    <p className="mt-2 text-sm text-red-600">{errors.lbrNamaBarang}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    Nama Spesifik <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Keterangan spesifik barang..."
                    value={lbrNamaSpesifik}
                    onChange={(e) => setLbrNamaSpesifik(e.target.value)}
                    className={inputClass("")}
                  />
                </div>
              </div>

              {/* Row 2: Kadar (free-form percentage input) */}
              <div>
                <label className={labelClass}>
                  Kadar <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Masukkan persentase kadar..."
                    value={lbrKadar}
                    onChange={(e) => {
                      setLbrKadar(e.target.value);
                      if (errors.lbrKadar) setErrors({ ...errors, lbrKadar: null });
                    }}
                    className={inputClass("lbrKadar")}
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-bold ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>%</span>
                </div>
                {errors.lbrKadar && (
                  <p className="mt-2 text-sm text-red-600">{errors.lbrKadar}</p>
                )}
              </div>

              {/* Row 3: Berat Awal + Berat Terima (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Berat Awal <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(gram)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={lbrBeratAwal}
                    onChange={(e) => {
                      setLbrBeratAwal(e.target.value);
                      if (errors.lbrBeratAwal) setErrors({ ...errors, lbrBeratAwal: null });
                    }}
                    className={inputClass("lbrBeratAwal")}
                  />
                  {errors.lbrBeratAwal && (
                    <p className="mt-2 text-sm text-red-600">{errors.lbrBeratAwal}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>
                    Berat Terima <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(gram)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={lbrBeratTerima}
                    onChange={(e) => {
                      setLbrBeratTerima(e.target.value);
                      if (errors.lbrBeratTerima) setErrors({ ...errors, lbrBeratTerima: null });
                    }}
                    className={inputClass("lbrBeratTerima")}
                  />
                  {errors.lbrBeratTerima && (
                    <p className="mt-2 text-sm text-red-600">{errors.lbrBeratTerima}</p>
                  )}
                </div>
              </div>

              {/* Checklist Options - moved BEFORE Harga/Lantak so user selects type first */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Checklist 1: DiLebur / KULLAK */}
                <div>
                  <label className={labelClass}>
                    Jenis Proses
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLbrJenisProses("DiLebur");
                        if (errors.lbrJenisProses) setErrors({ ...errors, lbrJenisProses: null });
                      }}
                      className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border-2 ${
                        lbrJenisProses === "DiLebur"
                          ? theme === "dark"
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                            : "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {lbrJenisProses === "DiLebur" ? "✓ " : ""}DiLebur
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLbrJenisProses("KULLAK");
                        if (errors.lbrJenisProses) setErrors({ ...errors, lbrJenisProses: null });
                      }}
                      className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border-2 ${
                        lbrJenisProses === "KULLAK"
                          ? theme === "dark"
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                            : "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {lbrJenisProses === "KULLAK" ? "✓ " : ""}KULLAK
                    </button>
                  </div>
                  {errors.lbrJenisProses && (
                    <p className="mt-2 text-sm text-red-600">{errors.lbrJenisProses}</p>
                  )}
                </div>

                {/* Checklist 2: TRANSAKSI / Tambahan */}
                <div>
                  <label className={labelClass}>
                    Jenis Transaksi
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setLbrJenisTransaksi("TRANSAKSI");
                        if (errors.lbrJenisTransaksi) setErrors({ ...errors, lbrJenisTransaksi: null });
                      }}
                      className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border-2 ${
                        lbrJenisTransaksi === "TRANSAKSI"
                          ? theme === "dark"
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                            : "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {lbrJenisTransaksi === "TRANSAKSI" ? "✓ " : ""}TRANSAKSI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLbrJenisTransaksi("Tambahan");
                        // Clear Harga and Lantak when Tambahan is selected
                        setAmount("");
                        setLbrLantak("");
                        if (errors.lbrJenisTransaksi) setErrors({ ...errors, lbrJenisTransaksi: null });
                      }}
                      className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border-2 ${
                        lbrJenisTransaksi === "Tambahan"
                          ? theme === "dark"
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                            : "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {lbrJenisTransaksi === "Tambahan" ? "✓ " : ""}Tambahan
                    </button>
                  </div>
                  {errors.lbrJenisTransaksi && (
                    <p className="mt-2 text-sm text-red-600">{errors.lbrJenisTransaksi}</p>
                  )}
                </div>
              </div>

              {/* Harga & Lantak - HIDDEN when Jenis Transaksi is "Tambahan" */}
              {lbrJenisTransaksi !== "Tambahan" && (
                <>
                  {/* Harga inside T/LBR */}
                  <div>
                    <label className={labelClass}>
                      Harga (Rp)
                    </label>
                    <input
                      type="text"
                      placeholder="0"
                      value={amount}
                      onChange={handleAmountChange}
                      className={`w-full p-4 rounded-2xl border-2 text-xl font-bold transition-all duration-200 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""} ${
                        errors.amount
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                      }`}
                    />
                    {errors.amount && (
                      <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>

                  {/* Lantak (auto-calculated) */}
                  <div>
                    <label className={labelClass}>
                      Lantak <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Harga ÷ Berat Terima ÷ Kadar ÷ 1000)</span>
                    </label>
                    <div
                      className={`w-full p-4 rounded-2xl border-2 font-bold text-lg ${
                        theme === "dark"
                          ? "bg-gray-600 border-gray-500 text-blue-400"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                      }`}
                    >
                      {lbrLantak ? `Rp ${lbrLantak}` : "—"}
                    </div>
                    <p className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                      Dihitung otomatis: Harga ÷ Berat Terima ÷ Kadar ÷ 1000
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============ T/PTG SPECIFIC FIELDS ============ */}
          {category === "T/PTG" && (
            <div
              className={`rounded-2xl p-6 space-y-5 border-2 ${
                theme === "dark"
                  ? "bg-gray-750 border-purple-500/30 bg-gradient-to-br from-gray-800 to-gray-700"
                  : "border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⚡</span>
                <h3 className={`font-bold text-lg ${theme === "dark" ? "text-purple-400" : "text-purple-700"}`}>
                  Detail Barang T/PTG
                </h3>
              </div>

              {/* Row 1: Kategori Barang + Nama Spesifik (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Kategori Barang
                  </label>
                  <select
                    value={ptgKategoriBarang}
                    onChange={(e) => {
                      setPtgKategoriBarang(e.target.value);
                      if (errors.ptgKategoriBarang) setErrors({ ...errors, ptgKategoriBarang: null });
                    }}
                    className={inputClass("ptgKategoriBarang")}
                    style={{ appearance: "none" }}
                  >
                    <option value="" disabled>Pilih Kategori Barang</option>
                    <option value="Cincin">Cincin</option>
                    <option value="Anting">Anting</option>
                    <option value="Liontin">Liontin</option>
                    <option value="Gelang">Gelang</option>
                    <option value="Kalung">Kalung</option>
                  </select>
                  {errors.ptgKategoriBarang && (
                    <p className="mt-2 text-sm text-red-600">{errors.ptgKategoriBarang}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Nama Spesifik <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Keterangan spesifik barang..."
                    value={ptgNamaSpesifik}
                    onChange={(e) => setPtgNamaSpesifik(e.target.value)}
                    className={inputClass("")}
                  />
                </div>
              </div>

              {/* Row 1b: Jenis Transaksi */}
              <div>
                <label className={labelClass}>
                  Jenis Transaksi
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPtgJenisTransaksi("Transaksi")}
                    className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border-2 ${
                      ptgJenisTransaksi === "Transaksi"
                        ? theme === "dark"
                          ? "bg-purple-600 border-purple-500 text-white shadow-lg"
                          : "bg-purple-600 border-purple-600 text-white shadow-lg"
                        : theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {ptgJenisTransaksi === "Transaksi" ? "✓ " : ""}💎 Transaksi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPtgJenisTransaksi("Retur")}
                    className={`flex-1 py-3 px-4 rounded-2xl font-semibold text-sm transition-all duration-200 border-2 ${
                      ptgJenisTransaksi === "Retur"
                        ? theme === "dark"
                          ? "bg-red-600 border-red-500 text-white shadow-lg"
                          : "bg-red-600 border-red-600 text-white shadow-lg"
                        : theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {ptgJenisTransaksi === "Retur" ? "✓ " : ""}↩️ Retur
                  </button>
                </div>
                {ptgJenisTransaksi === "Retur" && (
                  <p className={`mt-2 text-xs font-medium ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}>
                    ⚠️ Data Retur tidak akan dihitung dalam Total Modal &amp; Total Berat pada Ringkasan.
                  </p>
                )}
              </div>

              {/* Row 2: Kadar + Berat Emas (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Kadar
                  </label>
                  <select
                    value={ptgKadar}
                    onChange={(e) => {
                      setPtgKadar(e.target.value);
                      if (errors.ptgKadar) setErrors({ ...errors, ptgKadar: null });
                    }}
                    className={inputClass("ptgKadar")}
                    style={{ appearance: "none" }}
                  >
                    <option value="" disabled>Pilih Kadar</option>
                    <option value="8K">8K</option>
                    <option value="9K">9K</option>
                    <option value="16K">16K</option>
                    <option value="24K">24K</option>
                  </select>
                  {errors.ptgKadar && (
                    <p className="mt-2 text-sm text-red-600">{errors.ptgKadar}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Berat Emas <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(gram)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={ptgBerat}
                    onChange={(e) => {
                      setPtgBerat(e.target.value);
                      if (errors.ptgBerat) setErrors({ ...errors, ptgBerat: null });
                    }}
                    className={inputClass("ptgBerat")}
                  />
                  {errors.ptgBerat && (
                    <p className="mt-2 text-sm text-red-600">{errors.ptgBerat}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Ongkos */}
              <div>
                <label className={labelClass}>
                  Ongkos (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={ptgOngkos ? parseInt(ptgOngkos).toLocaleString("id-ID") : ""}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    setPtgOngkos(cleaned);
                    if (errors.ptgOngkos) setErrors({ ...errors, ptgOngkos: null });
                  }}
                  className={inputClass("ptgOngkos")}
                />
                {errors.ptgOngkos && (
                  <p className="mt-2 text-sm text-red-600">{errors.ptgOngkos}</p>
                )}
              </div>

              {/* Row 3: Total Nominal (amount) */}
              <div>
                <label className={labelClass}>
                  Total Nominal (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className={`w-full p-4 rounded-2xl border-2 text-xl font-bold transition-all duration-200 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""} ${
                    errors.amount
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Row 4: Harga per Gram (read-only auto-calculated) */}
              <div>
                <label className={labelClass}>
                  Harga per Gram <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Total Nominal ÷ Berat Emas)</span>
                </label>
                <div
                  className={`w-full p-4 rounded-2xl border-2 font-bold text-lg ${
                    theme === "dark"
                      ? "bg-gray-600 border-gray-500 text-purple-400"
                      : "bg-purple-50 border-purple-200 text-purple-700"
                  }`}
                >
                  {ptgHargaPerGram ? `Rp ${ptgHargaPerGram}` : "—"}
                </div>
                <p className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Dihitung otomatis: Total Nominal ÷ Berat Emas (mencegah error pembagian dengan nol)
                </p>
              </div>
            </div>
          )}

          {/* ============ LAKU SPECIFIC FIELDS ============ */}
          {category === "LAKU" && (
            <div
              className={`rounded-2xl p-6 space-y-5 border-2 ${
                theme === "dark"
                  ? "bg-gray-750 border-emerald-500/30 bg-gradient-to-br from-gray-800 to-gray-700"
                  : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🛍️</span>
                <h3 className={`font-bold text-lg ${theme === "dark" ? "text-emerald-400" : "text-emerald-700"}`}>
                  Detail Barang LAKU
                </h3>
              </div>

              {/* Row 1: Kategori Barang + Nama Spesifik (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Kategori Barang
                  </label>
                  <select
                    value={lakuKategoriBarang}
                    onChange={(e) => {
                      setLakuKategoriBarang(e.target.value);
                      if (errors.lakuKategoriBarang) setErrors({ ...errors, lakuKategoriBarang: null });
                    }}
                    className={inputClass("lakuKategoriBarang")}
                    style={{ appearance: "none" }}
                  >
                    <option value="" disabled>Pilih Kategori Barang</option>
                    <option value="Cincin">Cincin</option>
                    <option value="Anting">Anting</option>
                    <option value="Liontin">Liontin</option>
                    <option value="Gelang">Gelang</option>
                    <option value="Kalung">Kalung</option>
                    <option value="Logam Mulia">Logam Mulia</option>
                  </select>
                  {errors.lakuKategoriBarang && (
                    <p className="mt-2 text-sm text-red-600">{errors.lakuKategoriBarang}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Nama Spesifik <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Keterangan spesifik barang..."
                    value={lakuNamaSpesifik}
                    onChange={(e) => setLakuNamaSpesifik(e.target.value)}
                    className={inputClass("")}
                  />
                </div>
              </div>

              {/* Row 2: Kadar + Berat Emas (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Kadar
                  </label>
                  <select
                    value={lakuKadar}
                    onChange={(e) => {
                      setLakuKadar(e.target.value);
                      if (errors.lakuKadar) setErrors({ ...errors, lakuKadar: null });
                    }}
                    className={inputClass("lakuKadar")}
                    style={{ appearance: "none" }}
                  >
                    <option value="" disabled>Pilih Kadar</option>
                    <option value="8K">8K</option>
                    <option value="9K">9K</option>
                    <option value="16K">16K</option>
                    <option value="24K">24K</option>
                  </select>
                  {errors.lakuKadar && (
                    <p className="mt-2 text-sm text-red-600">{errors.lakuKadar}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Berat Emas <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(gram)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={lakuBerat}
                    onChange={(e) => {
                      setLakuBerat(e.target.value);
                      if (errors.lakuBerat) setErrors({ ...errors, lakuBerat: null });
                    }}
                    className={inputClass("lakuBerat")}
                  />
                  {errors.lakuBerat && (
                    <p className="mt-2 text-sm text-red-600">{errors.lakuBerat}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Kode Baki Etalase + Baris ke (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Kode Baki Etalase
                  </label>
                  <select
                    value={lakuKodeBaki}
                    onChange={(e) => {
                      setLakuKodeBaki(e.target.value);
                      if (errors.lakuKodeBaki) setErrors({ ...errors, lakuKodeBaki: null });
                    }}
                    className={inputClass("lakuKodeBaki")}
                    style={{ appearance: "none" }}
                  >
                    <option value="" disabled>Pilih Kode Baki (A-Z)</option>
                    {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].map((letter) => (
                      <option key={letter} value={letter}>{letter}</option>
                    ))}
                  </select>
                  {errors.lakuKodeBaki && (
                    <p className="mt-2 text-sm text-red-600">{errors.lakuKodeBaki}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Baris ke
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ketik nomor baris..."
                    value={lakuBarisKe}
                    onChange={(e) => {
                      setLakuBarisKe(e.target.value);
                      if (errors.lakuBarisKe) setErrors({ ...errors, lakuBarisKe: null });
                    }}
                    className={inputClass("lakuBarisKe")}
                  />
                  {errors.lakuBarisKe && (
                    <p className="mt-2 text-sm text-red-600">{errors.lakuBarisKe}</p>
                  )}
                </div>
              </div>

              {/* Row 3b: Field Opsional Tambahan */}
              <div className={`rounded-xl p-4 border-2 border-dashed space-y-4 ${theme === "dark" ? "border-gray-600 bg-gray-800/40" : "border-emerald-200 bg-emerald-50/40"}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                  📋 Keterangan Opsional
                </p>

                {/* P (Panjang) + Pt (Patrian) + Ti sejajar 3 kolom */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>
                      P <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                        (Panjang, cm{lakuKategoriBarang === "Kalung" ? <span className="text-red-500 font-semibold"> — wajib</span> : ""})
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="0.0"
                        value={lakuPanjang}
                        onChange={(e) => {
                          setLakuPanjang(e.target.value);
                          if (errors.lakuPanjang) setErrors({ ...errors, lakuPanjang: null });
                        }}
                        className={inputClass("lakuPanjang")}
                      />
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>cm</span>
                    </div>
                    {errors.lakuPanjang && (
                      <p className="mt-2 text-sm text-red-600">{errors.lakuPanjang}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Pt <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Jumlah patrian)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={lakuPt}
                      onChange={(e) => setLakuPt(e.target.value)}
                      className={inputClass("")}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Ti <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Bekas pesok diperbaiki)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={lakuTiJumlah}
                      onChange={(e) => {
                        setLakuTiJumlah(e.target.value);
                        setLakuTi(e.target.value !== "" && parseInt(e.target.value) > 0);
                      }}
                      className={inputClass("")}
                    />
                  </div>
                </div>

                {/* Selisih Berat: T:C= atau C;T= */}
                <div>
                  <label className={labelClass}>
                    Selisih Berat <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Opsional)</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLakuSelisihTipe(lakuSelisihTipe === "T:C=" ? "" : "T:C=")}
                        className={`px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                          lakuSelisihTipe === "T:C="
                            ? "bg-orange-500 border-orange-500 text-white"
                            : theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-orange-400"
                              : "border-gray-200 bg-white text-gray-700 hover:border-orange-400"
                        }`}
                      >
                        T:C= <span className="font-normal text-xs">(berat lebih)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLakuSelisihTipe(lakuSelisihTipe === "C;T=" ? "" : "C;T=")}
                        className={`px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                          lakuSelisihTipe === "C;T="
                            ? "bg-blue-500 border-blue-500 text-white"
                            : theme === "dark"
                              ? "border-gray-600 bg-gray-700 text-gray-300 hover:border-blue-400"
                              : "border-gray-200 bg-white text-gray-700 hover:border-blue-400"
                        }`}
                      >
                        C;T= <span className="font-normal text-xs">(berat kurang)</span>
                      </button>
                    </div>
                    {lakuSelisihTipe && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00 g"
                        value={lakuSelisihNilai}
                        onChange={(e) => setLakuSelisihNilai(e.target.value)}
                        className={`flex-1 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                          theme === "dark"
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                            : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
                        }`}
                      />
                    )}
                  </div>
                  {lakuSelisihTipe && lakuSelisihNilai && (
                    <p className={`mt-1 text-xs font-semibold ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                      Preview: <span className="font-bold">{lakuSelisihTipe}{lakuSelisihNilai}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Row 4: Total Nominal (amount) */}
              <div>
                <label className={labelClass}>
                  Total Nominal (Rp)
                </label>
                <input
                  type="text"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className={`w-full p-4 rounded-2xl border-2 text-xl font-bold transition-all duration-200 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""} ${
                    errors.amount
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  }`}
                />
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* Row 5: Harga per Gram (read-only auto-calculated) */}
              <div>
                <label className={labelClass}>
                  Harga per Gram <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Total Nominal ÷ Berat Emas)</span>
                </label>
                <div
                  className={`w-full p-4 rounded-2xl border-2 font-bold text-lg ${
                    theme === "dark"
                      ? "bg-gray-600 border-gray-500 text-emerald-400"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  {lakuHargaPerGram ? `Rp ${lakuHargaPerGram}` : "—"}
                </div>
                <p className={`mt-2 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Dihitung otomatis: Total Nominal ÷ Berat Emas (mencegah error pembagian dengan nol)
                </p>
              </div>
            </div>
          )}

          {/* Amount / Jumlah Input - only shown when NOT T/KP, NOT T/LBR, NOT T/PTG, and NOT LAKU */}
          {category !== "T/KP" && category !== "T/LBR" && category !== "T/PTG" && category !== "LAKU" && (
            <div>
              <label className={labelClass}>
                Jumlah (Rp)
              </label>
              <input
                type="text"
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                className={`w-full p-4 rounded-2xl border-2 text-xl font-bold transition-all duration-200 ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : ""} ${
                  errors.amount
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                }`}
              />
              {errors.amount && (
                <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className={labelClass}>
              Catatan (Opsional)
            </label>
            <textarea
              placeholder="Tambah detail tambahan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 resize-none ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200"} focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100`}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </div>
            ) : (
              "Simpan Transaksi"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { transactionAPI, notaLakuAPI } from "../utils/api";

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
  const [lakuFoto, setLakuFoto] = useState(null);               // Upload foto barang
  const [lakuFotoPreview, setLakuFotoPreview] = useState(null); // Preview URL foto
  const [lakuNamaPelanggan, setLakuNamaPelanggan] = useState(""); // Tuan/Nyonya nama pelanggan

  // Nota state - menyimpan data nota setelah Simpan Transaksi
  const [notaData, setNotaData] = useState(null); // null = belum ada nota

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
    setLakuFoto(null);
    setLakuFotoPreview(null);
    setLakuNamaPelanggan("");
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

      // Generate nota jika LAKU
      if (category === "LAKU") {
        const totalHarga = parseInt(amount.replace(/\D/g, "")) || 0;
        const noNota = generateNoNota();
        const notaPayload = {
          no_nota: noNota,
          transaction_id: response.data?.id || null,
          nama_pelanggan: lakuNamaPelanggan.trim(),
          nama_barang: lakuKategoriBarang,
          nama_spesifik: lakuNamaSpesifik.trim(),
          kadar: lakuKadar,
          kode_baki: lakuKodeBaki,
          baris_ke: lakuBarisKe ? parseInt(lakuBarisKe) : null,
          berat: parseFloat(lakuBerat) || null,
          harga: totalHarga,
          harga_per_gram: lakuHargaPerGram || null,
          panjang: lakuPanjang ? parseFloat(lakuPanjang) : null,
          ti: lakuTiJumlah ? parseInt(lakuTiJumlah) : null,
          pt: lakuPt ? parseInt(lakuPt) : null,
          selisih: lakuSelisihTipe && lakuSelisihNilai ? `${lakuSelisihTipe}${lakuSelisihNilai}` : null,
          foto_base64: lakuFotoPreview || null,
          is_kokot: lakuKategoriBarang === "Kokot",
          tanggal: date,
        };

        // Save nota to DB (fire and forget - don't block UI)
        let savedNotaId = null;
        try {
          const notaRes = await notaLakuAPI.create(notaPayload);
          savedNotaId = notaRes.data?.id || null;
        } catch (notaErr) {
          console.warn("Nota save failed (non-critical):", notaErr);
        }

        setNotaData({
          id: savedNotaId,
          noNota,
          tanggal: date,
          namaPelanggan: lakuNamaPelanggan.trim(),
          namaBarang: lakuKategoriBarang,
          namaSpesifik: lakuNamaSpesifik.trim(),
          kadar: lakuKadar,
          kodeBaki: lakuKodeBaki,
          barisKe: lakuBarisKe,
          berat: parseFloat(lakuBerat),
          harga: totalHarga,
          hargaPerGram: lakuHargaPerGram,
          panjang: lakuPanjang,
          ti: lakuTiJumlah,
          pt: lakuPt,
          selisih: lakuSelisihTipe && lakuSelisihNilai ? `${lakuSelisihTipe}${lakuSelisihNilai}` : "",
          foto: lakuFotoPreview,
          isKokot: lakuKategoriBarang === "Kokot",
        });
      }

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

  // Helper: angka ke terbilang Indonesia
  const terbilang = (n) => {
    if (n === 0) return "nol";
    const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
      "sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas",
      "tujuh belas", "delapan belas", "sembilan belas"];
    const puluhan = ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh",
      "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"];
    const toWords = (num) => {
      if (num < 20) return satuan[num];
      if (num < 100) return puluhan[Math.floor(num / 10)] + (num % 10 ? " " + satuan[num % 10] : "");
      if (num < 1000) {
        const h = Math.floor(num / 100);
        return (h === 1 ? "seratus" : satuan[h] + " ratus") + (num % 100 ? " " + toWords(num % 100) : "");
      }
      if (num < 1000000) {
        const t = Math.floor(num / 1000);
        return (t === 1 ? "seribu" : toWords(t) + " ribu") + (num % 1000 ? " " + toWords(num % 1000) : "");
      }
      if (num < 1000000000) {
        const jt = Math.floor(num / 1000000);
        return toWords(jt) + " juta" + (num % 1000000 ? " " + toWords(num % 1000000) : "");
      }
      const m = Math.floor(num / 1000000000);
      return toWords(m) + " miliar" + (num % 1000000000 ? " " + toWords(num % 1000000000) : "");
    };
    const result = toWords(Math.abs(Math.round(n)));
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  // Helper: generate nomor nota auto (format: LP-YYYYMMDD-XXX)
  const generateNoNota = () => {
    const now = new Date();
    const ymd = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");
    const rand = String(Math.floor(Math.random() * 900) + 100);
    return `LP-${ymd}-${rand}`;
  };

  // Handle print nota
  const handlePrintNota = async () => {
    window.print();
    // Mark as printed in DB if we have an ID
    if (notaData?.id) {
      try {
        await notaLakuAPI.markPrinted(notaData.id);
      } catch (err) {
        console.warn("Failed to mark nota as printed:", err);
      }
    }
    // Reset nota setelah print
    setTimeout(() => setNotaData(null), 500);
  };

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
                    <option value="Kokot">Kokot</option>
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
                    <option value="Kokot">Kokot</option>
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
                    <option value="Kokot">Kokot</option>
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

              {/* Nama Pelanggan (Tuan/Nyonya) */}
              <div>
                <label className={labelClass}>
                  Tuan / Nyonya <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Nama Pelanggan)</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama pelanggan..."
                  value={lakuNamaPelanggan}
                  onChange={(e) => setLakuNamaPelanggan(e.target.value)}
                  className={inputClass("")}
                />
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
                    <option value="Kokot">Kokot</option>
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

                {/* Upload Foto Barang */}
                <div>
                  <label className={labelClass}>
                    📷 Foto Barang <span className={`font-normal text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>(Opsional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="laku-foto-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setLakuFoto(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setLakuFotoPreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {!lakuFotoPreview ? (
                    <button
                      type="button"
                      onClick={() => document.getElementById("laku-foto-input").click()}
                      className="flex items-center gap-3 px-6 py-3 rounded-full font-bold text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                      style={{ backgroundColor: "#22c55e" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Upload Foto
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {/* Preview image 831x415 ratio */}
                      <div
                        className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 shadow-md"
                        style={{ width: "100%", aspectRatio: "831/415" }}
                      >
                        <img
                          src={lakuFotoPreview}
                          alt="Preview foto barang"
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay remove button */}
                        <button
                          type="button"
                          onClick={() => {
                            setLakuFoto(null);
                            setLakuFotoPreview(null);
                            document.getElementById("laku-foto-input").value = "";
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm shadow-lg hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      {/* Ganti foto button */}
                      <button
                        type="button"
                        onClick={() => document.getElementById("laku-foto-input").click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-all duration-200 shadow hover:shadow-md hover:scale-105 active:scale-95"
                        style={{ backgroundColor: "#22c55e" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                        Ganti Foto
                      </button>
                    </div>
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

      {/* ============ PREVIEW NOTA LAKU ============ */}
      {notaData && (
        <div className={`max-w-2xl mx-auto mt-8 rounded-3xl shadow-xl overflow-hidden border-2 ${theme === "dark" ? "border-emerald-700 bg-gray-800" : "border-emerald-300 bg-white"}`}>
          {/* Header nota */}
          <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧾</span>
              <div>
                <p className="font-black text-lg">Preview Nota</p>
                <p className="text-emerald-200 text-xs">No. {notaData.noNota}</p>
              </div>
            </div>
            <button
              onClick={() => setNotaData(null)}
              className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center font-bold text-sm transition-colors"
            >✕</button>
          </div>

          {/* Nota body - print area */}
          <div id="nota-print-area" className="p-6 font-mono text-sm">
            {/* Kop Nota */}
            <div className="text-center border-b-2 border-gray-800 pb-3 mb-3">
              <p className="font-black text-xl tracking-widest">TOKO EMAS</p>
              <p className="font-black text-lg tracking-wider">PETRUK JOYO</p>
              <p className="text-xs text-gray-600">Jual beli & terima pesanan perhiasan emas</p>
              <p className="text-xs text-gray-600">Pasar Tumpang - Malang</p>
            </div>

            {/* Info nota */}
            <div className="flex justify-between text-xs mb-3">
              <div>
                <p><span className="font-bold">No.</span> {notaData.noNota}</p>
                <p><span className="font-bold">Tuan/Nyonya:</span> {notaData.namaPelanggan || "........................"}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Malang,</span> {new Date(notaData.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
              </div>
            </div>

            {/* Tabel barang */}
            <table className="w-full border-collapse border border-gray-800 text-xs mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-800 px-2 py-1 text-center w-6">No</th>
                  <th className="border border-gray-800 px-2 py-1 text-center" style={{ width: "30%" }}>Gambar</th>
                  <th className="border border-gray-800 px-2 py-1 text-left">Nama & Spesifikasi</th>
                  <th className="border border-gray-800 px-2 py-1 text-right">Berat</th>
                  <th className="border border-gray-800 px-2 py-1 text-right">Harga</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">1.</td>
                  {/* Foto barang - 831x415 ratio */}
                  <td className="border border-gray-800 px-1 py-1 align-top">
                    {notaData.foto ? (
                      <div style={{ width: "100%", aspectRatio: "831/415", overflow: "hidden" }}>
                        <img src={notaData.foto} alt="Foto barang" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center bg-gray-100 text-gray-400 text-xs"
                        style={{ width: "100%", aspectRatio: "831/415" }}
                      >
                        No Photo
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 align-top">
                    <p className="font-bold">{notaData.namaBarang}{notaData.namaSpesifik ? ` ${notaData.namaSpesifik}` : ""}</p>
                    {notaData.isKokot ? (
                      // Kokot: tampilan simpel
                      <div className="mt-1 space-y-0.5 text-xs">
                        <p>Kadar: {notaData.kadar}</p>
                        <p>KODE: {notaData.kodeBaki}{notaData.barisKe ? `,${notaData.barisKe}` : ""}</p>
                      </div>
                    ) : (
                      // Non-Kokot: tampilan lengkap
                      <div className="mt-1 space-y-0.5 text-xs">
                        <p>Kadar: {notaData.kadar}</p>
                        <p>KODE: {notaData.kodeBaki}{notaData.barisKe ? `,${notaData.barisKe}` : ""}</p>
                        <p>P: {notaData.panjang || "-"} &nbsp; Ti: {notaData.ti || "-"} &nbsp; Pt: {notaData.pt || "-"}</p>
                        {notaData.selisih && <p>{notaData.selisih.startsWith("T:C=") ? "T:C=" : "C;T="} {notaData.selisih.replace("T:C=", "").replace("C;T=", "")}</p>}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 text-right align-top">
                    {notaData.berat ? `${notaData.berat.toFixed(3)}` : "-"}
                  </td>
                  <td className="border border-gray-800 px-2 py-1 text-right align-top font-bold">
                    {notaData.harga ? notaData.harga.toLocaleString("id-ID") : "-"}
                  </td>
                </tr>
                {/* Baris kosong untuk barang ke-2 (dan ke-3 jika Kokot) */}
                <tr>
                  <td className="border border-gray-800 px-2 py-1 text-center align-top">2.</td>
                  <td className="border border-gray-800 px-1 py-1 align-top">
                    <div className="flex items-center justify-center bg-gray-50 text-gray-300 text-xs" style={{ width: "100%", aspectRatio: "831/415" }}>-</div>
                  </td>
                  <td className="border border-gray-800 px-2 py-1 align-top">
                    <p className="font-bold text-gray-400">-</p>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-400">
                      <p>Kadar: -</p>
                      <p>KODE: -,-</p>
                      {!notaData.isKokot && <p>P: - &nbsp; Ti: - &nbsp; Pt: -</p>}
                    </div>
                  </td>
                  <td className="border border-gray-800 px-2 py-1 text-right align-top text-gray-400">-</td>
                  <td className="border border-gray-800 px-2 py-1 text-right align-top text-gray-400">-</td>
                </tr>
                {/* Baris ke-3 hanya untuk Kokot */}
                {notaData.isKokot && (
                  <tr>
                    <td className="border border-gray-800 px-2 py-1 text-center align-top">3.</td>
                    <td className="border border-gray-800 px-1 py-1 align-top">
                      <div className="flex items-center justify-center bg-gray-50 text-gray-300 text-xs" style={{ width: "100%", aspectRatio: "831/415" }}>-</div>
                    </td>
                    <td className="border border-gray-800 px-2 py-1 align-top">
                      <p className="font-bold text-gray-400">Kokot: -</p>
                      <div className="mt-1 space-y-0.5 text-xs text-gray-400">
                        <p>Kadar: -</p>
                      </div>
                    </td>
                    <td className="border border-gray-800 px-2 py-1 text-right align-top text-gray-400">-</td>
                    <td className="border border-gray-800 px-2 py-1 text-right align-top text-gray-400">-</td>
                  </tr>
                )}
                {/* Total */}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="border border-gray-800 px-2 py-1 text-right font-bold">Σ Total</td>
                  <td className="border border-gray-800 px-2 py-1 text-right font-bold">{notaData.berat ? `${notaData.berat.toFixed(3)}` : "-"}</td>
                  <td className="border border-gray-800 px-2 py-1 text-right font-black text-emerald-700">
                    {notaData.harga ? notaData.harga.toLocaleString("id-ID") : "-"}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Terbilang */}
            <div className={`border border-gray-800 rounded px-3 py-2 mb-3 text-xs italic ${theme === "dark" ? "bg-gray-700" : "bg-yellow-50"}`}>
              <span className="font-bold not-italic">Terbilang: </span>
              "{notaData.harga ? terbilang(notaData.harga) + " rupiah" : "nol rupiah"}"
            </div>

            {/* Perhatian */}
            <div className="border border-gray-800 rounded px-3 py-2 text-xs">
              <p className="font-bold mb-1">PERHATIAN:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-gray-700">
                <li>Barang dijual kembali, surat harus dibawa</li>
                <li>Barang 1X Garansi 2 Hari, Dengan syarat: Tukar &amp; Tidak diRusak</li>
                <li>Nilai Tukar 10%-18%, Permata Soal Kesenangan</li>
                <li>Jika harga naik &amp; Sesuai dengan Taksiran Harga Emas Global maka Pelanggan Akan menerima Harga kenaikan</li>
              </ol>
            </div>
          </div>

          {/* Print Button */}
          <div className="px-6 pb-6">
            <button
              onClick={handlePrintNota}
              className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
              style={{ backgroundColor: "#16a34a" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print Nota
            </button>
            <p className={`text-center text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
              Setelah print, nota akan otomatis direset
            </p>
          </div>
        </div>
      )}

      {/* Print styles - hanya tampil saat print */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #nota-print-area, #nota-print-area * { visibility: visible; }
          #nota-print-area {
            position: fixed;
            left: 0; top: 0;
            width: 100%;
            padding: 10mm;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}

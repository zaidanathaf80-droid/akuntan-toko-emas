import { useState, useMemo } from "react";
import etalaseData from "../data/etalaseData";

export default function TotalBerat({ theme }) {
  // Load data from localStorage (same as Etalase page)
  const data = useMemo(() => {
    const saved = localStorage.getItem("lucky_etalase_data");
    return saved ? JSON.parse(saved) : etalaseData;
  }, []);

  // Calculate total weight per baki
  const bakiTotals = useMemo(() => {
    return data.map(baki => {
      const totalRaw = baki.baris.reduce((sum, row) => {
        return sum + row.berat.reduce((s, b) => s + b, 0);
      }, 0);

      // Determine multiplier and percent text based on category karat
      const cleanKategori = baki.kategori.replace(/\s+/g, '').toUpperCase();
      let multiplier = 1;
      let percentText = "-";
      if (cleanKategori.includes("8K")) {
        multiplier = 0.35;
        percentText = "35%";
      } else if (cleanKategori.includes("9K")) {
        multiplier = 0.39;
        percentText = "39%";
      } else if (cleanKategori.includes("16K")) {
        multiplier = 0.68;
        percentText = "68%";
      }

      const totalDividedNum = totalRaw / 1000;
      const calculatedResultNum = totalDividedNum * multiplier;

      return {
        kode: baki.kodeEtalase,
        kategori: baki.kategori,
        totalRaw,
        totalDivided: totalDividedNum.toFixed(3),
        percentText,
        multiplier,
        calculatedResult: calculatedResultNum.toFixed(3),
        jumlahItem: baki.baris.reduce((sum, row) => sum + row.berat.length, 0),
        jumlahBaris: baki.baris.length,
      };
    });
  }, [data]);

  // Grouped data calculation
  const groupedData = useMemo(() => {
    const groups = [
      {
        id: "group_1",
        name: "1 Cincin 16K (A,B,C)",
        emoji: "💍",
        color: "amber",
        borderColorDark: "border-amber-700/50",
        borderColorLight: "border-amber-200",
        textColorDark: "text-amber-400",
        textColorLight: "text-amber-700",
        bgColorDark: "bg-amber-950/20",
        bgColorLight: "bg-amber-50/50",
        badgeBgDark: "bg-amber-900/50 text-amber-400 border border-amber-700/50",
        badgeBgLight: "bg-amber-50 text-amber-700 border border-amber-200",
        subText: "Baki A, B, C • Kadar 68%",
        codes: ["A", "B", "C"],
        items: []
      },
      {
        id: "group_2",
        name: "2 Anting 16K (D)",
        emoji: "💛",
        color: "yellow",
        borderColorDark: "border-yellow-700/50",
        borderColorLight: "border-yellow-200",
        textColorDark: "text-yellow-400",
        textColorLight: "text-yellow-700",
        bgColorDark: "bg-yellow-950/20",
        bgColorLight: "bg-yellow-50/50",
        badgeBgDark: "bg-yellow-900/50 text-yellow-400 border border-yellow-700/50",
        badgeBgLight: "bg-yellow-50 text-yellow-700 border border-yellow-200",
        subText: "Baki D • Kadar 68%",
        codes: ["D"],
        items: []
      },
      {
        id: "group_3",
        name: "3 Kalung 16K (E,F,G)",
        emoji: "📿",
        color: "rose",
        borderColorDark: "border-rose-700/50",
        borderColorLight: "border-rose-200",
        textColorDark: "text-rose-400",
        textColorLight: "text-rose-700",
        bgColorDark: "bg-rose-950/20",
        bgColorLight: "bg-rose-50/50",
        badgeBgDark: "bg-rose-900/50 text-rose-400 border border-rose-700/50",
        badgeBgLight: "bg-rose-50 text-rose-700 border border-rose-200",
        subText: "Baki E, F, G • Kadar 68%",
        codes: ["E", "F", "G"],
        items: []
      },
      {
        id: "group_4",
        name: "4 Gelang 16K (H)",
        emoji: "⛓️",
        color: "orange",
        borderColorDark: "border-orange-700/50",
        borderColorLight: "border-orange-200",
        textColorDark: "text-orange-400",
        textColorLight: "text-orange-700",
        bgColorDark: "bg-orange-950/20",
        bgColorLight: "bg-orange-50/50",
        badgeBgDark: "bg-orange-900/50 text-orange-400 border border-orange-700/50",
        badgeBgLight: "bg-orange-50 text-orange-700 border border-orange-200",
        subText: "Baki H • Kadar 68%",
        codes: ["H"],
        items: []
      },
      {
        id: "group_5",
        name: "5 Gelang 16K (I)",
        emoji: "⛓️",
        color: "amber",
        borderColorDark: "border-amber-600/50",
        borderColorLight: "border-amber-300",
        textColorDark: "text-amber-300",
        textColorLight: "text-amber-800",
        bgColorDark: "bg-amber-900/20",
        bgColorLight: "bg-amber-100/50",
        badgeBgDark: "bg-amber-800/50 text-amber-300 border border-amber-600/50",
        badgeBgLight: "bg-amber-100 text-amber-800 border border-amber-300",
        subText: "Baki I • Kadar 68%",
        codes: ["I"],
        items: []
      },
      {
        id: "group_6",
        name: "6 Kalung 9K (J,K)",
        emoji: "💎",
        color: "indigo",
        borderColorDark: "border-indigo-700/50",
        borderColorLight: "border-indigo-200",
        textColorDark: "text-indigo-400",
        textColorLight: "text-indigo-700",
        bgColorDark: "bg-indigo-950/20",
        bgColorLight: "bg-indigo-50/50",
        badgeBgDark: "bg-indigo-900/50 text-indigo-400 border border-indigo-700/50",
        badgeBgLight: "bg-indigo-50 text-indigo-700 border border-indigo-200",
        subText: "Baki J, K • Kadar 39%",
        codes: ["J", "K"],
        items: []
      },
      {
        id: "group_7",
        name: "7 Gelang R. 9K (L)",
        emoji: "🔗",
        color: "teal",
        borderColorDark: "border-teal-700/50",
        borderColorLight: "border-teal-200",
        textColorDark: "text-teal-400",
        textColorLight: "text-teal-700",
        bgColorDark: "bg-teal-950/20",
        bgColorLight: "bg-teal-50/50",
        badgeBgDark: "bg-teal-900/50 text-teal-400 border border-teal-700/50",
        badgeBgLight: "bg-teal-50 text-teal-700 border border-teal-200",
        subText: "Baki L • Kadar 39%",
        codes: ["L"],
        items: []
      },
      {
        id: "group_8",
        name: "8 Cincin 8K (M,N,O)",
        emoji: "💍",
        color: "sky",
        borderColorDark: "border-sky-700/50",
        borderColorLight: "border-sky-200",
        textColorDark: "text-sky-400",
        textColorLight: "text-sky-700",
        bgColorDark: "bg-sky-950/20",
        bgColorLight: "bg-sky-50/50",
        badgeBgDark: "bg-sky-900/50 text-sky-400 border border-sky-700/50",
        badgeBgLight: "bg-sky-50 text-sky-700 border border-sky-200",
        subText: "Baki M, N, O • Kadar 35%",
        codes: ["M", "N", "O"],
        items: []
      },
      {
        id: "group_5",
        name: "4 GELANG RANTAI 8K (P,Q)",
        emoji: "⛓️",
        color: "emerald",
        borderColorDark: "border-emerald-700/50",
        borderColorLight: "border-emerald-200",
        textColorDark: "text-emerald-400",
        textColorLight: "text-emerald-700",
        bgColorDark: "bg-emerald-950/20",
        bgColorLight: "bg-emerald-50/50",
        badgeBgDark: "bg-emerald-900/50 text-emerald-400 border border-emerald-700/50",
        badgeBgLight: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        subText: "Baki P, Q • Kadar 35%",
        codes: ["P", "Q"],
        items: []
      },
      {
        id: "group_6",
        name: "5 KALUNG 8K (S,T)",
        emoji: "📿",
        color: "purple",
        borderColorDark: "border-purple-700/50",
        borderColorLight: "border-purple-200",
        textColorDark: "text-purple-400",
        textColorLight: "text-purple-700",
        bgColorDark: "bg-purple-950/20",
        bgColorLight: "bg-purple-50/50",
        badgeBgDark: "bg-purple-900/50 text-purple-400 border border-purple-700/50",
        badgeBgLight: "bg-purple-50 text-purple-700 border border-purple-200",
        subText: "Baki S, T • Kadar 35%",
        codes: ["S", "T"],
        items: []
      },
      {
        id: "group_7",
        name: "6 GELANG OVAL (U,V,W)",
        emoji: "💫",
        color: "fuchsia",
        borderColorDark: "border-fuchsia-700/50",
        borderColorLight: "border-fuchsia-200",
        textColorDark: "text-fuchsia-400",
        textColorLight: "text-fuchsia-700",
        bgColorDark: "bg-fuchsia-950/20",
        bgColorLight: "bg-fuchsia-50/50",
        badgeBgDark: "bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-700/50",
        badgeBgLight: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200",
        subText: "Baki U, V, W • Kadar 35%",
        codes: ["U", "V", "W"],
        items: []
      },
      {
        id: "group_other",
        name: "TIDAK BERKELOMPOK (LAINNYA)",
        emoji: "📦",
        color: "gray",
        borderColorDark: "border-gray-700",
        borderColorLight: "border-gray-200",
        textColorDark: "text-gray-400",
        textColorLight: "text-gray-600",
        bgColorDark: "bg-gray-800/40",
        bgColorLight: "bg-gray-50/50",
        badgeBgDark: "bg-gray-800 text-gray-400 border border-gray-700",
        badgeBgLight: "bg-gray-100 text-gray-600 border border-gray-200",
        subText: "Baki D, H, I, L, R, X, Y, Z • Campuran Kadar",
        codes: ["D", "H", "I", "L", "R", "X", "Y", "Z"],
        items: []
      }
    ];

    // Populate items
    bakiTotals.forEach(baki => {
      let placed = false;
      for (let i = 0; i < groups.length - 1; i++) {
        if (groups[i].codes.includes(baki.kode)) {
          groups[i].items.push(baki);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groups[groups.length - 1].items.push(baki);
      }
    });

    // Calculate sub-totals for each group
    return groups.map(group => {
      const subTotalRaw = group.items.reduce((sum, item) => sum + item.totalRaw, 0);
      const subTotalDivided = subTotalRaw / 1000;
      const subTotalCalculated = group.items.reduce((sum, item) => sum + parseFloat(item.calculatedResult), 0);
      const subTotalItems = group.items.reduce((sum, item) => sum + item.jumlahItem, 0);
      const subTotalBaris = group.items.reduce((sum, item) => sum + item.jumlahBaris, 0);

      return {
        ...group,
        subTotalRaw,
        subTotalDivided: subTotalDivided.toFixed(3),
        subTotalCalculated: subTotalCalculated.toFixed(3),
        subTotalItems,
        subTotalBaris
      };
    });
  }, [bakiTotals]);

  // Grand total
  const grandTotalRaw = useMemo(() => {
    return bakiTotals.reduce((sum, b) => sum + b.totalRaw, 0);
  }, [bakiTotals]);

  const grandTotalDivided = (grandTotalRaw / 1000).toFixed(3);

  // Grand total calculated after multiplier
  const grandTotalCalculated = useMemo(() => {
    return bakiTotals.reduce((sum, b) => sum + parseFloat(b.calculatedResult), 0).toFixed(3);
  }, [bakiTotals]);

  const grandTotalItems = bakiTotals.reduce((sum, b) => sum + b.jumlahItem, 0);

  const scrollToGroup = (groupId) => {
    const element = document.getElementById(groupId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          ⚖️ Total Berat
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          Rekapitulasi total berat seluruh Baki A sampai Z (Dikelompokkan secara terstruktur)
        </p>
      </div>

      {/* Grand Total Card */}
      <div className="max-w-6xl mx-auto mb-8">
        <div
          className={`rounded-3xl shadow-lg overflow-hidden border ${
            theme === "dark"
              ? "bg-gradient-to-br from-emerald-900/40 to-gray-800 border-emerald-700/50"
              : "bg-gradient-to-br from-emerald-50 to-white border-emerald-200"
          }`}
        >
          <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                <span className="text-3xl">🏆</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 w-full">
                <div>
                  <p className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                    Grand Total (Hasil / 1000)
                  </p>
                  <h2 className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {Number(grandTotalDivided).toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                  </h2>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    {grandTotalRaw.toLocaleString("id-ID")} gram
                  </p>
                </div>
                <div className={`hidden sm:block w-px self-stretch ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`} />
                <div>
                  <p className={`text-sm font-bold uppercase tracking-wider ${theme === "dark" ? "text-amber-400" : "text-amber-600"}`}>
                    Grand Total (Setelah Kadar %)
                  </p>
                  <h2 className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {Number(grandTotalCalculated).toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                  </h2>
                  <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    Kombinasi Kadar 35%, 39%, & 68%
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-8 justify-end w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-emerald-700/20">
              <div className="text-center">
                <p className={`text-2xl font-black ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                  {bakiTotals.length}
                </p>
                <p className={`text-xs font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Baki
                </p>
              </div>
              <div className={`w-px ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`} />
              <div className="text-center">
                <p className={`text-2xl font-black ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                  {grandTotalItems.toLocaleString("id-ID")}
                </p>
                <p className={`text-xs font-semibold ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Total Item
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SINGLE UNIFIED TABLE (semua baki A-Z) ===== */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className={`rounded-3xl shadow-sm overflow-hidden border ${
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
          {/* Table Header */}
          <div className={`px-6 py-5 border-b flex items-center justify-between ${
            theme === "dark" ? "bg-gray-700/50 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}>
            <h2 className={`text-lg font-black flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              📋 Detail Semua Baki
            </h2>
            <span className={`px-3 py-1 rounded-xl text-xs font-black ${
              theme === "dark" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}>
              {grandTotalItems.toLocaleString("id-ID")} Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Baki</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Kategori</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Baris</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Item</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-right ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Total Berat</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-right ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Hasil / 1000</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-center ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Kadar</th>
                  <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-right ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>Hasil Akhir</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-100"}`}>
                {bakiTotals.map((baki) => {
                  const group = groupedData.find(g => g.codes.includes(baki.kode));
                  const isDark = theme === "dark";
                  return (
                    <tr
                      key={baki.kode}
                      className={`transition-colors duration-150 ${isDark ? "hover:bg-gray-750/30" : "hover:bg-gray-50/50"}`}
                    >
                      <td className="px-6 py-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                          group ? (isDark ? group.badgeBgDark : group.badgeBgLight) : (isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600")
                        }`}>
                          {baki.kode}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {baki.kategori}
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {baki.jumlahBaris}
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {baki.jumlahItem}
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-right ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        {baki.totalRaw.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-sm font-semibold ${
                          isDark ? "bg-gray-750 text-gray-400 border border-gray-700/50" : "bg-gray-50 text-gray-500 border border-gray-200"
                        }`}>
                          {Number(baki.totalDivided).toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black border ${
                          baki.percentText === "35%"
                            ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40"
                            : baki.percentText === "39%"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/40"
                            : baki.percentText === "68%"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                            : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                        }`}>
                          {baki.percentText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`inline-block px-3 py-1.5 rounded-xl text-sm font-black ${
                            isDark
                              ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700/40"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {Number(baki.calculatedResult).toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                          </span>
                          {baki.percentText !== "-" && (
                            <span className={`text-[10px] mt-0.5 font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                              {Number(baki.totalDivided).toLocaleString("id-ID", { minimumFractionDigits: 3 })} x {baki.percentText}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Grand Total Footer Row */}
              <tfoot>
                <tr className={`border-t-2 ${
                  theme === "dark" ? "bg-emerald-900/20 border-emerald-700/50" : "bg-emerald-50 border-emerald-200"
                }`}>
                  <td colSpan={2} className={`px-6 py-4 text-sm font-black ${
                    theme === "dark" ? "text-emerald-400" : "text-emerald-700"
                  }`}>
                    Grand Total Semua Baki
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {bakiTotals.reduce((s, b) => s + b.jumlahBaris, 0)}
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {grandTotalItems.toLocaleString("id-ID")}
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {grandTotalRaw.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-block px-3 py-1.5 rounded-xl text-sm font-bold ${
                      theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                    }`}>
                      {Number(grandTotalDivided).toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-semibold ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>-</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-block px-3 py-1.5 rounded-xl text-sm font-black bg-emerald-600 text-white border border-emerald-700">
                      {Number(grandTotalCalculated).toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ===== RINGKASAN KELOMPOK (dipindah ke bawah tabel) ===== */}
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          📊 Ringkasan Kelompok
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groupedData.filter(g => g.items.length > 0).map((group) => {
            const isDark = theme === "dark";
            const colorMap = {
              amber: isDark ? "from-amber-950/20 to-gray-800 border-amber-700/30 hover:border-amber-500/50" : "from-amber-50/50 to-white border-amber-200 hover:border-amber-400",
              yellow: isDark ? "from-yellow-950/20 to-gray-800 border-yellow-700/30 hover:border-yellow-500/50" : "from-yellow-50/50 to-white border-yellow-200 hover:border-yellow-400",
              rose: isDark ? "from-rose-950/20 to-gray-800 border-rose-700/30 hover:border-rose-500/50" : "from-rose-50/50 to-white border-rose-200 hover:border-rose-400",
              orange: isDark ? "from-orange-950/20 to-gray-800 border-orange-700/30 hover:border-orange-500/50" : "from-orange-50/50 to-white border-orange-200 hover:border-orange-400",
              indigo: isDark ? "from-indigo-950/20 to-gray-800 border-indigo-700/30 hover:border-indigo-500/50" : "from-indigo-50/50 to-white border-indigo-200 hover:border-indigo-400",
              teal: isDark ? "from-teal-950/20 to-gray-800 border-teal-700/30 hover:border-teal-500/50" : "from-teal-50/50 to-white border-teal-200 hover:border-teal-400",
              sky: isDark ? "from-sky-950/20 to-gray-800 border-sky-700/30 hover:border-sky-500/50" : "from-sky-50/50 to-white border-sky-200 hover:border-sky-400",
              emerald: isDark ? "from-emerald-950/20 to-gray-800 border-emerald-700/30 hover:border-emerald-500/50" : "from-emerald-50/50 to-white border-emerald-200 hover:border-emerald-400",
              pink: isDark ? "from-pink-950/20 to-gray-800 border-pink-700/30 hover:border-pink-500/50" : "from-pink-50/50 to-white border-pink-200 hover:border-pink-400",
              purple: isDark ? "from-purple-950/20 to-gray-800 border-purple-700/30 hover:border-purple-500/50" : "from-purple-50/50 to-white border-purple-200 hover:border-purple-400",
              fuchsia: isDark ? "from-fuchsia-950/20 to-gray-800 border-fuchsia-700/30 hover:border-fuchsia-500/50" : "from-fuchsia-50/50 to-white border-fuchsia-200 hover:border-fuchsia-400",
              cyan: isDark ? "from-cyan-950/20 to-gray-800 border-cyan-700/30 hover:border-cyan-500/50" : "from-cyan-50/50 to-white border-cyan-200 hover:border-cyan-400",
              lime: isDark ? "from-lime-950/20 to-gray-800 border-lime-700/30 hover:border-lime-500/50" : "from-lime-50/50 to-white border-lime-200 hover:border-lime-400",
              violet: isDark ? "from-violet-950/20 to-gray-800 border-violet-700/30 hover:border-violet-500/50" : "from-violet-50/50 to-white border-violet-200 hover:border-violet-400",
            };
            const colorClasses = colorMap[group.color] || (isDark ? "from-gray-800 to-gray-800/60 border-gray-700 hover:border-gray-500" : "from-gray-50 to-white border-gray-200 hover:border-gray-400");

            return (
              <div
                key={group.id}
                className={`p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${colorClasses}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-2xl">{group.emoji}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}>
                    {group.items.length} Baki
                  </span>
                </div>
                <h3 className={`text-sm font-bold truncate mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>
                  {group.name}
                </h3>
                <p className={`text-[10px] mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {group.subText}
                </p>
                <div className="grid grid-cols-2 gap-2 border-t pt-2.5 border-dashed border-gray-700/20 dark:border-gray-500/20">
                  <div>
                    <span className={`text-[9px] uppercase font-bold tracking-wide ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      Hasil/1000
                    </span>
                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {Number(group.subTotalDivided).toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                    </p>
                  </div>
                  <div>
                    <span className={`text-[9px] uppercase font-bold tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                      Akhir
                    </span>
                    <p className={`text-sm font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                      {Number(group.subTotalCalculated).toLocaleString("id-ID", { minimumFractionDigits: 3 })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

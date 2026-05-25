import React, { useState, useMemo, useEffect, useCallback } from "react";
import etalaseData from "../data/etalaseData";
import { lakuLockAPI } from "../utils/api";

export default function Etalase({ transactions = [], theme }) {
  const [searchBerat, setSearchBerat] = useState("");
  const [searchBaris, setSearchBaris] = useState("");
  const [activeGroupId, setActiveGroupId] = useState("group_1");

  const GROUPS = useMemo(() => [
    { id: "group_1",   name: "1  Cincin 16K (A,B,C)",    codes: ["A", "B", "C"] },
    { id: "group_2",   name: "2  Anting 16K (D)",         codes: ["D"] },
    { id: "group_3",   name: "3  Kalung 16K (E,F,G)",     codes: ["E", "F", "G"] },
    { id: "group_4",   name: "4  Gelang 16K (H)",         codes: ["H"] },
    { id: "group_5",   name: "5  Gelang 16K (I)",         codes: ["I"] },
    { id: "group_6",   name: "6  Kalung 9K (J,K)",        codes: ["J", "K"] },
    { id: "group_7",   name: "7  Gelang R. 9K (L)",       codes: ["L"] },
    { id: "group_8",   name: "8  Cincin 8K (M,N,O)",      codes: ["M", "N", "O"] },
    { id: "group_9",   name: "9  Gelang Rantai 8K (P,Q)", codes: ["P", "Q"] },
    { id: "group_10",  name: "10 Anting 8K (R)",          codes: ["R"] },
    { id: "group_11",  name: "11 Kalung 8K (S,T)",        codes: ["S", "T"] },
    { id: "group_12",  name: "12 Gelang Oval 8K (U,V,W)", codes: ["U", "V", "W"] },
    { id: "group_13",  name: "13 Liontin 8K (X)",         codes: ["X"] },
    { id: "group_14",  name: "14 Gelang Anak 8K (Y)",     codes: ["Y"] },
    { id: "group_15",  name: "15 Cincin Bayi 8K (Z)",     codes: ["Z"] },
  ], []);

  // Sidebar states
  const [showSidebar, setShowSidebar] = useState(false);
  const [showLockPopup, setShowLockPopup] = useState(false);

  const [checkedIds, setCheckedIds] = useState(() => {
    const saved = localStorage.getItem("lucky_checked_laku_ids");
    return saved ? JSON.parse(saved) : {};
  });

  const [lockedIds, setLockedIds] = useState(() => {
    const saved = localStorage.getItem("lucky_locked_laku_ids");
    return saved ? JSON.parse(saved) : {};
  });

  const [isLockingInProgress, setIsLockingInProgress] = useState(false);

  // Load locked IDs from backend on mount (source of truth — overrides localStorage)
  useEffect(() => {
    const fetchLockedIds = async () => {
      try {
        const response = await lakuLockAPI.getAll();
        const ids = response.data?.locked_ids || [];
        const lockedMap = {};
        ids.forEach(id => { lockedMap[String(id)] = true; });
        setLockedIds(lockedMap);
        localStorage.setItem("lucky_locked_laku_ids", JSON.stringify(lockedMap));
      } catch (error) {
        console.error("Error fetching locked laku IDs from backend:", error);
        // Fallback: keep localStorage values already loaded in initial state
      }
    };
    fetchLockedIds();
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("lucky_checked_laku_ids", JSON.stringify(checkedIds));
  }, [checkedIds]);

  useEffect(() => {
    localStorage.setItem("lucky_locked_laku_ids", JSON.stringify(lockedIds));
  }, [lockedIds]);

  // Listen to navigation toggle event
  useEffect(() => {
    const handleToggle = () => setShowSidebar(prev => !prev);
    window.addEventListener("toggle-etalase-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-etalase-sidebar", handleToggle);
  }, []);

  // Filter and group sold transactions (LAKU category)
  const lakuTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => t.category?.toLowerCase() === "laku" && t.type === "income");
  }, [transactions]);

  const groupedLakuTransactions = useMemo(() => {
    // Sort descending by transaction date (newest first)
    const sorted = [...lakuTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const groups = {};
    sorted.forEach(t => {
      const dateStr = t.date ? t.date.split("T")[0] : "Tanpa Tanggal";
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(t);
    });
    return groups;
  }, [lakuTransactions]);

  const newCheckedCount = useMemo(() => {
    return Object.keys(checkedIds).filter(id => checkedIds[id] && !lockedIds[id]).length;
  }, [checkedIds, lockedIds]);

  const hasNewChecks = newCheckedCount > 0;

  const handleLockChecked = async () => {
    const idsToLock = Object.keys(checkedIds)
      .filter(id => checkedIds[id] && !lockedIds[id])
      .map(id => Number(id));

    if (idsToLock.length === 0) return;

    setIsLockingInProgress(true);
    try {
      // Persist to backend — this is the permanent lock
      await lakuLockAPI.lockIds(idsToLock);

      // Update local state
      const newLocked = { ...lockedIds };
      idsToLock.forEach(id => { newLocked[String(id)] = true; });
      setLockedIds(newLocked);

      // Remove newly-locked IDs from checked state
      const newChecked = { ...checkedIds };
      idsToLock.forEach(id => { delete newChecked[String(id)]; });
      setCheckedIds(newChecked);
    } catch (error) {
      console.error("Failed to lock transactions in backend:", error);
      alert("Gagal menyimpan kunci ke server. Silakan coba lagi.");
    } finally {
      setIsLockingInProgress(false);
      setShowLockPopup(false);
    }
  };

  const formatHeaderDate = (dateStr) => {
    if (dateStr === "Tanpa Tanggal") return "Tanpa Tanggal";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Load and manage data with localStorage persistence
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("lucky_etalase_data");
    return saved ? JSON.parse(saved) : etalaseData;
  });

  const activeGroup = useMemo(() => {
    return GROUPS.find(g => g.id === activeGroupId) || GROUPS[0];
  }, [activeGroupId, GROUPS]);

  const activeBakiDataList = useMemo(() => {
    return activeGroup.codes.map(code => data.find(d => d.kodeEtalase === code)).filter(Boolean);
  }, [activeGroup, data]);

  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [tandaiMode, setTandaiMode] = useState(false);

  const [markedYellow, setMarkedYellow] = useState(() => {
    const saved = localStorage.getItem("lucky_etalase_marked_yellow");
    return saved ? JSON.parse(saved) : {};
  });

  const [markedBlue, setMarkedBlue] = useState(() => {
    const saved = localStorage.getItem("lucky_etalase_marked_blue");
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedItem, setSelectedItem] = useState(null); // { bakiKode, barisNo, index, value }
  const [editValue, setEditValue] = useState("");
  const [markBlueOnSave, setMarkBlueOnSave] = useState(false);

  // Sync markings to localStorage
  useEffect(() => {
    localStorage.setItem("lucky_etalase_marked_yellow", JSON.stringify(markedYellow));
  }, [markedYellow]);

  useEffect(() => {
    localStorage.setItem("lucky_etalase_marked_blue", JSON.stringify(markedBlue));
  }, [markedBlue]);

  // Multiple selection for deletion
  const [selectedForDelete, setSelectedForDelete] = useState([]); // Array of { barisNo, index, value }
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Toggle marked yellow state
  const toggleMarkedYellow = (baki, barisNo, index) => {
    const key = `${baki}-${barisNo}-${index}`;
    setMarkedYellow(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      return next;
    });
  };

  // Adjust markings index shifts
  const adjustMarkingsForInsert = (baki, barisNo, insertIdx) => {
    const adjustMap = (prev) => {
      const next = {};
      Object.keys(prev).forEach(key => {
        const parts = key.split("-");
        if (parts[0] === baki && parseInt(parts[1], 10) === barisNo) {
          const idx = parseInt(parts[2], 10);
          if (idx >= insertIdx) {
            next[`${baki}-${barisNo}-${idx + 1}`] = prev[key];
          } else {
            next[key] = prev[key];
          }
        } else {
          next[key] = prev[key];
        }
      });
      return next;
    };
    setMarkedYellow(adjustMap);
    setMarkedBlue(adjustMap);
  };

  const adjustMarkingsForDelete = (baki, barisNo, deleteIdx) => {
    const adjustMap = (prev) => {
      const next = {};
      Object.keys(prev).forEach(key => {
        const parts = key.split("-");
        if (parts[0] === baki && parseInt(parts[1], 10) === barisNo) {
          const idx = parseInt(parts[2], 10);
          if (idx === deleteIdx) {
            // deleted
          } else if (idx > deleteIdx) {
            next[`${baki}-${barisNo}-${idx - 1}`] = prev[key];
          } else {
            next[key] = prev[key];
          }
        } else {
          next[key] = prev[key];
        }
      });
      return next;
    };
    setMarkedYellow(adjustMap);
    setMarkedBlue(adjustMap);
  };

  const adjustMarkingsForBulkDelete = (baki, selectedForDeleteList) => {
    const adjustMap = (prev) => {
      let next = { ...prev };
      const byRow = {};
      selectedForDeleteList.forEach(item => {
        if (!byRow[item.barisNo]) {
          byRow[item.barisNo] = [];
        }
        byRow[item.barisNo].push(item.index);
      });

      Object.keys(byRow).forEach(rowNoStr => {
        const rowNo = parseInt(rowNoStr, 10);
        const deleteIndices = byRow[rowNo].sort((a, b) => b - a);
        
        deleteIndices.forEach(deleteIdx => {
          const temp = {};
          Object.keys(next).forEach(key => {
            const parts = key.split("-");
            if (parts[0] === baki && parseInt(parts[1], 10) === rowNo) {
              const idx = parseInt(parts[2], 10);
              if (idx === deleteIdx) {
                // deleted
              } else if (idx > deleteIdx) {
                temp[`${baki}-${rowNo}-${idx - 1}`] = next[key];
              } else {
                temp[key] = next[key];
              }
            } else {
              temp[key] = next[key];
            }
          });
          next = temp;
        });
      });
      return next;
    };
    setMarkedYellow(adjustMap);
    setMarkedBlue(adjustMap);
  };

  const adjustMarkingsForDrag = (sourceBaki, sourceRowNo, sourceIndex, targetBaki, targetRowNo, targetIndex, weightValue) => {
    const adjustMap = (prev) => {
      const isSourceMarked = !!prev[`${sourceBaki}-${sourceRowNo}-${sourceIndex}`];
      
      let temp = {};
      Object.keys(prev).forEach(key => {
        const parts = key.split("-");
        if (parts[0] === sourceBaki && parseInt(parts[1], 10) === sourceRowNo) {
          const idx = parseInt(parts[2], 10);
          if (idx === sourceIndex) {
            // deleted
          } else if (idx > sourceIndex) {
            temp[`${sourceBaki}-${sourceRowNo}-${idx - 1}`] = prev[key];
          } else {
            temp[key] = prev[key];
          }
        } else {
          temp[key] = prev[key];
        }
      });

      let finalTargetIndex = targetIndex;
      if (sourceBaki === targetBaki && sourceRowNo === targetRowNo) {
        const currentBaki = data.find(d => d.kodeEtalase === sourceBaki);
        const row = currentBaki?.baris.find(r => r.no === sourceRowNo);
        const rowLen = row ? row.berat.length : 0;
        const remainingLen = Math.max(0, rowLen - 1);
        
        if (targetIndex === -1) {
          finalTargetIndex = remainingLen;
        } else if (sourceIndex < targetIndex) {
          finalTargetIndex = targetIndex - 1;
        }
      } else {
        if (targetIndex === -1) {
          const currentBaki = data.find(d => d.kodeEtalase === targetBaki);
          const targetRow = currentBaki?.baris.find(r => r.no === targetRowNo);
          finalTargetIndex = targetRow ? targetRow.berat.length : 0;
        }
      }

      const next = {};
      Object.keys(temp).forEach(key => {
        const parts = key.split("-");
        if (parts[0] === targetBaki && parseInt(parts[1], 10) === targetRowNo) {
          const idx = parseInt(parts[2], 10);
          if (idx >= finalTargetIndex) {
            next[`${targetBaki}-${targetRowNo}-${idx + 1}`] = temp[key];
          } else {
            next[key] = temp[key];
          }
        } else {
          next[key] = temp[key];
        }
      });

      if (isSourceMarked) {
        next[`${targetBaki}-${targetRowNo}-${finalTargetIndex}`] = true;
      }
      return next;
    };

    setMarkedYellow(adjustMap);
    setMarkedBlue(adjustMap);
  };

  const handleOpenEditModal = (item) => {
    setSelectedItem(item);
    setEditValue(String(item.value));
    if (item.index !== -1 && !item.isInsert) {
      setMarkBlueOnSave(!!markedBlue[`${item.bakiKode}-${item.barisNo}-${item.index}`]);
    } else {
      setMarkBlueOnSave(false);
    }
  };

  // Drag states
  const [draggedWeight, setDraggedWeight] = useState(null); // { barisNo, index, value }
  const [dragOverRowNo, setDragOverRowNo] = useState(null);
  const [dragOverHandle, setDragOverHandle] = useState(null); // { rowNo, index }

  const [history, setHistory] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSession = () => {
    setHistory([]);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const saveData = (newData) => {
    setHistory(prev => [...prev, data]);
    setData(newData);
    localStorage.setItem("lucky_etalase_data", JSON.stringify(newData));
  };

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    setHistory(newHistory);
    setData(previousState);
    localStorage.setItem("lucky_etalase_data", JSON.stringify(previousState));
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === "z") {
        if (
          document.activeElement.tagName !== "INPUT" &&
          document.activeElement.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  // Save new/edited value
  const handleSave = () => {
    const numVal = parseInt(editValue, 10);
    if (isNaN(numVal) || numVal < 0) {
      alert("Masukkan angka berat yang valid");
      return;
    }

    let savedIndex = -1;

    const updatedData = data.map(baki => {
      if (baki.kodeEtalase !== selectedItem.bakiKode) return baki;
      return {
        ...baki,
        baris: baki.baris.map(row => {
          if (row.no !== selectedItem.barisNo) return row;
          
          let newBerat = [...row.berat];
          if (selectedItem.isInsert) {
            // Insert at the specified position
            newBerat.splice(selectedItem.index, 0, numVal);
            savedIndex = selectedItem.index;
          } else if (selectedItem.index === -1) {
            // Add new item at the end of the row
            newBerat.push(numVal);
            savedIndex = newBerat.length - 1;
          } else {
            // Update existing item
            newBerat[selectedItem.index] = numVal;
            savedIndex = selectedItem.index;
          }
          return { ...row, berat: newBerat };
        })
      };
    });

    // Handle index shifts for markings before saving the new blue mark
    if (selectedItem.isInsert) {
      adjustMarkingsForInsert(selectedItem.bakiKode, selectedItem.barisNo, selectedItem.index);
    }

    saveData(updatedData);

    // Save the blue marking
    if (savedIndex !== -1) {
      const key = `${selectedItem.bakiKode}-${selectedItem.barisNo}-${savedIndex}`;
      setMarkedBlue(prev => {
        const next = { ...prev };
        if (markBlueOnSave) {
          next[key] = true;
        } else {
          delete next[key];
        }
        return next;
      });
    }

    setSelectedItem(null);
  };

  // Delete a single item from the edit modal
  const handleDeleteSingle = () => {
    if (selectedItem.index === -1) return;

    const updatedData = data.map(baki => {
      if (baki.kodeEtalase !== selectedItem.bakiKode) return baki;
      return {
        ...baki,
        baris: baki.baris.map(row => {
          if (row.no !== selectedItem.barisNo) return row;
          
          let newBerat = [...row.berat];
          newBerat.splice(selectedItem.index, 1);
          return { ...row, berat: newBerat };
        })
      };
    });

    saveData(updatedData);
    
    // Adjust markings for deletion
    adjustMarkingsForDelete(selectedItem.bakiKode, selectedItem.barisNo, selectedItem.index);

    setSelectedItem(null);
  };

  // Toggle selection for deletion mode
  const toggleSelectItemForDelete = (bakiKode, barisNo, index, value) => {
    const exists = selectedForDelete.some(
      item => item.bakiKode === bakiKode && item.barisNo === barisNo && item.index === index
    );
    if (exists) {
      setSelectedForDelete(
        selectedForDelete.filter(
          item => !(item.bakiKode === bakiKode && item.barisNo === barisNo && item.index === index)
        )
      );
    } else {
      setSelectedForDelete([...selectedForDelete, { bakiKode, barisNo, index, value }]);
    }
  };

  // Drag and Drop weight item handlers
  const handleWeightDragStart = (e, bakiKode, barisNo, index, value) => {
    setDraggedWeight({ bakiKode, barisNo, index, value });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleWeightDragOver = (e, bakiKode, barisNo) => {
    e.preventDefault();
    if (draggedWeight && (draggedWeight.bakiKode !== bakiKode || draggedWeight.barisNo !== barisNo)) {
      setDragOverRowNo(`${bakiKode}-${barisNo}`);
    }
  };

  const handleWeightDrop = (e, bakiKode, targetRowNo, targetIndex = -1) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedWeight) return;

    const { bakiKode: sourceBakiKode, barisNo: sourceRowNo, index: sourceIndex, value: weightValue } = draggedWeight;

    // Adjust markings for drag-and-drop
    adjustMarkingsForDrag(sourceBakiKode, sourceRowNo, sourceIndex, bakiKode, targetRowNo, targetIndex, weightValue);

    const updatedData = data.map(baki => {
      // If it's both source and target (same baki)
      if (baki.kodeEtalase === sourceBakiKode && baki.kodeEtalase === bakiKode) {
        return {
          ...baki,
          baris: baki.baris.map(row => {
            if (row.no === sourceRowNo && row.no === targetRowNo) {
              const newBerat = [...row.berat];
              newBerat.splice(sourceIndex, 1);
              let insertIdx = targetIndex === -1 ? newBerat.length : targetIndex;
              if (targetIndex !== -1 && sourceIndex < targetIndex) {
                insertIdx = targetIndex - 1;
              }
              newBerat.splice(insertIdx, 0, weightValue);
              return { ...row, berat: newBerat };
            }
            if (row.no === sourceRowNo) {
              const newBerat = [...row.berat];
              newBerat.splice(sourceIndex, 1);
              return { ...row, berat: newBerat };
            }
            if (row.no === targetRowNo) {
              const newBerat = [...row.berat];
              const insertIdx = targetIndex === -1 ? newBerat.length : targetIndex;
              newBerat.splice(insertIdx, 0, weightValue);
              return { ...row, berat: newBerat };
            }
            return row;
          })
        };
      }

      // If it's only the source baki (remove item)
      if (baki.kodeEtalase === sourceBakiKode) {
        return {
          ...baki,
          baris: baki.baris.map(row => {
            if (row.no === sourceRowNo) {
              const newBerat = [...row.berat];
              newBerat.splice(sourceIndex, 1);
              return { ...row, berat: newBerat };
            }
            return row;
          })
        };
      }

      // If it's only the target baki (add item)
      if (baki.kodeEtalase === bakiKode) {
        return {
          ...baki,
          baris: baki.baris.map(row => {
            if (row.no === targetRowNo) {
              const newBerat = [...row.berat];
              const insertIdx = targetIndex === -1 ? newBerat.length : targetIndex;
              newBerat.splice(insertIdx, 0, weightValue);
              return { ...row, berat: newBerat };
            }
            return row;
          })
        };
      }

      return baki;
    });

    saveData(updatedData);
    setDraggedWeight(null);
    setDragOverRowNo(null);
  };

  // Highlight logic for search
  const isHighlighted = (beratVal, barisNo) => {
    if (!searchBerat) return false;
    
    if (searchBaris && String(barisNo) !== searchBaris) {
      return false;
    }

    const strBerat = String(beratVal);
    return strBerat.includes(searchBerat);
  };

  return (
    <div className="py-8 relative">
      {/* Main Content - shifts left when sidebar is open */}
      <div className={`transition-all duration-300 ease-in-out ${showSidebar ? "mr-[420px]" : ""}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1
          className={`text-4xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          Etalase
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          Pencarian data berat barang berdasarkan letak baki dan baris.
        </p>
      </div>

      {/* Edit Mode & Delete Mode & Drag Mode & Reset Controls */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-0">
        <div className="flex flex-wrap items-center gap-6">
          {/* Mode Edit */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={editMode}
              onChange={(e) => {
                setEditMode(e.target.checked);
                if (e.target.checked) {
                  setDeleteMode(false);
                  setDragMode(false);
                  setTandaiMode(false);
                  setSelectedForDelete([]);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-700 peer-checked:bg-emerald-500"></div>
            <span className={`ml-3 text-sm font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Mode Edit {editMode ? "🟢" : "⚫"}
            </span>
          </label>

          {/* Mode Hapus */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={deleteMode}
              onChange={(e) => {
                setDeleteMode(e.target.checked);
                if (e.target.checked) {
                  setEditMode(false);
                  setDragMode(false);
                  setTandaiMode(false);
                } else {
                  setSelectedForDelete([]);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-700 peer-checked:bg-rose-500"></div>
            <span className={`ml-3 text-sm font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Mode Hapus {deleteMode ? "🔴" : "⚫"}
            </span>
          </label>

          {/* Mode Drag */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={dragMode}
              onChange={(e) => {
                setDragMode(e.target.checked);
                if (e.target.checked) {
                  setEditMode(false);
                  setDeleteMode(false);
                  setTandaiMode(false);
                  setSelectedForDelete([]);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-700 peer-checked:bg-amber-500"></div>
            <span className={`ml-3 text-sm font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Mode Drag {dragMode ? "🟡" : "⚫"}
            </span>
          </label>

          {/* Mode Tandai */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tandaiMode}
              onChange={(e) => {
                setTandaiMode(e.target.checked);
                if (e.target.checked) {
                  setEditMode(false);
                  setDeleteMode(false);
                  setDragMode(false);
                  setSelectedForDelete([]);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-700 peer-checked:bg-yellow-500"></div>
            <span className={`ml-3 text-sm font-bold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Mode Tandai {tandaiMode ? "🟡" : "⚫"}
            </span>
          </label>

          {/* Reset Marks Button */}
          {(Object.keys(markedYellow).length > 0 || Object.keys(markedBlue).length > 0) && (
            <button
              onClick={() => {
                if (window.confirm("Hapus semua tanda (kuning & biru)?")) {
                  setMarkedYellow({});
                  setMarkedBlue({});
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm"
              title="Reset semua tanda warna kuning dan biru"
            >
              <span>🧹</span> Reset Tanda ({Object.keys(markedYellow).length + Object.keys(markedBlue).length})
            </button>
          )}

          {/* Bulk Trash Button */}
          {deleteMode && selectedForDelete.length > 0 && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 animate-pulse"
            >
              <span>🗑️</span> Hapus ({selectedForDelete.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {(history.length > 0 || saveSuccess) && (
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 flex items-center gap-1.5 shadow-sm"
                  title="Undo perubahan terakhir (Ctrl+Z)"
                >
                  <span>↩️</span> Undo ({history.length})
                </button>
              )}
              <button
                onClick={handleSaveSession}
                disabled={saveSuccess || history.length === 0}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm border ${
                  saveSuccess
                    ? "bg-emerald-600 text-white border-emerald-700 scale-105"
                    : history.length === 0
                    ? "opacity-50 cursor-not-allowed bg-emerald-500 text-white border-emerald-600"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600"
                }`}
                title="Simpan permanen perubahan sesi ini dan reset riwayat undo"
              >
                {saveSuccess ? (
                  <>
                    <span>✅</span> Tersimpan!
                  </>
                ) : (
                  <>
                    <span>💾</span> Simpan
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div
        className={`max-w-6xl mx-auto mb-8 rounded-3xl shadow-sm p-6 ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex flex-col md:flex-row items-end gap-6">
          {/* Filter Baki */}
          <div className="w-full md:w-1/4">
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Kategori Baki (Kelompok)
            </label>
            <select
              value={activeGroupId}
              onChange={(e) => {
                setActiveGroupId(e.target.value);
                setSelectedForDelete([]);
              }}
              className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                theme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                  : "bg-gray-50 border-gray-200 text-gray-800 focus:border-emerald-500"
              }`}
            >
              {GROUPS.map(g => (
                <option 
                  key={g.id} 
                  value={g.id}
                  className={theme === "dark" ? "bg-gray-800 text-white font-normal" : "bg-white text-gray-800 font-normal"}
                >
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Berat */}
          <div className="w-full md:w-2/4">
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Cari Berat (contoh: 1060)
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Masukkan angka berat..."
                value={searchBerat}
                onChange={(e) => setSearchBerat(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-900/20"
                    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                }`}
              />
            </div>
          </div>

          {/* Search Baris */}
          <div className="w-full md:w-1/4">
            <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Baris Ke-
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                🔢
              </span>
              <input
                type="text"
                placeholder="Semua Baris"
                value={searchBaris}
                onChange={(e) => setSearchBaris(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-900/20"
                    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Table Data */}
      <div className="max-w-6xl mx-auto space-y-6">
        {activeBakiDataList.length > 0 ? (
          activeBakiDataList.map((bakiData) => {
            // Determine emoji based on category or name
            let emoji = "💍";
            const cleanKategori = bakiData.kategori.replace(/\s+/g, '').toUpperCase();
            if (cleanKategori.includes("KALUNG")) {
              emoji = "📿";
            } else if (cleanKategori.includes("GELANG")) {
              emoji = "⛓️";
            } else if (cleanKategori.includes("ANTING")) {
              emoji = "💎";
            } else if (cleanKategori.includes("LIONTIN")) {
              emoji = "✨";
            }

            return (
              <div 
                key={bakiData.kodeEtalase}
                className={`rounded-3xl shadow-sm overflow-hidden border ${
                  theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                }`}
              >
                <div className={`px-6 py-5 border-b flex justify-between items-center ${
                  theme === "dark" ? "bg-gray-700/50 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    <span className="text-2xl">{emoji}</span> {bakiData.kategori}
                  </h2>
                  <span className={`px-3.5 py-1 rounded-xl text-sm font-black ${
                    theme === "dark" 
                      ? "bg-gray-900 text-emerald-400 border border-gray-700/50" 
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                  }`}>
                    Baki {bakiData.kodeEtalase}
                  </span>
                </div>
                <div className="p-6 overflow-x-auto">
                  <div className="min-w-max divide-y-2 divide-emerald-500/70 dark:divide-emerald-500/50">
                    {bakiData.baris.map((row) => {
                      const isDragOver = dragOverRowNo === `${bakiData.kodeEtalase}-${row.no}`;
                      return (
                        <div 
                          key={row.no} 
                          className={`flex items-center py-4 first:pt-0 last:pb-0 transition-all duration-200 ${
                            dragMode && isDragOver
                              ? "bg-emerald-500/10 dark:bg-emerald-500/5 border-l-4 border-l-emerald-500 pl-2"
                              : ""
                          }`}
                          onDragOver={(e) => {
                            if (dragMode) {
                              handleWeightDragOver(e, bakiData.kodeEtalase, row.no);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragMode) {
                              setDragOverRowNo(null);
                            }
                          }}
                          onDrop={(e) => {
                            if (dragMode) {
                              handleWeightDrop(e, bakiData.kodeEtalase, row.no);
                            }
                          }}
                        >
                          {/* Row Header */}
                          <div className={`w-48 shrink-0 font-bold px-4 py-2 border-r-2 ${theme === "dark" ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-700"}`}>
                            {row.nama}
                          </div>
                          
                          {/* Row Data */}
                          <div className={dragMode || editMode || tandaiMode ? "flex items-center gap-4 px-4 w-full flex-wrap" : "flex items-center gap-2 px-4 w-full flex-wrap"}>
                            {row.berat.map((b, idx) => {
                              const highlighted = isHighlighted(b, row.no);
                              const isSelected = selectedForDelete.some(
                                item => item.bakiKode === bakiData.kodeEtalase && item.barisNo === row.no && item.index === idx
                              );
                              const isCurrentlyDragged = draggedWeight && draggedWeight.bakiKode === bakiData.kodeEtalase && draggedWeight.barisNo === row.no && draggedWeight.index === idx;
                              const isLastRow = bakiData && row.no === bakiData.baris[bakiData.baris.length - 1].no;
                              const isMarkedY = !!markedYellow[`${bakiData.kodeEtalase}-${row.no}-${idx}`];
                              const isMarkedB = !!markedBlue[`${bakiData.kodeEtalase}-${row.no}-${idx}`];

                              const weightDiv = (
                                <div
                                  key={idx}
                                  draggable={dragMode}
                                  onDragStart={e => dragMode && handleWeightDragStart(e, bakiData.kodeEtalase, row.no, idx, b)}
                                  onDragEnd={() => dragMode && (setDraggedWeight(null), setDragOverRowNo(null), setDragOverHandle(null))}
                                  onDragOver={e => dragMode && (e.preventDefault(), e.stopPropagation())}
                                  onDrop={e => dragMode && handleWeightDrop(e, bakiData.kodeEtalase, row.no, idx)}
                                  onClick={() => {
                                    if (editMode) {
                                      handleOpenEditModal({ bakiKode: bakiData.kodeEtalase, barisNo: row.no, index: idx, value: b });
                                    } else if (deleteMode) {
                                      toggleSelectItemForDelete(bakiData.kodeEtalase, row.no, idx, b);
                                    } else if (tandaiMode) {
                                      toggleMarkedYellow(bakiData.kodeEtalase, row.no, idx);
                                    }
                                  }}
                                  className={`w-16 h-10 flex items-center justify-center font-bold text-sm rounded-lg border transition-all ${
                                    dragMode
                                      ? `cursor-grab active:cursor-grabbing hover:scale-105 ${isCurrentlyDragged ? "opacity-30 border-dashed border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/5" : highlighted ? "" : "border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/5"}`
                                      : editMode
                                      ? "cursor-pointer border-dashed border-emerald-500/60 hover:scale-105"
                                      : deleteMode
                                      ? "cursor-pointer border-rose-400 hover:scale-105"
                                      : tandaiMode
                                      ? "cursor-pointer border-yellow-400 hover:scale-105"
                                      : ""
                                  } ${
                                    isSelected
                                      ? "bg-red-900 text-white border-red-950 shadow-md shadow-red-900/30 transform scale-105 font-black"
                                      : highlighted && deleteMode
                                      ? "bg-purple-800 text-white border-purple-900 shadow-md shadow-purple-800/30 transform scale-105 font-black"
                                      : highlighted
                                      ? "bg-green-500 text-white border-green-600 shadow-md transform scale-105"
                                      : isMarkedB
                                      ? "bg-blue-500 text-white border-blue-600 shadow-md transform scale-105"
                                      : isMarkedY
                                      ? "bg-yellow-400 text-gray-900 border-yellow-500 shadow-md transform scale-105"
                                      : editMode
                                      ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                                      : deleteMode
                                      ? "bg-rose-500/5 text-rose-600 dark:text-rose-400"
                                      : tandaiMode
                                      ? "bg-amber-500/5 text-amber-600 dark:text-amber-400"
                                      : theme === "dark"
                                      ? "bg-gray-700 border-gray-600 text-gray-300"
                                      : "bg-white border-gray-200 text-gray-700"
                                  }`}
                                >
                                  {b}
                                </div>
                              );

                              const targetIndex = isLastRow ? idx + 1 : idx;
                              const isHandleDragOver = dragOverHandle && dragOverHandle.rowNo === row.no && dragOverHandle.index === targetIndex;

                              const handleBox = (
                                <div
                                  onDragOver={e => {
                                    if (dragMode) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }
                                  }}
                                  onDragEnter={e => {
                                    if (dragMode) {
                                      e.preventDefault();
                                      setDragOverHandle({ rowNo: row.no, index: targetIndex });
                                    }
                                  }}
                                  onDragLeave={() => {
                                    if (dragMode) {
                                      setDragOverHandle(null);
                                    }
                                  }}
                                  onDrop={e => {
                                    if (dragMode) {
                                      handleWeightDrop(e, bakiData.kodeEtalase, row.no, targetIndex);
                                      setDragOverHandle(null);
                                    }
                                  }}
                                  className={`w-4 h-4 rounded transition-all duration-200 ${
                                    isHandleDragOver
                                      ? "bg-amber-500 border border-amber-600 scale-125 shadow-md shadow-amber-500/50"
                                      : theme === "dark"
                                      ? "bg-gray-600 hover:bg-amber-500/40 border border-gray-500"
                                      : "bg-gray-300 hover:bg-amber-500/40 border border-gray-400"
                                  } mr-1`}
                                />
                              );

                              const editInsertBox = (
                                <button
                                  onClick={() => {
                                    handleOpenEditModal({
                                      bakiKode: bakiData.kodeEtalase,
                                      barisNo: row.no,
                                      index: targetIndex,
                                      value: "",
                                      isInsert: true
                                    });
                                  }}
                                  className={`w-10 h-10 flex items-center justify-center font-bold text-lg rounded-lg border-2 border-dashed transition-all duration-200 shrink-0 ${
                                    theme === "dark"
                                      ? "border-gray-600 text-gray-500 hover:border-emerald-500 hover:text-emerald-500 hover:bg-gray-700/50"
                                      : "border-gray-300 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-gray-100/50"
                                  }`}
                                  title={`Sisipkan berat di posisi ke-${targetIndex + 1}`}
                                >
                                  +
                                </button>
                              );

                              return (
                                <React.Fragment key={idx}>
                                  {dragMode && !isLastRow && handleBox}
                                  {editMode && !isLastRow && editInsertBox}
                                  {weightDiv}
                                  {dragMode && isLastRow && handleBox}
                                  {editMode && isLastRow && editInsertBox}
                                </React.Fragment>
                              );
                            })}

                            {/* Add button when in edit mode */}
                            {editMode && (
                              <button
                                onClick={() => {
                                  handleOpenEditModal({ bakiKode: bakiData.kodeEtalase, barisNo: row.no, index: -1, value: "" });
                                }}
                                className={`w-10 h-10 flex items-center justify-center font-bold text-xl rounded-lg border-2 border-dashed transition-all duration-200 ${
                                  theme === "dark"
                                    ? "border-gray-600 text-gray-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-gray-700"
                                    : "border-gray-300 text-gray-500 hover:border-emerald-500 hover:text-emerald-500 hover:bg-gray-50"
                                }`}
                                title="Tambah berat ke baris ini"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center border-2 border-dashed rounded-3xl dark:border-gray-700">
            <span className="text-4xl mb-4 block">📦</span>
            <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              Baki tidak ditemukan
            </h3>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Belum ada data untuk kode etalase (baki) ini.
            </p>
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          />
          
          {/* Modal Content */}
          <div className={`relative w-full max-w-md p-6 rounded-3xl shadow-xl transition-all border transform scale-100 ${
            theme === "dark" 
              ? "bg-gray-800 border-gray-700 text-white" 
              : "bg-white border-gray-200 text-gray-900"
          }`}>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              {selectedItem.index === -1 || selectedItem.isInsert ? "➕ Tambah Berat" : "✏️ Edit Berat"}
            </h3>
            
            <p className={`text-xs mb-4 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Baki {selectedItem.bakiKode} • {data.find(d => d.kodeEtalase === selectedItem.bakiKode)?.kategori} • Baris {selectedItem.barisNo}
            </p>
            
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Nilai Berat (Angka saja)
              </label>
              <input
                type="number"
                placeholder="Contoh: 1060"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 outline-none ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white focus:border-emerald-500"
                    : "bg-gray-50 border-gray-200 text-gray-800 focus:border-emerald-500"
                }`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setSelectedItem(null);
                }}
              />
            </div>
            
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {selectedItem.index !== -1 && !selectedItem.isInsert && (
                  <button
                    onClick={handleDeleteSingle}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-sm font-bold transition-all duration-200"
                  >
                    Hapus
                  </button>
                )}
                
                {/* Tandai Biru Button */}
                <button
                  type="button"
                  onClick={() => setMarkBlueOnSave(prev => !prev)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    markBlueOnSave
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                      : theme === "dark"
                      ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                  }`}
                >
                  <span>🔵</span> {markBlueOnSave ? "Ditandai Biru" : "Tandai Biru"}
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                    theme === "dark"
                      ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md transition-all duration-200"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          
          {/* Modal Content */}
          <div className={`relative w-full max-w-md p-6 rounded-3xl shadow-xl transition-all border transform scale-100 ${
            theme === "dark" 
              ? "bg-gray-800 border-gray-700 text-white" 
              : "bg-white border-gray-200 text-gray-900"
          }`}>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-rose-500">
              ⚠️ Konfirmasi Hapus Massal
            </h3>
            
            <p className="text-sm font-semibold mb-4 leading-relaxed">
              Apakah yakin akan menghapus data <span className="underline decoration-rose-500 decoration-2 font-black">"{selectedForDelete.map(item => item.value).join(", ")}"</span>?
            </p>

            <p className={`text-xs mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Tindakan ini akan menghapus {selectedForDelete.length} item secara permanen dari Baki pilihan di sesi lokal Anda.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${
                  theme === "dark"
                    ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  // Perform bulk delete
                  const updatedData = data.map(baki => {
                    const selectedForThisBaki = selectedForDelete.filter(item => item.bakiKode === baki.kodeEtalase);
                    if (selectedForThisBaki.length === 0) return baki;

                    return {
                      ...baki,
                      baris: baki.baris.map(row => {
                        const selectedIndicesForThisRow = selectedForThisBaki
                          .filter(item => item.barisNo === row.no)
                          .map(item => item.index);
                        
                        if (selectedIndicesForThisRow.length === 0) return row;
                        
                        const newBerat = row.berat.filter((_, idx) => !selectedIndicesForThisRow.includes(idx));
                        return { ...row, berat: newBerat };
                      })
                    };
                  });

                  // Adjust markings for bulk delete
                  const byBaki = {};
                  selectedForDelete.forEach(item => {
                    if (!byBaki[item.bakiKode]) {
                      byBaki[item.bakiKode] = [];
                    }
                    byBaki[item.bakiKode].push(item);
                  });
                  Object.keys(byBaki).forEach(bakiKode => {
                    adjustMarkingsForBulkDelete(bakiKode, byBaki[bakiKode]);
                  });

                  saveData(updatedData);
                  setSelectedForDelete([]);
                  setShowDeleteModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-md shadow-rose-500/10 transition-all duration-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      </div>{/* End Main Content wrapper */}

      {/* Sidebar Panel - Non-blocking side panel */}
      <div className={`fixed top-0 right-0 z-40 h-full w-[420px] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        showSidebar ? "translate-x-0" : "translate-x-full"
      } ${
        theme === "dark" ? "bg-gray-900 text-white border-l border-gray-700" : "bg-white text-gray-900 border-l border-gray-200"
      }`}>
        {/* Sidebar Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>📋</span> Data Terjual
            </h2>
            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Total {lakuTransactions.length} transaksi terjual (LAKU)
            </p>
          </div>
          <button
            onClick={() => setShowSidebar(false)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Sidebar Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {lakuTransactions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">💸</span>
              <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                Belum ada data terjual
              </h3>
              <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-450"}`}>
                Transaksi dengan kategori LAKU belum tercatat.
              </p>
            </div>
          ) : (
            Object.keys(groupedLakuTransactions).map(dateStr => {
              const txs = groupedLakuTransactions[dateStr];
              return (
                <div key={dateStr} className="mb-6">
                  {/* Date Divider / Header */}
                  <div className={`px-3 py-2 rounded-lg font-bold text-xs mb-3 flex items-center justify-between ${
                    theme === "dark" ? "bg-gray-800/80 text-emerald-400 border border-gray-750" : "bg-emerald-50 text-emerald-800 border border-emerald-100"
                  }`}>
                    <span>📅 {formatHeaderDate(dateStr)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-650 dark:text-emerald-300">
                      {txs.length} item
                    </span>
                  </div>
                  
                  {/* Table for this date */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                          <th className="py-2 pb-3 font-bold text-left">Baki</th>
                          <th className="py-2 pb-3 font-bold text-left">Baris</th>
                          <th className="py-2 pb-3 font-bold text-right">Berat</th>
                          <th className="py-2 pb-3 font-bold text-center w-12">Pilih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        {txs.map(t => {
                          const isLocked = !!lockedIds[t.id] || !!lockedIds[String(t.id)];
                          const isChecked = isLocked || !!checkedIds[t.id];
                          return (
                            <tr key={t.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 ${isLocked ? "opacity-75" : ""}`}>
                              <td className="py-3 font-black text-emerald-500 text-base">{t.kode_baki || "-"}</td>
                              <td className={`py-3 font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Baris {t.baris_ke || "-"}</td>
                              <td className="py-3 text-right font-bold">{t.berat ? `${t.berat} g` : "-"}</td>
                              <td className="py-3 text-center">
                                {isLocked ? (
                                  <div
                                    className="inline-flex items-center justify-center w-5 h-5 rounded"
                                    title="Terkunci permanen"
                                  >
                                    <span className="text-base leading-none select-none">🔒</span>
                                  </div>
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      setCheckedIds(prev => ({
                                        ...prev,
                                        [t.id]: e.target.checked
                                      }));
                                    }}
                                    className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                  />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        {lakuTransactions.length > 0 && (
          <div className={`p-6 border-t ${
            theme === "dark" ? "border-gray-800 bg-gray-900" : "border-gray-150 bg-gray-50"
          }`}>
            <button
              onClick={() => setShowLockPopup(true)}
              disabled={!hasNewChecks}
              className={`w-full py-3.5 rounded-2xl font-bold transition-all duration-200 shadow-md ${
                hasNewChecks
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 active:scale-98"
                  : "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              💾 Simpan Pilihan
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal to Lock Checkboxes */}
      {showLockPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className={`w-full max-w-md p-6 rounded-3xl shadow-xl transform transition-all ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-705 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-105 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <span className="text-3xl text-emerald-600 dark:text-emerald-400">🔒</span>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Kunci Pilihan Data Terjual?
              </h3>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-655'}`}>
                Apakah Anda yakin ingin menyimpan dan mengunci data terjual yang dipilih?
              </p>
              <p className={`mb-6 text-xs leading-relaxed ${theme === 'dark' ? 'text-amber-400 font-semibold' : 'text-amber-700 font-semibold'}`}>
                ⚠️ Tindakan ini akan mengunci {newCheckedCount} item terpilih. Data yang dikunci tidak akan bisa diubah atau dicentang kembali.
              </p>
              <div className="flex space-x-3 w-full">
                <button
                  onClick={() => setShowLockPopup(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Batal
                </button>
                <button
                  onClick={handleLockChecked}
                  disabled={isLockingInProgress}
                  className={`flex-1 py-3 rounded-xl font-bold transition-colors shadow-md shadow-emerald-500/10 ${
                    isLockingInProgress
                      ? "bg-emerald-300 text-white cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {isLockingInProgress ? "Menyimpan..." : "Ya, Kunci"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

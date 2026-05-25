// Validate transaction form
export function validateTransaction(data) {
  const errors = {};

  // Type validation
  if (!data.type || !["income", "expense"].includes(data.type)) {
    errors.type = 'Type harus "income" atau "expense"';
  }

  // Amount validation
  const amount = parseInt(data.amount, 10);
  if (isNaN(amount) || amount < 1 || amount > 999999999999) {
    errors.amount = "Jumlah harus 1-999.999.999.999";
  }

  // Category validation
  if (!data.category || data.category.trim().length === 0) {
    errors.category = "Kategori harus diisi";
  } else if (data.category.length > 50) {
    errors.category = "Kategori maksimal 50 karakter";
  }

  // Date validation
  if (!data.date) {
    errors.date = "Tanggal harus dipilih";
  } else if (new Date(data.date) > new Date()) {
    errors.date = "Tanggal tidak boleh lebih dari hari ini";
  }

  // Notes validation
  if (data.notes && data.notes.length > 500) {
    errors.notes = "Catatan maksimal 500 karakter";
  }

  return errors;
}

// Check if form has errors
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

// Format currency to Rp (Indonesian)
export function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date to readable Indonesian format
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format datetime with time
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Convert date input to ISO 8601
export function toISOString(dateValue) {
  return new Date(dateValue).toISOString();
}

// Parse form date input (YYYY-MM-DD) to ISO
export function formatDateForAPI(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

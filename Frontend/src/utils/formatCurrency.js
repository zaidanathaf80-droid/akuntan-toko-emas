/**
 * Format currency to Indonesian Rupiah format with thousand separators
 * @param {number} value - The amount to format
 * @returns {string} - Formatted currency string
 * Example: 60 -> "60", 1000 -> "1.000", 1000000 -> "1.000.000"
 */
export function formatCurrency(value) {
  if (!value && value !== 0) return "0";
  return Math.round(value).toLocaleString("id-ID");
}

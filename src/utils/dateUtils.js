/**
 * Global Date Formatting Utility
 * Formats dates for UI display as DD-MM-YYYY without altering API payload dates.
 */

export const formatDisplayDate = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
    const parts = dateVal.trim().split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

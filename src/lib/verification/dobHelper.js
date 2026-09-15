/**
 * Utilities for Date of Birth handling (DD/MM/YYYY).
 * Supports both manual text typing with auto-slashes and calendar picker selection.
 */

/**
 * Normalizes any common date format to strict DD/MM/YYYY.
 * Handles:
 * - YYYY-MM-DD (e.g. from <input type="date">) -> DD/MM/YYYY
 * - DD-MM-YYYY (with dashes) -> DD/MM/YYYY
 * - DDMMYYYY (continuous 8 digits) -> DD/MM/YYYY
 * - YYYYMMDD (continuous 8 digits) -> DD/MM/YYYY
 * - DD/MM/YYYY -> DD/MM/YYYY
 * 
 * @param {string} input 
 * @returns {string} Normalized DD/MM/YYYY or original if invalid
 */
export function normalizeDob(input) {
  if (!input) return "";
  const trimmed = String(input).trim();

  // 1. ISO format from date picker: YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, "0");
    const d = isoMatch[3].padStart(2, "0");
    return `${d}/${m}/${y}`;
  }

  // 2. Day-first with dashes or dots: DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, "0");
    const m = dmyMatch[2].padStart(2, "0");
    const y = dmyMatch[3];
    return `${d}/${m}/${y}`;
  }

  // 3. Raw 8 digits continuous
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 8) {
    const firstFour = parseInt(digits.slice(0, 4), 10);
    // If starts with reasonable year (e.g. 19xx or 20xx): YYYYMMDD
    if (firstFour >= 1900 && firstFour <= 2099) {
      const y = digits.slice(0, 4);
      const m = digits.slice(4, 6);
      const d = digits.slice(6, 8);
      return `${d}/${m}/${y}`;
    }
    // Else DDMMYYYY
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const y = digits.slice(4, 8);
    return `${d}/${m}/${y}`;
  }

  return trimmed;
}

/**
 * Real-time input formatter while user is typing in a text field.
 * Strips non-digits and automatically inserts slashes after Day and Month.
 * 
 * @param {string} value 
 * @returns {string} e.g. "12/02/2004"
 */
export function formatDobInput(value) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Converts DD/MM/YYYY to YYYY-MM-DD for native <input type="date"> value binding.
 * 
 * @param {string} ddMmYyyy 
 * @returns {string} YYYY-MM-DD or empty string
 */
export function dobToIso(ddMmYyyy) {
  if (!ddMmYyyy) return "";
  const match = String(ddMmYyyy).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, d, m, y] = match;
  return `${y}-${m}-${d}`;
}

/**
 * Validates whether string is a valid DD/MM/YYYY date and represents a real calendar date.
 * 
 * @param {string} dobStr 
 * @returns {boolean}
 */
export function isValidDob(dobStr) {
  if (!dobStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dobStr.trim())) {
    return false;
  }
  const [dStr, mStr, yStr] = dobStr.split("/");
  const day = parseInt(dStr, 10);
  const month = parseInt(mStr, 10);
  const year = parseInt(yStr, 10);

  if (year < 1920 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  return true;
}

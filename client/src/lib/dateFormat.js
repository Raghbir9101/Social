/**
 * Date and time formatting helpers.
 * All dates displayed in Indian format (DD/MM/YYYY) with Asia/Kolkata timezone.
 */

const IST_LOCALE = 'en-IN';
const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format date as DD/MM/YYYY.
 * @param {string|Date} date — Date to format
 * @returns {string} — Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString(IST_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: IST_TIMEZONE,
    });
  } catch {
    return '—';
  }
};

/**
 * Format date and time as DD/MM/YYYY, hh:mm:ss AM/PM.
 * @param {string|Date} date — Date to format
 * @returns {string} — Formatted date-time string
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  try {
    const d = new Date(date);
    const datePart = d.toLocaleDateString(IST_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: IST_TIMEZONE,
    });
    const timePart = d.toLocaleTimeString(IST_LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: IST_TIMEZONE,
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return '—';
  }
};

/**
 * Get relative time string (e.g., "2 hours ago").
 * @param {string|Date} date — Date to compute relative time for
 * @returns {string} — Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '—';
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  } catch {
    return '—';
  }
};

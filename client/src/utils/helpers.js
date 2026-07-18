/**
 * Formats a Date string or object into a human-readable date.
 * Example: July 18, 2026, 6:15 PM
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

/**
 * Truncates text to a specified length and appends ellipses if truncated.
 */
export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Standardizes API/Network error reporting.
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  // Axios response standard format
  if (error?.data?.message) {
    return error.data.message;
  }
  
  return error?.message || 'An unexpected error occurred.';
};

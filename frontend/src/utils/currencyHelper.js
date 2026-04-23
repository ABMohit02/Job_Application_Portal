/**
 * Utility to map currency codes to their respective symbols
 * @param {string} code - The currency code (e.g., 'USD', 'INR')
 * @returns {string} - The currency symbol (e.g., '$', '₹')
 */
export const getCurrencySymbol = (code) => {
  const symbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };
  return symbols[code] || '$';
};

const CONVERSION_RATE = 83; // 1 USD = 83 INR

/**
 * Formats a salary range with its original currency and its conversion
 * @param {Object} salary - The salary object { min, max, currency }
 * @returns {string} - Formatted string like "₹50000 - ₹100000 ($602 - $1205)"
 */
export const formatSalaryWithConversion = (salary) => {
  if (!salary || !salary.min || !salary.max) return '';

  const { min, max, currency } = salary;
  const symbol = getCurrencySymbol(currency);
  const originalStr = `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;

  let convertedStr = '';
  if (currency === 'INR') {
    const convMin = Math.round(min / CONVERSION_RATE);
    const convMax = Math.round(max / CONVERSION_RATE);
    convertedStr = ` ($${convMin.toLocaleString()} - $${convMax.toLocaleString()})`;
  } else if (currency === 'USD') {
    const convMin = Math.round(min * CONVERSION_RATE);
    const convMax = Math.round(max * CONVERSION_RATE);
    convertedStr = ` (₹${convMin.toLocaleString()} - ₹${convMax.toLocaleString()})`;
  } else {
    // For other currencies, convert to both USD and INR? 
    // Simplified: if not INR, show original and potentially conversion to INR if we had rates.
    // Let's just stick to the most common case requested.
  }

  return `${originalStr}${convertedStr}`;
};

export const currencies = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
];

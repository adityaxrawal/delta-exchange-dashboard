// src/hooks/useCurrencyFormat.js
import { useCurrency } from "../context/CurrencyContext";

/**
 * Hook to format currency values consistently across the application
 */
export const useCurrencyFormat = () => {
  const { formatCurrency, getCurrencySymbol, currency, convertValue } =
    useCurrency();

  /**
   * Format a value with currency symbol
   * @param {number} value - The value to format
   * @param {object} options - Formatting options
   * @returns {string} Formatted currency string
   */
  const format = (value, options = {}) => {
    return formatCurrency(value, options);
  };

  /**
   * Format with sign (+ for positive, - for negative)
   * @param {number} value - The value to format
   * @param {object} options - Formatting options
   * @returns {string} Formatted currency string with sign
   */
  const formatWithSign = (value, options = {}) => {
    const formatted = formatCurrency(Math.abs(value), options);
    if (value < 0) {
      return `-${formatted}`;
    } else if (value > 0) {
      return `+${formatted}`;
    }
    return formatted;
  };

  /**
   * Get just the symbol
   */
  const symbol = getCurrencySymbol();

  return {
    format,
    formatWithSign,
    symbol,
    currency,
    convertValue,
  };
};

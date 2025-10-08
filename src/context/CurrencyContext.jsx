// src/context/CurrencyContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

// Exchange rate: 1 USD = 85 INR
const USD_TO_INR = 85;

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load from localStorage or default to USD
    return localStorage.getItem("currency") || "USD";
  });

  useEffect(() => {
    // Save to localStorage whenever currency changes
    localStorage.setItem("currency", currency);
  }, [currency]);

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "USD" ? "INR" : "USD"));
  };

  const formatCurrency = (value, options = {}) => {
    if (value === null || value === undefined || isNaN(value)) {
      return currency === "USD" ? "$0.00" : "₹0.00";
    }

    const {
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
      showSymbol = true,
    } = options;

    // Convert to INR if needed
    const displayValue = currency === "INR" ? value * USD_TO_INR : value;
    const symbol = currency === "USD" ? "$" : "₹";

    const formatted = Math.abs(displayValue).toLocaleString(undefined, {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    if (showSymbol) {
      return value < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
    }

    return formatted;
  };

  const getCurrencySymbol = () => {
    return currency === "USD" ? "$" : "₹";
  };

  const convertValue = (value) => {
    if (currency === "INR") {
      return value * USD_TO_INR;
    }
    return value;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        toggleCurrency,
        formatCurrency,
        getCurrencySymbol,
        convertValue,
        exchangeRate: USD_TO_INR,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// src/components/CurrencyToggle.jsx
import React from "react";
import { useCurrency } from "../context/CurrencyContext";

const CurrencyToggle = () => {
  const { currency, toggleCurrency, exchangeRate } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleCurrency}
        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 bg-card hover:bg-card-hover transition-all group"
        title={`Switch to ${
          currency === "USD" ? "INR" : "USD"
        } (1 USD = ${exchangeRate} INR)`}
      >
        {/* Currency Icon */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-text-primary">
            {currency === "USD" ? "$" : "₹"}
          </span>
          <span className="text-xs font-semibold text-text-secondary uppercase">
            {currency}
          </span>
        </div>

        {/* Toggle Arrow */}
        <svg
          className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      </button>

      {/* Exchange Rate Info (optional tooltip) */}
      <div className="hidden md:block text-xs text-text-secondary">
        1 USD = {exchangeRate} INR
      </div>
    </div>
  );
};

export default CurrencyToggle;

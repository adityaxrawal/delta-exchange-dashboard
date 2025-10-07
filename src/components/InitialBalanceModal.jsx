// src/components/InitialBalanceModal.jsx
import React, { useState, useEffect } from "react";

const InitialBalanceModal = ({
  isVisible,
  onConfirm,
  onCancel,
  suggestedBalance,
}) => {
  const [balance, setBalance] = useState("785");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isVisible) {
      // Use suggested balance from Asset History if available
      const defaultBalance = suggestedBalance || 785;
      setBalance(defaultBalance.toString());
      setError("");
    }
  }, [isVisible, suggestedBalance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const numBalance = parseFloat(balance);

    if (isNaN(numBalance) || numBalance <= 0) {
      setError("Please enter a valid positive number");
      return;
    }

    onConfirm(numBalance);
  };

  const handleCancel = () => {
    setBalance("785");
    setError("");
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl border border-border/60 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Confirm Initial Wallet Balance
          </h2>
          <p className="text-sm text-text-secondary">
            {suggestedBalance
              ? "This balance was automatically extracted from your deposit history. You can adjust it if needed."
              : "Enter your wallet balance at the start of trading (in USD)"}
          </p>
          {suggestedBalance && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs text-green-600 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Auto-detected from Asset History
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="initial-balance"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Initial Balance ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg">
                $
              </span>
              <input
                id="initial-balance"
                type="text"
                value={balance}
                onChange={(e) => {
                  setBalance(e.target.value);
                  setError("");
                }}
                className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="785"
                autoFocus
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:bg-background hover:text-text-primary transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-semibold"
            >
              Confirm
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-border/40">
          <p className="text-xs text-text-secondary">
            💡 This value will be saved and used for calculating your wallet
            balance progression across all trades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InitialBalanceModal;

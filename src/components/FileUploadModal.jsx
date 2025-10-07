import React, { useState } from "react";

export default function FileUploadModal({ isVisible, onConfirm, onCancel }) {
  const [fillHistoryFile, setFillHistoryFile] = useState(null);
  const [assetHistoryFile, setAssetHistoryFile] = useState(null);

  const handleConfirm = () => {
    if (fillHistoryFile && assetHistoryFile) {
      onConfirm(fillHistoryFile, assetHistoryFile);
      // Reset state
      setFillHistoryFile(null);
      setAssetHistoryFile(null);
    }
  };

  const handleCancel = () => {
    setFillHistoryFile(null);
    setAssetHistoryFile(null);
    onCancel();
  };

  if (!isVisible) return null;

  const bothFilesSelected = fillHistoryFile && assetHistoryFile;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border/40 rounded-xl shadow-2xl max-w-lg w-full p-8 animate-scale-in">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Upload Trading Data Files
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          Please upload both files to ensure accurate balance calculations
        </p>

        <div className="space-y-6">
          {/* Fill History Upload */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              1. Fill History CSV
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) =>
                  setFillHistoryFile(e.target.files?.[0] || null)
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="fill-history-input"
              />
              <label
                htmlFor="fill-history-input"
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                  fillHistoryFile
                    ? "border-green-500 bg-green-500/10"
                    : "border-border hover:border-primary/50 bg-background/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {fillHistoryFile ? (
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  )}
                  <span
                    className={`text-sm ${
                      fillHistoryFile
                        ? "text-green-600 font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {fillHistoryFile ? fillHistoryFile.name : "Choose file..."}
                  </span>
                </div>
              </label>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Contains trade executions, prices, and quantities
            </p>
          </div>

          {/* Asset History Upload */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              2. Asset History CSV
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={(e) =>
                  setAssetHistoryFile(e.target.files?.[0] || null)
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="asset-history-input"
              />
              <label
                htmlFor="asset-history-input"
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
                  assetHistoryFile
                    ? "border-green-500 bg-green-500/10"
                    : "border-border hover:border-primary/50 bg-background/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {assetHistoryFile ? (
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  )}
                  <span
                    className={`text-sm ${
                      assetHistoryFile
                        ? "text-green-600 font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {assetHistoryFile
                      ? assetHistoryFile.name
                      : "Choose file..."}
                  </span>
                </div>
              </label>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Contains fees, funding payments, and realized PnL
            </p>
          </div>
        </div>

        {/* Info Box */}
        {bothFilesSelected && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
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
              <div>
                <p className="text-sm font-medium text-green-600">
                  Both files ready!
                </p>
                <p className="text-xs text-green-600/80 mt-1">
                  Click confirm to proceed with balance calculation
                </p>
              </div>
            </div>
          </div>
        )}

        {!bothFilesSelected && (
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-600">
                  Both files required
                </p>
                <p className="text-xs text-amber-600/80 mt-1">
                  Asset History is needed for accurate balance calculations
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border/40 text-text-secondary hover:bg-background/80 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!bothFilesSelected}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
              bothFilesSelected
                ? "bg-primary text-black font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
            }`}
          >
            Confirm & Continue
          </button>
        </div>

        <p className="text-xs text-text-secondary text-center mt-4">
          Download these files from Delta Exchange → Reports
        </p>
      </div>
    </div>
  );
}

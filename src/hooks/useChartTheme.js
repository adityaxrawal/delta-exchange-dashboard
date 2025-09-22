import { useTheme } from "../context/ThemeContext";

export function useChartTheme() {
  const { darkMode } = useTheme();

  return {
    backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
    textColor: darkMode ? "#9CA3AF" : "#6B7280",
    gridColor: darkMode ? "#374151" : "#E5E7EB",
    tooltipStyle: {
      backgroundColor: darkMode
        ? "rgba(17, 24, 39, 0.95)"
        : "rgba(255, 255, 255, 0.95)",
      border: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
      borderRadius: "6px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      color: darkMode ? "#E5E7EB" : "#374151",
    },
    // Common colors for charts
    colors: {
      profit: "#10B981", // green-500
      loss: "#EF4444", // red-500
      primary: "#3B82F6", // blue-500
      profitArea: darkMode
        ? "rgba(16, 185, 129, 0.2)"
        : "rgba(16, 185, 129, 0.1)",
      lossArea: darkMode ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)",
    },
  };
}

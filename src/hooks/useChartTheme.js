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
      profit: "#34D399", // green-400
      loss: "#F87171", // red-400
      primary: "#60A5FA", // blue-400
      profitArea: darkMode
        ? "rgba(52, 211, 153, 0.15)"
        : "rgba(52, 211, 153, 0.1)",
      lossArea: darkMode
        ? "rgba(248, 113, 113, 0.15)"
        : "rgba(248, 113, 113, 0.1)",
    },
  };
}

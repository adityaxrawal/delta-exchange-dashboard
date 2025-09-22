/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core background and surface colors
        background: "#0f172a",
        card: "#1e293b",
        "card-alt": "#293548",
        "card-hover": "#334155",
        border: "#334155",

        // Text colors
        text: {
          primary: "#e2e8f0",
          secondary: "#94a3b8",
          tertiary: "#64748b",
        },

        // Primary action colors
        primary: "#3b82f6",
        "primary-hover": "#2563eb",
        "primary-light": "#60a5fa",

        // Success/Error colors
        success: "#10b981",
        error: "#ef4444",

        // Chart colors
        chart: {
          grid: "#334155",
          line: "#3b82f6",
          area: "#3b82f6",
          bar: {
            positive: "#10b981",
            negative: "#ef4444",
          },
        },
      },
    },
  },
  plugins: [],
};

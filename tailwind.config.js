/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core background and surface colors
        background: "#282828",
        card: "#32302f",
        "card-alt": "#3c3836",
        "card-hover": "#504945",
        border: "#3c3836",
        "border-light": "#504945",

        // Text colors
        text: {
          primary: "#fbf1c7",
          secondary: "#ebdbb2",
          tertiary: "#a89984",
        },

        // Primary action colors
        primary: "#fabd2f",
        "primary-hover": "#d79921",
        "primary-light": "#fee386",

        // Accent colors
        accent: "#fabd2f",
        info: "#83a598",
        success: "#b8bb26",
        warning: "#fe8019",
        error: "#fb4934",
        purple: "#d3869b",
        aqua: "#8ec07c",

        // Chart colors
        chart: {
          grid: "#504945",
          line: "#83a598",
          area: "#83a598",
          bar: {
            positive: "#b8bb26",
            negative: "#fb4934",
          },
        },
      },
    },
  },
  plugins: [],
};

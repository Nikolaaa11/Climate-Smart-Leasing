/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"Helvetica Neue"',
          "system-ui",
          "sans-serif",
        ],
        text: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Helvetica Neue"',
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        ink: {
          900: "#0a0a0a",
          800: "#1d1d1f",
          700: "#2c2c2e",
          600: "#3a3a3c",
          500: "#48484a",
          400: "#636366",
          300: "#8e8e93",
          200: "#aeaeb2",
          100: "#d1d1d6",
          50:  "#f2f2f7",
        },
        bg: {
          DEFAULT: "#fbfbfd",
          card: "#ffffff",
          subtle: "#f5f5f7",
        },
        csl: {
          50:  "#e8f5ee",
          100: "#c5e6d2",
          200: "#9bd5b3",
          300: "#6cc491",
          400: "#3eb574",
          500: "#1ea65a",
          600: "#168548",
          700: "#106639",
          800: "#0c4d2c",
          900: "#083720",
        },
        accent: {
          blue: "#0071e3",
          green: "#1ea65a",
          orange: "#ff9500",
          red: "#ff3b30",
          yellow: "#ffcc00",
          purple: "#5e5ce6",
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        glow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        "glow-green": "0 0 0 1px rgba(30, 166, 90, 0.12), 0 8px 24px rgba(30, 166, 90, 0.10)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

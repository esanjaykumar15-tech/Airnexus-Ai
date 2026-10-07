/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/app/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#05070a",
          900: "#0a0e14",
          850: "#0e131b",
          800: "#141a24",
          700: "#1b2330",
          600: "#26303f",
          500: "#37455a",
        },
        cyan: {
          400: "#22e0ea",
          500: "#0ec9d6",
        },
        aqi: {
          good: "#22c55e",
          satisfactory: "#84cc16",
          moderate: "#eab308",
          poor: "#f97316",
          verypoor: "#ef4444",
          severe: "#b91c1c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(34, 224, 234, 0.15)",
      },
    },
  },
  plugins: [],
};

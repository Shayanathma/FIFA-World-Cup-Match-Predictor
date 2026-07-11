/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pitch: "#0B1220",
        panel: "#132238",
        panelSoft: "#182B45",
        line: "#243752",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        worldCupGold: "#D6A94B",
        fifaBlue: "#0E4D92",
        fifaRed: "#B51F37",
        fifaGreen: "#107A55",
      },
      boxShadow: {
        premium: "0 20px 70px rgba(0, 0, 0, 0.35)",
        glow: "0 0 30px rgba(214, 169, 75, 0.22)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

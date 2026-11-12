/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Enrique design system, November 2026.
        pine: "#295560",
        "pine-2": "#6A66A3",
        ink: "#333333",
        cream: "#FFFFFF",
        "cream-2": "#B3CCB7",
        lavender: "#6A66A3",
        blue: "#85A9C1",
        gold: "#B3CCB7",
        coral: "#295560",
        muted: "#526B7B",
        white: "#FFFFFF",
        success: "#28A745",
        error: "#DC3545",
        warning: "#FFAF3E",

        // ---- Legacy aliases: old class names, new colors ----
        forest: "#295560",
        "forest-2": "#6A66A3",
        teal: "#85A9C1",
        copper: "#295560",
        parchment: "#FFFFFF",
        mist: "#B3CCB7"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(50, 83, 93, 0.16)",
        line: "0 1px 0 rgba(50, 83, 93, 0.09)",
        nav: "0 10px 30px rgba(50, 83, 93, 0.08)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

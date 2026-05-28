/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#1E3A2F",
        "forest-2": "#2B4B3F",
        teal: "#486A5B",
        copper: "#B86A3D",
        parchment: "#F4EFE6",
        ink: "#252A26",
        muted: "#676A60",
        mist: "#E2D8C9"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(30, 58, 47, 0.14)",
        line: "0 1px 0 rgba(42, 42, 42, 0.09)",
        nav: "0 10px 30px rgba(30, 58, 47, 0.08)"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Outfit", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

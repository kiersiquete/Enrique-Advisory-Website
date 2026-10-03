/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ---- Gilbert Devlyn palette 1: serene sophistication ----
        pine: "#32535D",
        "pine-2": "#68659E",
        ink: "#32535D",
        cream: "#FAFAF8",
        "cream-2": "#B7C9B9",
        lavender: "#68659E",
        blue: "#8AA7BD",
        gold: "#B7C9B9",
        coral: "#32535D",
        muted: "#32535D",
        white: "#FAFAF8",

        // ---- Legacy aliases: old class names, new colors ----
        forest: "#32535D",
        "forest-2": "#68659E",
        teal: "#8AA7BD",
        copper: "#32535D",
        parchment: "#FAFAF8",
        mist: "#B7C9B9"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(50, 83, 93, 0.16)",
        line: "0 1px 0 rgba(50, 83, 93, 0.09)",
        nav: "0 10px 30px rgba(50, 83, 93, 0.08)"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ---- New brand palette ----
        pine: "#0F463C",
        "pine-2": "#1B5A4D",     // lighter pine: hovers, secondary surfaces
        ink: "#17352E",          // body text on light
        cream: "#F4EEE2",        // page background
        "cream-2": "#EDE3D0",    // cards / dividers on cream
        lavender: "#C9B2DE",     // section tints, diagram fills only
        blue: "#B8CDE0",         // section tints, diagram fills only
        gold: "#F1C84C",         // primary CTA on dark surfaces
        coral: "#EF563D",        // eyebrow labels, small accents
        muted: "#5F6A60",        // secondary text

        // ---- Legacy aliases: old class names, new colors ----
        // Keeps every existing className working. Migrate then delete.
        forest: "#0F463C",
        "forest-2": "#1B5A4D",
        teal: "#3E6557",
        copper: "#EF563D",       // kills the old mustard/khaki everywhere
        parchment: "#F4EEE2",
        mist: "#EDE3D0"
      },
      boxShadow: {
        soft: "0 24px 70px rgba(15, 70, 60, 0.14)",
        line: "0 1px 0 rgba(23, 53, 46, 0.09)",
        nav: "0 10px 30px rgba(15, 70, 60, 0.08)"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Outfit", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

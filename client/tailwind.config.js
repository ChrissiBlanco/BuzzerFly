/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Fredoka", "system-ui", "sans-serif"],
      },
      colors: {
        buzz: {
          black: "#0d0d0d",
          red: "#e63946",
          "red-dark": "#c1121f",
          "red-light": "#ff6b6b",
          yellow: "#ffd60a",
          "yellow-light": "#ffea00",
          "yellow-dark": "#e6b800",
        },
      },
      borderRadius: {
        "playful": "1.25rem",
        "playful-lg": "1.75rem",
      },
      boxShadow: {
        "playful": "0 4px 0 0 rgba(0,0,0,0.2)",
        "playful-lg": "0 6px 0 0 rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};

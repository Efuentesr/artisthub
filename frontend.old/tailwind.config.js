/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0f0ff",
          100: "#e4e3ff",
          200: "#cccaff",
          300: "#aaa6ff",
          400: "#8b85ff",
          500: "#7165f6",
          600: "#5f4eea",
          700: "#4f3dd0",
          800: "#4133aa",
          900: "#372f87",
          950: "#221c54",
        },
        surface: {
          DEFAULT: "#0f0e1a",
          1: "#16142a",
          2: "#1e1c36",
          3: "#272543",
        },
      },
    },
  },
  plugins: [],
};

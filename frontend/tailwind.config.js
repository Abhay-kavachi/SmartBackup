/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1f6feb",
        secondary: "#161b22",
        accent: "#00d1b2",
      },
    },
  },
  plugins: [],
};


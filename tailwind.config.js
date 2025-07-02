/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f6f7f6',
          100: '#e3e6e4',
          200: '#c7cdc8',
          300: '#a4aca6',
          400: '#7d877f',
          500: '#637368',
          600: '#4f5b53',
          700: '#414a44',
          800: '#363d38',
          900: '#2f332f',
        }
      }
    },
  },
  plugins: [],
} 
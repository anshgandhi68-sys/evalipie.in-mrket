/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lichen: '#E6E9E4',
        ink: '#0F1412',
        mid: '#5D6661',
        signal: '#FF5A1F',
        navy: {
          900: '#111827',
          800: '#1f2937',
        },
        teal: {
          DEFAULT: '#167D73',
          dark: '#105B55',
          light: '#E9F7F3',
        },
        ai: {
          DEFAULT: '#7657E8',
          light: '#F0ECFD',
        }
      },
      fontFamily: {
        sans: ['Archivo', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

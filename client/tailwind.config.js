/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alabaster: '#F6F5F0',
        obsidian: '#111111',
        gridline: '#E4E2DA',
        'slate-muted': '#5A5852',
        terracotta: {
          DEFAULT: '#B84A27',
          dark: '#933B1F',
          light: '#F8EDE8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        'architectural': '0 1px 3px rgba(17, 17, 17, 0.05), 0 10px 24px -4px rgba(17, 17, 17, 0.06)',
        'architectural-hover': '0 20px 35px -8px rgba(17, 17, 17, 0.12), 0 2px 6px rgba(17, 17, 17, 0.04)',
        'crisp': '0 0 0 1px #E4E2DA',
        'crisp-terracotta': '0 0 0 1px #B84A27'
      }
    },
  },
  plugins: [],
}

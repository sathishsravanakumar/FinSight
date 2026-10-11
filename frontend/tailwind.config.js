/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:    '#2D2E8F',
          red:     '#CC2222',
          dark:    '#0D0D3A',
          text:    '#1A1A2E',
          light:   '#EBEBF8',
          muted:   '#9999CC',
          bg:      '#f5f5f8',
          hero:    '#1A1A5E',
          trust:   '#23237a',
          gold:    '#D4AF00',
          section: '#EEEEF8',
        },
      },
      fontFamily: {
        sans: ["'Segoe UI'", 'Arial', 'sans-serif'],
        mono: ["'Courier New'", 'monospace'],
      },
    },
  },
  plugins: [],
}

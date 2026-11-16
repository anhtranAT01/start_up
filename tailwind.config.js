/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6F0',
        sand: '#E6DEC8',
        wood: '#7C4D2B',
        sunset: '#D96B43',
        'sunset-hover': '#B84A24',
        candle: '#E5A93C',
        charcoal: '#2C2523',
        taupe: '#6E6259',
        pine: '#3B7A57',
        cobalt: '#2B6CB0',
        wine: '#9B2C2C',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 6px 24px -6px rgba(124, 77, 43, 0.10)',
        'warm-lg': '0 12px 32px -8px rgba(124, 77, 43, 0.16)',
      },
    },
  },
  plugins: [],
}

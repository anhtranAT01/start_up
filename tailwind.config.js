/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Moclant Brand Color Palette (Hoa Mộc Lan)
        olive: '#606E5A',           // Xanh olive chủ đạo
        'olive-dark': '#4A5645',
        champagne: '#C9A166',       // Vàng champagne
        'champagne-hover': '#B38B50',
        ivory: '#F6F2EB',           // Trắng kem (Nền chính)
        beige: '#EAE1D4',           // Beige (Nền phụ)
        sage: '#748067',            // Xanh sage (Màu phụ, hover, icon)
        'muted-gold': '#D6BD95',    // Vàng cát (Highlight, đường viền)
        // Legacy aliases mapped to Moclant palette
        cream: '#F6F2EB',
        sand: '#D6BD95',
        wood: '#606E5A',
        sunset: '#C9A166',
        'sunset-hover': '#B38B50',
        candle: '#C9A166',
        charcoal: '#2C3329',
        taupe: '#646E5F',
        pine: '#606E5A',
        cobalt: '#2B6CB0',
        wine: '#9B2C2C',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        warm: '0 6px 24px -6px rgba(96, 110, 90, 0.12)',
        'warm-lg': '0 12px 32px -8px rgba(96, 110, 90, 0.18)',
      },
    },
  },
  plugins: [],
}

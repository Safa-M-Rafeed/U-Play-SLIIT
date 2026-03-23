
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  './index.html',
  './src/**/*.{js,jsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        navy: '#0F172A',
        surface: '#1E293B',
        primary: '#2563EB',
        secondary: '#16A34A',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float-orb 20s ease-in-out infinite',
        'float-reverse': 'float-orb-reverse 25s ease-in-out infinite',
        'gradient': 'gradient-shift 6s ease infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

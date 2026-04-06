
// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//   './index.html',
//   './src/**/*.{js,jsx}'
// ],
//   theme: {
//     extend: {
//       fontFamily: {
//         sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
//       },
//       colors: {
//         navy: '#0F172A',
//         surface: '#1E293B',
//         primary: '#2563EB',
//         secondary: '#16A34A',
//       },
//       backdropBlur: {
//         xs: '2px',
//       },
//       animation: {
//         'float': 'float-orb 20s ease-in-out infinite',
//         'float-reverse': 'float-orb-reverse 25s ease-in-out infinite',
//         'gradient': 'gradient-shift 6s ease infinite',
//         'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
//       },
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#028090',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
    },
  },
  plugins: [],
}
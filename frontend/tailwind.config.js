/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0F0A1A',
        plum: '#2A1745',
        amethyst: { 300: '#C4A6FF', 400: '#B08BFF', 500: '#9B6BFF', 600: '#7C4DDB' },
        blush: '#F472B6',
        sunset: '#FB923C',
        navy: '#0B2447',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        report: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/views/**/*.blade.php",
    "./resources/js/**/*.jsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        'max-navy': '#1B365D',
        'max-lime': '#8CC63F',
        primary: '#1B365D',
        secondary: '#8CC63F',
      }
    },
  },
  plugins: [],
}

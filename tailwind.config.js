/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./{api,components,constants,contexts,hooks,services,translations,views}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
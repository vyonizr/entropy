/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryBackgroundDark: 'hsla(225, 59%, 11%, 1)',
        primaryTextDark: 'hsla(0, 0%, 100%, 1)',
        primary: 'hsla(197, 40%, 39%, 1)',
        primaryText: 'hsla(0, 0%, 25%, 1)',
        disabled: 'hsla(180, 17%, 79%, 1)',
      }
    },
  },
  plugins: [],
}

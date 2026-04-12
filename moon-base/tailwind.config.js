/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 告訴 Tailwind 掃描這些檔案
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
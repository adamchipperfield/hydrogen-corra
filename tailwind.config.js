/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.tsx'
  ],
  safelist: [
    { pattern: /h-*/ },
    { pattern: /w-*/ }
  ]
}

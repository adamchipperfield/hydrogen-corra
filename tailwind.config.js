/** @type {import('tailwindcss').Config} */
const { buttonClasses } = require('./app/helpers/classes')

module.exports = {
  content: [
    './app/**/*.tsx'
  ],

  safelist: [
    { pattern: /h-*/ },
    { pattern: /w-*/ },

    ...buttonClasses.split(' ')
  ],

  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ]
}

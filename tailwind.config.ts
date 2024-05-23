import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import typography from '@tailwindcss/typography'

export default <Partial<Config>> {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],

  darkMode: 'class',

  plugins: [
    typography,
  ],

  theme: {
    fontFamily: {
      sans:  ['Poppins', ...defaultTheme.fontFamily.sans],
      mono:  defaultTheme.fontFamily.mono,
      serif: defaultTheme.fontFamily.serif,
    },

    extend: {
      colors: {
        transparent: 'transparent',
        current:     'currentColor',
        acornblue:   '#4f7ef3',
        acornpurple: '#380067',
        acornteal:   '#2ddcec',
        acornred:    '#ff4044',
        acornorange: '#ff7240',
        acornyellow: '#fdcc11',
        acorngreen:  '#06eaa7',
      },

      fontFamily: { poppins: ['Poppins', 'sans-serif'] },
    },
  },
}

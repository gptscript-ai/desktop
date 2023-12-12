import type { Config } from 'tailwindcss'
// import colors from 'tailwindcss/colors'

export default <Partial<Config>> {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'rubra': {
          '50': '#effef3',
          '100': '#dbfde4',
          '200': '#b9f9c9',
          '300': '#82f3a1',
          '400': '#44e470',
          '500': '#1bcc4c',
          '600': '#10a93a',
          '700': '#118432',
          '800': '#13682b',
          '900': '#115626',
          '950': '#032b10',
        },
      },
    },
  },
}

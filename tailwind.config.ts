import type { Config } from 'tailwindcss'

// import colors from 'tailwindcss/colors'

export default <Partial<Config>> {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rubra: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#1d1d1d',
          950: '#080808',
        },

        // rubra: {
        //   50: '#effef3',
        //   100: '#dbfde4',
        //   200: '#b9f9c9',
        //   300: '#82f3a1',
        //   400: '#44e470',
        //   500: '#1bcc4c',
        //   600: '#10a93a',
        //   700: '#118432',
        //   800: '#13682b',
        //   900: '#115626',
        //   950: '#032b10',
        // },
      },
    },
  },
}

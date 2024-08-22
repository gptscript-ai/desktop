import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'ping-thrice': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%': { transform: 'scale(2)', opacity: '0' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        'ping-thrice': 'ping-thrice 1.5s cubic-bezier(0, 0, 0.2, 1) 3 forwards',
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui(), require('@tailwindcss/typography')],
};

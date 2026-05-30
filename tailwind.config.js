import flowbite from 'flowbite/plugin'
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ['Satoshi', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        glow: {
          gold: '#ffbf00',
          'gold-dark': '#c59400',
          text: '#282828',
          'text-muted': 'rgba(40, 40, 40, 0.4)',
          'text-soft': 'rgba(40, 40, 40, 0.8)',
          placeholder: 'rgba(99, 99, 99, 0.6)',
          primary: '#3c5ccf',
          secondary: '#a38a2d',
        },
      },
      borderRadius: {
        panel: '40px',
      },
    },
  },
  plugins: [flowbite, forms],
}

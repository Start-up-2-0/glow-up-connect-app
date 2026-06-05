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
        urbanist: ['Urbanist', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        glow: {
          gold: '#ffbf00',
          'gold-dark': '#c59400',
          'gold-selected': 'rgba(255, 191, 0, 0.8)',
          text: '#282828',
          'text-muted': 'rgba(40, 40, 40, 0.4)',
          'text-soft': 'rgba(40, 40, 40, 0.8)',
          'text-subtle': 'rgba(40, 40, 40, 0.5)',
          'text-hover': 'rgba(40, 40, 40, 0.6)',
          'border-soft': 'rgba(40, 40, 40, 0.25)',
          'border-sidebar': 'rgba(40, 40, 40, 0.3)',
          surface: '#f3f3f3',
          canvas: '#e5e5e5',
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

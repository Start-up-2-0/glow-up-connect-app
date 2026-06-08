import flowbite from 'flowbite/plugin'
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        montserrat: ['Montserrat', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        glow: {
          gold: 'var(--glow-gold)',
          'gold-dark': 'var(--glow-gold-dark)',
          'gold-soft': 'var(--glow-gold-soft)',
          'gold-selected': 'var(--glow-gold-selected)',
          text: 'var(--glow-text)',
          'text-muted': 'var(--glow-text-muted)',
          'text-soft': 'var(--glow-text-soft)',
          'text-subtle': 'var(--glow-text-subtle)',
          'text-hover': 'var(--glow-text-hover)',
          'border-soft': 'var(--glow-border-soft)',
          'border-sidebar': 'var(--glow-border-sidebar)',
          surface: 'var(--glow-surface)',
          canvas: 'var(--glow-canvas)',
          placeholder: 'var(--glow-placeholder)',
          primary: 'var(--glow-primary)',
          purple: 'var(--glow-purple)',
          'purple-soft': 'var(--glow-purple-soft)',
          'gold-cta': 'var(--glow-gold-cta)',
          secondary: 'var(--glow-secondary)',
          'avatar-bg': 'var(--glow-avatar-bg)',
          'hover-surface': 'var(--glow-hover-surface)',
        },
      },
      borderRadius: {
        panel: '40px',
      },
    },
  },
  plugins: [flowbite, forms],
}

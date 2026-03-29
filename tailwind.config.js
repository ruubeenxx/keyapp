/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        key: {
          bg:     'var(--key-bg)',
          card:   'var(--key-card)',
          border: 'var(--key-border)',
          purple: '#7C3AED',
          pink:   '#ec4899',
          teal:   '#14b8a6',
          amber:  '#f59e0b',
          text:   'var(--key-text)',
          muted:  'var(--key-muted)',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'float':      'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'slide-up':   'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.7' },
        },
        'slide-up': {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        }
      }
    }
  },
  plugins: []
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        'surface-3': 'var(--color-surface-3)',
        line: 'var(--color-line)',
        'line-light': 'var(--color-line-light)',
        t1: 'var(--color-t1)',
        t2: 'var(--color-t2)',
        t3: 'var(--color-t3)',
        pink: 'var(--color-pink)',
        purple: 'var(--color-purple)',
        blue: 'var(--color-blue)',
        cyan: 'var(--color-cyan)',
        green: 'var(--color-green)',
        orange: 'var(--color-orange)',
        red: 'var(--color-red)',
        zg: 'var(--color-zg)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

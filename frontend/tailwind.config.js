/** @type {import('tailwindcss').Config} */

// Colours are CSS variables (see globals.css) so light/dark share one set of class names.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        sunken: token('sunken'),
        line: token('line'),
        ink: token('ink'),
        muted: token('muted'),
        brand: {
          DEFAULT: token('brand'),
          hover: token('brand-hover'),
          soft: token('brand-soft'),
          fg: token('brand-fg'),
        },
        good: { DEFAULT: token('good'), soft: token('good-soft'), fg: token('good-fg') },
        warn: { DEFAULT: token('warn'), soft: token('warn-soft'), fg: token('warn-fg') },
        bad: { DEFAULT: token('bad'), soft: token('bad-soft'), fg: token('bad-fg') },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(16 24 20 / 0.04), 0 1px 3px rgb(16 24 20 / 0.06)',
        lift: '0 12px 32px -12px rgb(16 24 20 / 0.18)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scan-line': {
          '0%, 100%': { top: '8%' },
          '50%': { top: '88%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'scan-line': 'scan-line 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

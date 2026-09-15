import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF8F4',
        ink: '#161C26',
        muted: '#5B6577',
        line: '#E5E2DB',
        brand: {
          50: '#EFF7FA',
          100: '#DCEDF4',
          200: '#BBDCE9',
          300: '#8CC3D9',
          400: '#55A4C4',
          500: '#2C7FA8',
          600: '#1F6F8B',
          700: '#1A5872',
          800: '#18485D',
          900: '#173D4E',
        },
        teal: {
          100: '#D6F0EC',
          500: '#1F9B94',
          600: '#187E79',
        },
        plum: {
          100: '#E7E2F6',
          500: '#6D5BB5',
          600: '#5B4B9B',
        },
        danger: {
          50: '#FDF2F2',
          200: '#F6CFCF',
          500: '#C0483F',
          600: '#A63C34',
        },
      },
      spacing: {
        '4.5': '1.125rem',
      },
      fontFamily: {
        // System stacks only: no font downloads, so the build never depends on
        // reaching an external font CDN.
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'ui-serif',
          'Iowan Old Style',
          'Palatino Linotype',
          'Palatino',
          'Georgia',
          'serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 28, 38, 0.04), 0 8px 24px -12px rgba(22, 28, 38, 0.16)',
        lift: '0 2px 6px rgba(31, 111, 139, 0.18), 0 12px 28px -14px rgba(31, 111, 139, 0.45)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;

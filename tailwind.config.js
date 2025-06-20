/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
      }
    },
    // Add RTL-aware spacing utilities
    spacing: {
      ...Array.from({ length: 101 }, (_, i) => i * 0.5)
        .reduce((acc, i) => {
          acc[i] = `${i * 0.25}rem`;
          return acc;
        }, {}),
      'start-0': '0',
      'end-0': '0',
      'inset-inline-start-0': '0',
      'inset-inline-end-0': '0',
    },
  },
  plugins: [
    // Add a plugin for RTL-aware CSS
    function({ addUtilities }) {
      const newUtilities = {
        '.start-0': {
          left: '0',
          '.rtl &': {
            left: 'auto',
            right: '0',
          },
        },
        '.end-0': {
          right: '0',
          '.rtl &': {
            right: 'auto',
            left: '0',
          },
        },
        '.me-auto': {
          marginRight: 'auto',
          '.rtl &': {
            marginRight: '0',
            marginLeft: 'auto',
          },
        },
        '.ms-auto': {
          marginLeft: 'auto',
          '.rtl &': {
            marginLeft: '0',
            marginRight: 'auto',
          },
        },
      };

      addUtilities(newUtilities);
    }
  ],
};
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./login.html",
    "./dashboard.html",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'tajawal': ['Tajawal', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
        },
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      colors: {
        primary: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B8DBFF',
          300: '#8AC2FF',
          400: '#5CA8FF',
          500: '#2E8EFF',
          600: '#0070FF',
          700: '#0057CC',
          800: '#003E99',
          900: '#002966',
        },
        secondary: {
          50: '#FFF5F5',
          100: '#FFE6E6',
          200: '#FFC7C7',
          300: '#FFA3A3',
          400: '#FF7A7A',
          500: '#FF5252',
          600: '#FF2929',
          700: '#E60000',
          800: '#B30000',
          900: '#800000',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
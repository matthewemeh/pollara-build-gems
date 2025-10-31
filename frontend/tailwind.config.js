/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      spacing: {
        10.5: '42px',
        15: '60px',
        30: '120px',
        35: '140px',
        70: '280px',
      },
      colors: {
        primary: {
          50: '#f2f8fd',
          100: '#e4f0fa',
          200: '#c2e0f5',
          300: '#8cc7ed',
          400: '#4faae1',
          500: '#2990ce',
          600: '#1a72af',
          700: '#165b8e',
          800: '#164d76',
          900: '#143752',
          950: '#102a41',
          dark: '#2c2c2c',
        },
        grey: '#e2e8f0',
        tuatara: '#363535',
        'deep-grey': '#7a7a7a',
        'medium-sea': '#47b172',
        'davys-grey': '#525252',
        'eerie-black': '#191919',
        'koriki-black': '#001010',
        'koriki-white': '#f8f8f8',
        'pantone-green': '#47b24f',
        'silver-chalice-1': '#b1b1b1',
        'silver-chalice-2': '#aeaeae',

        haiti: '#230b34',
        tuatara: '#383838',
        alabaster: '#f9fafc',
        'gull-gray': '#a3b1bf',
        'port-gore': '#1e1e4b',
        'storm-dust': '#656565',
        'granite-gray': '#686868',
      },
      borderRadius: {
        '1/2': '50%',
        2.5: '10px',
      },
      keyframes: {
        'slide-left': {
          from: { opacity: 0, transform: 'translateX(100px)' },
          to: { opacity: 1, transform: 'translateX(0)' },
        },
        'rotate-right': {
          from: { transform: 'rotate(0)' },
          to: { transform: 'rotate(360deg)' },
        },
        'rotate-left': {
          from: { transform: 'rotate(0)' },
          to: { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        'slide-left': 'slide-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
      },
    },
  },
  plugins: [],
};

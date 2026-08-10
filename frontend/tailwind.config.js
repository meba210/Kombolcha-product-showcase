/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9efe5',
          100: '#f1dcc7',
          200: '#e6c29d',
          300: '#d19a73',
          400: '#b77451',
          500: '#975f3f',
          600: '#7f4d33',
          700: '#653b29',
          800: '#4a2b20',
          900: '#2f1a12',
        },
        smoke: {
          50: '#f8fafb',
          100: '#eef1f5',
          200: '#dfe5ed',
          300: '#c2cbd7',
          400: '#8f9bab',
          500: '#6e7a8d',
          600: '#4f596f',
          700: '#343f52',
          800: '#1d2939',
          900: '#0f1723',
        },
        dust: {
          50: '#f5efe7',
          100: '#ebdbcf',
          200: '#d6bca7',
          300: '#b99179',
          400: '#976a55',
          500: '#7b523f',
          600: '#613e2f',
          700: '#4a2f24',
          800: '#37231b',
          900: '#23170f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

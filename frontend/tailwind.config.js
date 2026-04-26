export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#e8eef8',
          200: '#cdd9ea',
          300: '#9db4d1',
          400: '#6a8ab6',
          500: '#315f98',
          600: '#204b7e',
          700: '#173760',
          800: '#112947',
          900: '#0b1a2d',
          950: '#07101d',
        },
        accent: {
          50: '#fff8ea',
          100: '#ffedc1',
          200: '#ffd888',
          300: '#ffbf4f',
          400: '#f5a51c',
          500: '#dc7900',
          600: '#a86608',
          700: '#8a4c0b',
          800: '#713d10',
          900: '#5c3210',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.12)',
        lift: '0 24px 80px rgba(7, 16, 29, 0.18)',
      },
    },
  },
  plugins: [],
};

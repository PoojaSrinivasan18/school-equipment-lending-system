module.exports = {
  darkMode: 'class', // use class-based dark mode so we can toggle via a button
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#e6edff',
          500: '#4f46e5',
          700: '#3730a3'
        }
      }
    }
  },
  plugins: []
}

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#03363D',
        navyM: '#054F52',
        navyL: '#0B6E6E',
        teal: '#BBD9D7',
        tealBg: '#EAF7F6',
        tealDk: '#9FCAC7',
        orange: '#F26522',
        red: '#D84040',
        yellow: '#F5A623',
        white: '#FFFFFF',
        offW: '#F4F7FA',
        gray: '#B1C4C6',
        grayL: '#DDEBEA',
        grayXL: '#EEF7F6',
        dark: '#021617'
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}

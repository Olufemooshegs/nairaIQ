module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A2342',
        navyM: '#0F2D54',
        navyL: '#1B4980',
        teal: '#00A878',
        tealBg: '#E6FFF6',
        tealDk: '#007A58',
        orange: '#F26522',
        red: '#D84040',
        yellow: '#F5A623',
        white: '#FFFFFF',
        offW: '#F4F7FA',
        gray: '#8FA3B8',
        grayL: '#D5E1EC',
        grayXL: '#EEF3F8',
        dark: '#0D1E30'
      },
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
}

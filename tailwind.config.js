module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  content: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Extend rather than override theme defaults for now
    extend: {
      fontFamily: {
        display: ['Rubik', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      // 500 is root color
      colors: {
        "pantry-blue": {
          50: '#F3F5F7',
          100: '#E7EBEF',
          200: '#C3CCD7',
          300: '#9EADBF',
          400: '#56708F',
          500: '#0D325F',
          600: '#0C2D56',
          700: '#081E39',
          800: '#06172B',
          900: '#040F1D',
        },
        "pantry-green": {
          50: '#F7FBF4',
          100: '#F0F8E8',
          200: '#D9EDC6',
          300: '#C2E1A4',
          400: '#95CB60',
          500: '#67B51C',
          600: '#5DA319',
          700: '#3E6D11',
          800: '#2E510D',
          900: '#1F3608',
        },
        "pantry-orange": {
          50: '#FEFBF5',
          100: '#FEF7EC',
          200: '#FCEACF',
          300: '#F9DDB2',
          400: '#F5C478',
          500: '#F1AA3E',
          600: '#D99938',
          700: '#916625',
          800: '#6C4D1C',
          900: '#483313',
        },
        "pantry-red": {
          50: '#FDF5F3',
          100: '#FCECE7',
          200: '#F7CFC3',
          300: '#F2B29F',
          400: '#E97856',
          500: '#DF3E0E',
          600: '#C9380D',
          700: '#862508',
          800: '#641C06',
          900: '#431304',
        },  
      },
    },
  },
  variants: {},
  plugins: [],
}

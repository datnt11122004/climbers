const { transform } = require('next/dist/build/swc')
const { colors, typographyComponents, fontFamily } = require('./src/theme')
const { createThemes } = require('tw-colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        main: "rgb(27 29 40 / 1)",
        header: "rgb(46 56 71/ 1)",
        card: "#eef0f3",
        btnBuyActive: 'rgb(74 222 128 / 1)',
        btnSellActive: 'rgb(248 113 113 / 1)',
        btn: 'rgb(31 41 55 / 1)',
        // oddColor: 'white',
        // evenColor: 'whitesmoke',
        oddColor: '#EABF04',
        evenColor: '#FFF4CA',
      },
      boxShadow: {
        hover: "rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px",
        border: "rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px",
        textBorderShadow: "2px 0 #fff, -2px 0 #fff, 0 2px #fff, 0 -2px #fff, 1px 1px #fff, -1px -1px #fff, 1px -1px #fff, -1px 1px #fff"
      },
      keyframes: {
        wave: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
          '100%': { transform: 'translateY(0)' },
        },
        fallDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        blinker: {
          "50%": { opacity: 0 }
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        },
        slideInFromRight: {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1',
          }
        },
        bubbleUp: {
          '0%': {
            transform: 'translateY(100%)',
          },
          '100%': {
            transform: 'translateY(-100%)',
          }
        },
        moveDiagonally: {
          '0%': { transform: 'translate(-100px, 100px)' },
          '100%': { transform: 'translate(150px, -50px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        kingTitle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        kingPool: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(234, 179, 8, 0.8)' },
          '50%': { boxShadow: '0 0 40px rgba(234, 179, 8, 0.4)' },
        },
        kingText: {
          '0%, 100%': { color: '#F59E0B' },
          '50%': { color: '#FCD34D' },
        },
        // ping: {
        //   '0%, 100%': { transform: 'scale(1)' },
        //   '50%': { transform: 'scale(0.8)' }
        // }
        swing: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(15deg)' },
          '50%': { transform: 'rotate(0deg)' },
          '75%': { transform: 'rotate(-15deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },


        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-50px)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },


      },
      animation: {
        wave: 'wave 2s linear infinite',
        blink: "blinker 1s linear infinite",
        fallDown: 'fallDown 0.2s ease-in-out',
        shake: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
        newMessage: 'slideInFromRight 0.5s ease-out',
        bubbleUp: 'bubbleUp 1s linear infinite',
        moveDiagonally: 'moveDiagonally 2s ease-in-out infinite',
        fadeIn: 'fadeIn 1.5s ease-out forwards',
        'king-title': 'kingTitle 2s infinite',
        'king-pool': 'kingPool 3s infinite',
        'king-text': 'kingText 1.5s infinite',
        'ping': 'ping 2s ease-in-out infinite',
        swing: 'swing 0.6s ease-in-out infinite',
        fadeIn: 'fadeIn 1s ease-in-out',
        slideInDown: 'slideInDown 1s ease-in-out',
        fadeInUp: 'fadeInUp 1s ease-in-out',
        spin: 'spin 2s linear infinite',
      },
      colors: {
        primary: '#297FD6',
        'custom-green': '#089981',
        'custom-red': '#F23645',
        green: "#00C805",
        'black-45': 'rgba(0, 0, 0, .45)',
      },
      dropShadow: {
        textShadow: "text-shadow: -4px 3px 0 #3a50d9, -14px 7px 0 #0a0e27"
      },
      fontFamily: {
        forza: ['Forza']
      },
      screens: {
        xs: { 'min': '375px', 'max': '639px' },
        sm: { 'min': '640px', 'max': '767px' },
        md: { 'min': '768px', 'max': '1023px' },
        lg: { 'min': '1024px', 'max': '1279px' },
        xl: { 'min': '1280px', 'max': '1535px' },
        xxl: { 'min': '1536px' }
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    /** @type {import('tailwindcss/types/config').PluginCreator} */
    ({ addUtilities }) => {
      addUtilities(
        {
          '.flex-center-between': {
            '@apply flex items-center justify-between': {}
          },
          '.flex-center': {
            '@apply flex items-center justify-center': {}
          }
        },
        ['responsive', 'hover']
      )

      addUtilities(typographyComponents)
    },
    createThemes({
      ...colors
    }),
    require('tailwindcss'),
    require('autoprefixer'),
  ],
  important: true,
}

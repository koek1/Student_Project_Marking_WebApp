/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Akademia Color Scheme
          akademia: {
            primary: '#0E1E3B',    // RGB(14, 30, 59) - Dark blue
            secondary: '#935E28',  // RGB(147, 94, 40) - Brown/Gold
            white: '#FFFFFF',      // White
            light: '#F8F9FA',      // Light gray
            dark: '#212529',       // Dark gray
            success: '#28A745',    // Green
            warning: '#FFC107',    // Yellow
            danger: '#DC3545',     // Red
            info: '#17A2B8'        // Blue
          },
          // Extended color palette
          gray: {
            50: '#F8F9FA',
            100: '#E9ECEF',
            200: '#DEE2E6',
            300: '#CED4DA',
            400: '#ADB5BD',
            500: '#6C757D',
            600: '#495057',
            700: '#343A40',
            800: '#212529',
            900: '#0E1E3B'
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          display: ['Inter', 'system-ui', 'sans-serif']
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
          '128': '32rem'
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'slide-down': 'slideDown 0.3s ease-out',
          'bounce-gentle': 'bounceGentle 2s infinite'
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' }
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          },
          slideDown: {
            '0%': { transform: 'translateY(-10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' }
          },
          bounceGentle: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' }
          }
        }
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography')
    ],
  }
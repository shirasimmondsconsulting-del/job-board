/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        israel: {
          blue: '#0038B8',
          white: '#FFFFFF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    ({ addComponents }) => {
      addComponents({
        '.container-custom': {
          '@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': {}
        },
        '.section': {
          '@apply py-16 lg:py-24': {}
        },
        '.section-sm': {
          '@apply py-12 lg:py-16': {}
        },
        '.badge': {
          '@apply inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold': {}
        },
        '.badge-primary': {
          '@apply bg-blue-100 text-blue-700 border border-blue-200': {}
        },
        '.badge-pill': {
          '@apply rounded-full': {}
        },
        '.btn': {
          '@apply inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200': {}
        },
        '.btn-primary': {
          '@apply px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm': {}
        },
        '.btn-secondary': {
          '@apply px-6 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50': {}
        },
        '.btn-lg': {
          '@apply px-8 py-3 text-lg': {}
        },
      })
    }
  ],
}

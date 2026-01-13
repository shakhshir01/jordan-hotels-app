/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        jordan: {
          blue: '#003580', // Deep Royal Blue
          'blue-dark': '#001b3d', // Darker blue for dark mode
          rose: '#d67d61', // Petra Rose
          'rose-dark': '#b85c47', // Darker rose for dark mode
          sand: '#caa472', // Desert Sand
          'sand-dark': '#a8895b', // Darker sand for dark mode
          teal: '#0f3d66', // Deep Teal
          'teal-dark': '#0a2a47', // Darker teal for dark mode
          gold: '#c5a059', // Luxury Gold
          'gold-dark': '#a0854a', // Darker gold for dark mode
          cream: '#f9f7f2', // Warm background
          'cream-dark': '#2a2a2a', // Dark cream alternative
          stone: '#8b7355', // Jordanian stone
          'stone-dark': '#6b5a45', // Darker stone
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial'],
        display: ['Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/patterns/hero.svg')",
        'luxury-gradient': 'linear-gradient(to right, #003580, #0f3d66)',
        'desert-gradient': 'linear-gradient(to bottom right, #d67d61, #caa472)',
        'jordan-sunset': 'linear-gradient(to bottom, #003580, #d67d61, #caa472)',
        'dark-luxury': 'linear-gradient(to right, #1e293b, #0f172a, #1e293b)',
        'glass-morphism': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(214, 125, 97, 0.4)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.8s ease-out',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

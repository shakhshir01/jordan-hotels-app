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
          emerald: '#10b981', // Vibrant emerald
          'emerald-dark': '#059669', // Darker emerald
          coral: '#ff6b6b', // Vibrant coral
          'coral-dark': '#ee5a52', // Darker coral
          purple: '#8b5cf6', // Royal purple
          'purple-dark': '#7c3aed', // Darker purple
          amber: '#f59e0b', // Warm amber
          'amber-dark': '#d97706', // Darker amber
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
        premium: {
          50: '#fdfcfb',
          100: '#fbf8f6',
          200: '#f6f0ea',
          300: '#ede2d3',
          400: '#e2cdb5',
          500: '#d4b08a',
          600: '#c1915c',
          700: '#a67545',
          800: '#8b5e3c',
          900: '#744e35',
        },
        luxury: {
          50: '#fefefe',
          100: '#fdfdfd',
          200: '#fafafa',
          300: '#f5f5f5',
          400: '#e5e5e5',
          500: '#d4d4d4',
          600: '#a3a3a3',
          700: '#737373',
          800: '#525252',
          900: '#404040',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial'],
        display: ['Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/patterns/hero.svg')",
        'luxury-gradient': 'linear-gradient(135deg, #003580 0%, #0f3d66 25%, #1e293b 50%, #0f172a 75%, #003580 100%)',
        'hero-luxury': 'linear-gradient(135deg, #001122 0%, #003580 20%, #0f3d66 40%, #1e293b 60%, #0f172a 80%, #001122 100%)',
        'desert-gradient': 'linear-gradient(135deg, #d67d61 0%, #caa472 30%, #8b7355 60%, #6b5a45 100%)',
        'jordan-sunset': 'linear-gradient(135deg, #003580 0%, #d67d61 25%, #caa472 50%, #8b7355 75%, #6b5a45 100%)',
        'ocean-depths': 'linear-gradient(135deg, #001122 0%, #003580 20%, #0f3d66 40%, #1e293b 60%, #0f172a 80%, #001122 100%)',
        'royal-nights': 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #7c3aed 75%, #1e1b4b 100%)',
        'emerald-dreams': 'linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 50%, #059669 75%, #064e3b 100%)',
        'golden-horizon': 'linear-gradient(135deg, #92400e 0%, #b45309 25%, #d97706 50%, #f59e0b 75%, #92400e 100%)',
        'text-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #caa472 50%, #d67d61 75%, #f59e0b 100%)',
        'dark-luxury': 'linear-gradient(to right, #1e293b, #0f172a, #1e293b)',
        'glass-morphism': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'premium-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'ocean-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'fire-gradient': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'royal-gradient': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'cosmic-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'aurora-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
        'glass-card-dark': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)',
        // Light mode backgrounds
        'light-hero': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)',
        'light-premium': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #f1f5f9 50%, #e2e8f0 75%, #cbd5e1 100%)',
        'light-warm': 'linear-gradient(135deg, #fefcfb 0%, #fef7ed 25%, #fef3c7 50%, #fde68a 75%, #fcd34d 100%)',
        'light-cool': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #bae6fd 50%, #7dd3fc 75%, #38bdf8 100%)',
        // Dark mode backgrounds
        'dark-hero': 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
        'dark-premium': 'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
        'dark-warm': 'linear-gradient(135deg, #1c1917 0%, #292524 25%, #3f3f46 50%, #525252 75%, #737373 100%)',
        'dark-cool': 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(214, 125, 97, 0.4)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
        'luxury': '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'neon': '0 0 5px rgba(214, 125, 97, 0.5), 0 0 10px rgba(214, 125, 97, 0.3), 0 0 15px rgba(214, 125, 97, 0.2)',
        'elegant': '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'floating': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'deep': '0 32px 64px -12px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(255, 255, 255, 0.03)',
        'ambient': '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'glow-gold': '0 0 20px rgba(197, 160, 89, 0.4)',
        'glow-rose': '0 0 20px rgba(214, 125, 97, 0.4)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.8s ease-out',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
        'gradient-flow': 'gradient-flow 3s ease-in-out infinite',
        'smooth-scroll': 'smooth-scroll 0.3s ease-out',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-out': 'scale-out 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'text-shimmer': 'text-shimmer 2s linear infinite',
        'card-hover': 'card-hover 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'rotate-in': 'rotate-in 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'zoom-in': 'zoom-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'elastic': 'elastic 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'jello': 'jello 0.9s ease-in-out',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
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
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'smooth-scroll': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-30px)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'heartbeat': {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.3)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.3)' },
          '70%': { transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%': { boxShadow: '0 0 20px rgba(214, 125, 97, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(214, 125, 97, 0.8)' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'card-hover': {
          '0%': { transform: 'translateY(0)', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.08)' },
          '100%': { transform: 'translateY(-5px)', boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)' },
        },
        'fade-in-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in-down': {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'rotate-in': {
          '0%': { transform: 'rotate(-10deg) scale(0.9)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'elastic': {
          '0%': { transform: 'scale(0)' },
          '55%': { transform: 'scale(1.15)' },
          '65%': { transform: 'scale(0.95)' },
          '75%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'jello': {
          '0%, 11.1%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '22.2%': { transform: 'skewX(-12.5deg) skewY(-12.5deg)' },
          '33.3%': { transform: 'skewX(6.25deg) skewY(6.25deg)' },
          '44.4%': { transform: 'skewX(-3.125deg) skewY(-3.125deg)' },
          '55.5%': { transform: 'skewX(1.5625deg) skewY(1.5625deg)' },
          '66.6%': { transform: 'skewX(-0.78125deg) skewY(-0.78125deg)' },
          '77.7%': { transform: 'skewX(0.390625deg) skewY(0.390625deg)' },
          '88.8%': { transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(214, 125, 97, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(214, 125, 97, 0.8), 0 0 40px rgba(214, 125, 97, 0.4)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'card-premium': 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
        'card-premium-dark': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        'button-gradient': 'linear-gradient(135deg, #003580, #0f3d66)',
        'button-hover': 'linear-gradient(135deg, #0f3d66, #003580)',
      },
    },
  },
  plugins: [],
};

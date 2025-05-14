/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#0A0F1C',
        'dark-secondary': '#141B2D',
        'dark-tertiary': '#1F2937',
        'dark-quaternary': '#2D3748',
        'dark-text': '#F8FAFC',
        'brand-yellow': '#FCD34D',
        'brand-blue': '#60A5FA',
        'brand-purple': '#A78BFA',
        'brand-teal': '#2DD4BF',
        'brand-pink': '#F472B6',
        'brand-orange': '#FB923C',
        'brand-green': '#4ADE80',
        'brand-red': '#F87171',
      },
      scale: {
        '102': '1.02',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(252, 211, 77, 0.3)',
        'glow-blue': '0 0 20px rgba(96, 165, 250, 0.3)',
        'glow-purple': '0 0 20px rgba(167, 139, 250, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'glass': 'blur(4px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(45deg, rgba(96, 165, 250, 0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(167, 139, 250, 0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(96, 165, 250, 0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(167, 139, 250, 0.1) 75%)',
      },
      backgroundSize: {
        'mesh': '60px 60px',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'scan-line': 'scan-line 4s linear infinite',
        'scan-line-delayed': 'scan-line 5s linear infinite 2s',
        'float-code': 'float-code 8s ease-in-out infinite',
        'shooting-star-fast': 'shooting-star-fast 2s linear infinite',
        'shooting-star-delayed': 'shooting-star-fast 2.5s linear infinite 1s',
        'shooting-star-delayed-2': 'shooting-star-fast 2.2s linear infinite 1.5s',
        'float-slow': 'float-slow 10s ease-in-out infinite',
        'float-slower': 'float-slower 12s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'pulse-ring-delayed': 'pulse-ring 2s ease-out infinite 1s',
        'glitch-star': 'glitch-star 3s ease-in-out infinite',
        'hover-float': 'hover-float 3s ease-in-out infinite',
        'thruster-left': 'thruster-left 0.3s ease-in-out infinite',
        'thruster-right': 'thruster-right 0.3s ease-in-out infinite 0.15s',
        'scan-ring': 'scan-ring 2s ease-in-out infinite',
        'gradient-text': 'gradient-text 4s ease infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
      },
      keyframes: {
        'scan-line': {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        'float-code': {
          '0%, 100%': {
            transform: 'translateY(0) translateX(0)',
            opacity: '0.3',
          },
          '50%': {
            transform: 'translateY(-30px) translateX(10px)',
            opacity: '0.6',
          },
        },
        'shooting-star-fast': {
          '0%': { transform: 'translateX(0) translateY(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'translateX(120vw) translateY(60vh)', opacity: '0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) translateX(15px) rotate(5deg)' },
        },
        'float-slower': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1)' },
          '50%': { transform: 'translateY(-40px) translateX(-20px) scale(1.05)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)' },
          '50%': { boxShadow: '0 0 0 20px rgba(139, 92, 246, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)' },
        },
        'glitch-star': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.5)' },
        },
        'hover-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'thruster-left': {
          '0%, 100%': { opacity: '0.8', transform: 'translateX(-2px) scaleY(1)' },
          '50%': { opacity: '1', transform: 'translateX(-2px) scaleY(1.3)' },
        },
        'thruster-right': {
          '0%, 100%': { opacity: '0.8', transform: 'translateX(2px) scaleY(1)' },
          '50%': { opacity: '1', transform: 'translateX(2px) scaleY(1.3)' },
        },
        'scan-ring': {
          '0%': { transform: 'scale(0.8)', borderColor: 'rgba(34, 211, 238, 0)' },
          '50%': { transform: 'scale(1.2)', borderColor: 'rgba(34, 211, 238, 0.8)' },
          '100%': { transform: 'scale(0.8)', borderColor: 'rgba(34, 211, 238, 0)' },
        },
        'gradient-text': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'border-glow': {
          '0%': { opacity: '0.5' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.5' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
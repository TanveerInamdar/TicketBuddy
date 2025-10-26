/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Defines a keyframe animation for the floating movement of the cowboy
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(5deg)' },
          '50%': { transform: 'translateY(-20px) rotate(-5deg)' },
        },
        // Defines a keyframe animation for moving the star field background
        'space-travel': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        // Additional space cowboy animations
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(147, 51, 234, 0.8)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 5s infinite ease-in-out',
        'space-travel': 'space-travel 120s linear infinite',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
        'orbit': 'orbit 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        deadvox: {
          neon: '#ff007f', // Hot scene pink
          cyan: '#00f0ff', // Cyber cyan
          acid: '#39ff14', // Neon lime
          blood: '#e11d48', // Crimson red
          dark: '#090a10',
          panel: '#10121d',
          card: '#161928',
          border: '#2a2e45',
        }
      },
      fontFamily: {
        msn: ['"Space Grotesk"', '"Segoe UI"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        scream: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translate(-10px, -6px) rotate(-1.5deg)' },
          '20%, 40%, 60%, 80%': { transform: 'translate(10px, 6px) rotate(1.5deg)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(10px)' },
          '70%': { transform: 'scale(1.03) translateY(-2px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(255, 0, 127, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 25px rgba(0, 240, 255, 0.8))' },
        }
      },
      animation: {
        scream: 'scream 0.65s ease-in-out',
        'bounce-in': 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'toast-in': 'toastIn 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      }
    },
  },
  plugins: [],
}

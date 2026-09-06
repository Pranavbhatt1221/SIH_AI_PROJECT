/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060A13',
          900: '#0A1122',
          850: '#0E172C',
          800: '#14213D',
          750: '#1A2B50',
          700: '#223868',
        },
        cyber: {
          blue: '#00F0FF',
          glow: 'rgba(0, 240, 255, 0.3)',
          dark: '#0369a1',
        },
        alert: {
          pass: '#10B981',
          review: '#F59E0B',
          fail: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.25)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#00A1FF',
        deepBlue: '#0A1F3D',
        dark: '#050B14',
        light: '#F5F8FC',
        surface: '#FFFFFF',
        textPrimary: '#101828',
        textSecondary: '#667085',
        textMuted: '#98A2B3',
        border: '#E4E7EC',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(16,24,40,0.06)',
        'floating': '0 12px 40px rgba(16,24,40,0.08)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      keyframes: {
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}

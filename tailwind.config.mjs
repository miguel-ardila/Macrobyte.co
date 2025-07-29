/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para Macrobyte
        'cyan-primary': {
          50: '#f0fdfe',
          100: '#ccfbfc',
          200: '#99f6f9',
          300: '#5eedf3',
          400: '#17D0E3', // Color principal #17D0E3
          500: '#0bbcd1',
          600: '#0d96a5',
          700: '#117886',
          800: '#16606e',
          900: '#165058',
        },
        'dark': {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#000000', // Negro principal
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Orbitron', 'monospace'],
        'modern': ['Poppins', 'sans-serif'],
        'elegant': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #0087ff, 0 0 10px #0087ff, 0 0 15px #0087ff' },
          '100%': { boxShadow: '0 0 10px #0087ff, 0 0 20px #0087ff, 0 0 30px #0087ff' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
} 
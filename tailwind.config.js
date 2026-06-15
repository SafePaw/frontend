/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F2E6B1',
        navy: {
          DEFAULT: '#2A3244',
          70: '#4E5F7A',
          40: '#8D9BB3',
          15: 'rgba(42,50,68,0.15)',
          8: 'rgba(42,50,68,0.08)',
          5: 'rgba(42,50,68,0.05)',
        },
        ok: '#5AB07A',
        warn: '#D99840',
        err: '#D45C5C',
        info: '#4F88CC',
        map: {
          light: '#E8D9A0',
          dark: '#1A2030',
          road: '#C8B870',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
      fontSize: {
        f8: ['8px', { lineHeight: '1.4' }],
        f12: ['12px', { lineHeight: '1.5' }],
        f16: ['16px', { lineHeight: '1.6' }],
        f20: ['20px', { lineHeight: '1.4' }],
        f24: ['24px', { lineHeight: '1.3' }],
        f32: ['32px', { lineHeight: '1.2' }],
        f40: ['40px', { lineHeight: '1' }],
        f48: ['48px', { lineHeight: '1' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '9999px',
      },
      keyframes: {
        'fade-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.82)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        'paw-pop': {
          '0%': { opacity: '0', transform: 'scale(0) rotate(-15deg)' },
          '65%': { opacity: '1', transform: 'scale(1.15) rotate(4deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        'paw-pulse': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.75)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'paw-step': {
          '0%':   { opacity: '0', transform: 'scale(0.5)' },
          '8%':   { opacity: '1', transform: 'scale(1.1)' },
          '17%':  { opacity: '1', transform: 'scale(1)' },
          '27%':  { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '0', transform: 'scale(0.85)' },
        },
        'body-expand': {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '15%':  { opacity: '1', transform: 'scale(1.2)' },
          '40%':  { opacity: '1', transform: 'scale(1)' },
          '58%':  { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '0', transform: 'scale(0.85)' },
        },
        sniff: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '35%': { transform: 'translateY(-3px)' },
          '65%': { transform: 'translateY(-1px)' },
        },
      },
      animation: {
        'fade-scale-in': 'fade-scale-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
        'fade-up': 'fade-up 0.5s ease-out both',
        breathe: 'breathe 3.5s ease-in-out infinite',
        'paw-pop': 'paw-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
        'paw-pulse': 'paw-pulse 1.4s ease-in-out infinite',
        'paw-step': 'paw-step 2.4s ease-in-out infinite',
        'body-expand': 'body-expand 2.4s ease-in-out infinite',
        sniff: 'sniff 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

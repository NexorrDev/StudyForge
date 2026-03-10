import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        void: '#06060C',
        deep: '#0C0C18',
        surface: '#111122',
        card: '#161628',
        border: 'rgba(120,100,255,0.12)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'orb-drift': 'orbDrift 20s ease-in-out infinite',
        'streak-flame': 'streakFlame 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease both',
        'card-appear': 'cardAppear 0.5s ease both',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseGlow: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        orbDrift: { '0%': { transform: 'translate(0,0)' }, '33%': { transform: 'translate(30px,-20px)' }, '66%': { transform: 'translate(-20px,15px)' }, '100%': { transform: 'translate(0,0)' } },
        streakFlame: { '0%,100%': { transform: 'scaleY(1) scaleX(1)' }, '25%': { transform: 'scaleY(1.1) scaleX(0.95)' }, '75%': { transform: 'scaleY(0.95) scaleX(1.05)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        cardAppear: { from: { opacity: '0', transform: 'translateY(16px) scale(0.97)' }, to: { opacity: '1', transform: 'translateY(0) scale(1)' } },
      },
    },
  },
  plugins: [],
};
export default config;

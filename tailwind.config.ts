import type { Config } from 'tailwindcss';

export default {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0d12',
          panel: '#0f1218',
          subtle: '#141823',
        },
        border: {
          DEFAULT: '#1c2230',
          strong: '#2a3245',
        },
        accent: {
          DEFAULT: '#7c5cff',
          fg: '#ffffff',
        },
        text: {
          DEFAULT: '#e6e8ee',
          muted: '#8a93a6',
          subtle: '#5b6478',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;

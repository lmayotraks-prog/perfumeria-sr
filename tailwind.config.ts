import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '380px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      colors: {
        obsidian: {
          950: '#040404',
          900: '#0b0a09',
          800: '#151310',
          700: '#1d1a16',
          600: '#2a251f',
          500: '#3d362e',
        },
        alabaster: {
          50:  '#fcfaf6',
          100: '#f7f3ec',
          200: '#efe8db',
          300: '#e2d7c4',
          400: '#c9bcab',
          500: '#a99c8c',
        },
        gold: {
          50:  '#fdf9ec',
          100: '#faf0d0',
          200: '#f3df9e',
          300: '#e8c768',
          400: '#d4ab4c',
          500: '#b88e34',
          600: '#977024',
          700: '#76551b',
          800: '#5a3f15',
          900: '#422e10',
          luxury: '#b88e34',
          warm:   '#c9a145',
          bright: '#e8c768',
          muted:  '#8a6e3a',
          shine:  '#f7e4a3',
        },
      },
      fontFamily: {
        serif:  ['Cormorant Garamond', 'Georgia', 'serif'],
        script: ['Great Vibes', 'cursive'],
        sans:   ['Montserrat', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config

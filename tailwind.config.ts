import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: '#1E3A5F',
        'navy-light': '#2A4F80',
        teal: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
        },
      },
    },
  },
  plugins: [],
}
export default config

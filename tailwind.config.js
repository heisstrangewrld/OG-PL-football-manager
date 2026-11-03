/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: '#131B26',
        surfaceHover: '#1B2535',
        border: '#1F2C3F',
        pitch: {
          grass: '#1E4620',
          line: '#38763A',
          darkGrass: '#173819',
        },
        pl: {
          purple: '#38003C',
          cyan: '#00FF87',
          pink: '#E90052',
          yellow: '#FFF800',
        },
      },
    },
  },
  plugins: [],
};

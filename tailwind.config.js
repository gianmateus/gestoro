/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Restaurant theme colors - warm and professional
        primary: {
          50: '#fdf4f3',
          100: '#fbe8e6',
          200: '#f7d5d2',
          300: '#f0b7b2',
          400: '#e68f88',
          500: '#d96d62',
          600: '#c54f42',
          700: '#a53e34',
          800: '#873630',
          900: '#71322e',
          950: '#3d1814',
        },
        secondary: {
          50: '#f7f8f8',
          100: '#edeef1',
          200: '#d7dbe0',
          300: '#b4bcc6',
          400: '#8b96a7',
          500: '#6c798b',
          600: '#586374',
          700: '#4a515e',
          800: '#40454f',
          900: '#383c44',
          950: '#25282c',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 
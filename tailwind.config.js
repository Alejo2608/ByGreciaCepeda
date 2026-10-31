/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta tomada del catálogo de maquillaje (monocromática).
        paper: '#F4F4F7',
        mist: '#ECEBED',
        ink: '#343434',
        accent: '#545454',
        // Tonos suaves para separar cada presentación, dentro de la misma familia gris.
        warm: '#F2EEEB',
        cool: '#EBEFF2',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
        script: ['"Beau Rivage"', 'cursive'],
      },
    },
  },
  plugins: [],
}

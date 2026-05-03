export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0c',
        card: '#151518',
        textMain: '#ffffff',
        muted: '#8a8a93',
        primary: '#00e5ff',
        secondary: '#b500ff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

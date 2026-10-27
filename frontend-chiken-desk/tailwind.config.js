/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // el ThemeService alterna la clase "dark" en <html>
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E7264D', // rojo principal (sidebar activo, botones CTA)
          hover: '#CE1F42',
        },
        surface: {
          light: '#FDF1F1',      // fondo general modo claro (rosado cálido)
          'light-card': '#FFFFFF',
          dark: '#0A0E17',       // fondo general modo oscuro
          'dark-card': '#131826',
          'dark-border': '#1F2637',
        },
      },
      borderRadius: {
        xl2: '1.1rem',
      },
    },
  },
  plugins: [],
};

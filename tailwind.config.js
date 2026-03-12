/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: {
    // Disable Tailwind's base reset (preflight) to avoid conflicts with
    // Bootstrap 3 which is still loaded globally. Once Bootstrap is removed,
    // this can be re-enabled.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Palace brand colors as Tailwind tokens — mirrors src/stylesheets/colors.scss
        palace: {
          "blue-dark": "#242DAB",
          blue: "#6875C5", // tint($blue-dark, 35%)
          "blue-light": "#46BBE5",
          "green-bright": "#008918",
          "green-muted": "#809F69",
          "green-tint": "#F3F7E6",
          red: "#D0343A",
          "red-dark": "#97272C",
          "light-gray": "#D7D4D0",
          "medium-gray": "#DDD",
          "dark-gray": "#080807",
          "gray-tint": "#F5F5F4",
          "gray-border": "#CCCCCC",
          yellow: "#FEE24A",
        },
      },
      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

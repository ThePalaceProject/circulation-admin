/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: {
    // Preflight (base reset) is disabled while bootstrap-compat.scss provides
    // the foundational typography layer that was previously Bootstrap's job.
    // Re-enable preflight and remove the base-typography section from
    // bootstrap-compat.scss once visual parity has been confirmed in the browser.
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

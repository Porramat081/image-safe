// frontend/postcss.config.js
// PostCSS pipeline Next.js runs over globals.css. Tailwind is a PostCSS plugin;
// autoprefixer adds vendor prefixes.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

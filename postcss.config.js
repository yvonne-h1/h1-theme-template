/*
 * Overview of postcss-preset-env features:
 * https://github.com/csstools/postcss-plugins/blob/main/plugin-packs/postcss-preset-env/FEATURES.md
 *
 * Syntax should be scss so inline comments work
 * https://github.com/postcss/postcss-scss
 */

const postcssImport = require('postcss-import');
const tailwindCss = require('tailwindcss');
const presetEnv = require('postcss-preset-env');

module.exports = {
  syntax: 'postcss-scss',
  parser: 'postcss-scss',
  plugins: [
    postcssImport(),
    tailwindCss(),
    presetEnv({
      stage: 2,
      features: {
        'dir-pseudo-class': true,
        'cascade-layers': false,
        'nesting-rules': false,
      },
      autoprefixer: {},
    }),
  ],
};

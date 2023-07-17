/**
 * https://tailwindcss.com/docs/configuration
 */

const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');

// Tailwind Config
module.exports = {
  /**
   * Which files are watch by tailwind
   */
  content: [
    './dev/scss/**/*.scss',
    './dev/js/**/*.js',
    './theme/layout/*.liquid',
    './theme/sections/*.liquid',
    './theme/snippets/*.liquid',
    './theme/templates/**/*.liquid',
  ],
  /**
   * Containers and site center
   * Default Tailwind container is disabled
   * Usage: format-container
   */
  corePlugins: {
    container: false,
  },
  theme: {
    /**
     * Default screen sizes
     * Usage: md:[class-name] or @screen md { ... your css }
     * Advice: Adjust according to design but keep when possible
     */
    screens: {
      xs: '360px',
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1680px',
      '4xl': '1920px',
      '5xl': '2000px',
    },
    /**
     * Font family's
     * Usage: font-body
     * Advice: Adjust to project needs in html-head-colors.liquid
     */
    fontFamily: {
      body: 'var(--font-body-family)',
      heading: 'var(--font-heading-family)',
    },
    /**
     * Default font sizes
     * Usage text-base
     * Default line height is set on the body
     * Exceptions in line-height text-base leading-tight
     * Advice: leave as it is
     */
    fontSize: {
      '2xs': '0.625rem',
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
    },
    /**
     * Colors
     * We extend the tailwind colors with our own colors
     * Usage: text-primary, bg-secondary, bg-gray-500
     * Advice: Adjust to project needs
     */
    colors: {
      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      white: 'var(--color-white)',
      gray: colors.neutral,
      black: 'var(--color-black)',
      primary: {
        DEFAULT: 'var(--color-primary)',
        text: 'var(--color-primary-text)',
        50: 'var(--color-primary-50)',
        100: 'var(--color-primary-100)',
        200: 'var(--color-primary-200)',
        300: 'var(--color-primary-300)',
        400: 'var(--color-primary-400)',
        500: 'var(--color-primary-500)',
        600: 'var(--color-primary-600)',
        700: 'var(--color-primary-700)',
        800: 'var(--color-primary-800)',
        900: 'var(--color-primary-900)',
      },
      secondary: {
        DEFAULT: 'var(--color-secondary)',
        text: 'var(--color-secondary-text)',
        50: 'var(--color-secondary-50)',
        100: 'var(--color-secondary-100)',
        200: 'var(--color-secondary-200)',
        300: 'var(--color-secondary-300)',
        400: 'var(--color-secondary-400)',
        500: 'var(--color-secondary-500)',
        600: 'var(--color-secondary-600)',
        700: 'var(--color-secondary-700)',
        800: 'var(--color-secondary-800)',
        900: 'var(--color-secondary-900)',
      },
      accent: {
        DEFAULT: 'var(--color-accent)',
        text: 'var(--color-accent-text)',
        50: 'var(--color-accent-50)',
        100: 'var(--color-accent-100)',
        200: 'var(--color-accent-200)',
        300: 'var(--color-accent-300)',
        400: 'var(--color-accent-400)',
        500: 'var(--color-accent-500)',
        600: 'var(--color-accent-600)',
        700: 'var(--color-accent-700)',
        800: 'var(--color-accent-800)',
        900: 'var(--color-accent-900)',
      },
      info: 'var(--color-info)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      danger: 'var(--color-danger)',
    },
    extend: {
      /**
       * Extend content classes
       * Results in content: ''
       * Usage: before:content-empty
       */
      content: {
        empty: "''",
      },
      spacing: {
        'element-spacing': 'var(--element-spacing)',
      },
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'offcanvas-backdrop': '1040',
        offcanvas: '1045',
        'modal-backdrop': '1050',
        modal: '1055',
        popover: '1070',
        tooltip: '1080',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-counters': 'color: inherit',
            '--tw-prose-bullets': 'color: inherit',
            '--tw-prose-links': 'color: var(--text-primary-500)',
            color: 'var(--text-color-default)',
            a: {
              color: 'var(--text-primary-500)',
              textDecoration: 'none',
              '&:hover': {
                color: 'var(--text-primary-800)',
                textDecoration: 'underline',
              },
            },
            p: {
              marginBottom: '1rem',
            },
          },
        },
      }),
    },
  },
  plugins: [
    /**
     * Forms
     * More info: https://github.com/tailwindlabs/tailwindcss-forms
     */
    require('@tailwindcss/forms'),

    /**
     * Line-clamp
     * More info: https://tailwindcss.com/docs/typography-plugin
     */
    require('@tailwindcss/typography')({
      // Change .prose to .rte. This is needed because Shopify is using the .rte class in some templates that we can't change.
      className: 'rte',
    }),

    /**
     * Plugin
     * Extend tailwind with javascript
     * More info: https://tailwindcss.com/docs/plugins
     */
    plugin(function ({ addBase, addComponents, addUtilities, addVariant, theme }) {
      /**
       * Utilities
       * Add base color classes that can be reused for certain specific css selectors
       * Usage: bg-color-default, text-link-color, states:text-link-color-states
       */
      addUtilities({
        '.bg-color-default': {
          backgroundColor: 'var(--bg-color-default)',
        },
        '.text-color-default': {
          color: 'var(--text-color-default)',
        },
        '.text-color-gradient': {
          backgroundImage: 'var(--color-primary-gradient)',
        },
        '.text-color-light': {
          color: 'var(--text-color-light)',
        },
        '.text-link-color': {
          color: 'var(--text-link-color)',
        },
        '.text-link-color-states': {
          color: 'var(--text-link-color-states)',
        },
        '.border-color-default': {
          borderColor: 'var(--border-color-default)',
        },
        '.gap-base': {
          gap: 'var(--grid-row-gap) var(--grid-col-gap)',
        },
        '.gap-x-base': {
          columnGap: 'var(--grid-col-gap)',
        },
        '.gap-y-base': {
          rowGap: 'var(--grid-row-gap)',
        },
      });

      /**
       * Variants
       * Create a combined variant for active, focus and hover
       * Usage: :states[class-name]
       * Create a combined variant for js and no-js, class will be applied in html-head-js
       * Usage: :no-js[class-name]
       * Create a combined variant for touch and no-touch, class will be applied in html-head-js
       * Usage: :touch[class-name]
       */
      addVariant('states', ['&:hover', '&:focus', '&:active']);
      addVariant('js', ['.js &']);
      addVariant('no-js', ['.no-js &']);
      addVariant('touch', ['.touch &']);
      addVariant('no-touch', ['.no-touch &']);
      addVariant('disabled', ['&:disabled', '&.disabled']);
    }),
  ],
};

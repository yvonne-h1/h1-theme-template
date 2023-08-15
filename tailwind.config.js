/**
 * https://tailwindcss.com/docs/configuration
 *
 * Examples:
 *  - use opacity with one of the predefined colors:  color: theme(colors.primary.500 / 75%); // here 75% is the opacity value
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
   * Usage: render-container-content
   */
  corePlugins: {
    container: false,
  },
  theme: {
    /**
     * Default screen sizes
     * Usage: md:[class-name] or @screen md { ... your css }
     *
     * It's recommended to not change these
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
     * Usage: font-body, font-heading
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
     *
     * It's recommended to not change these
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
    extend: {
      /**
       * Extend content classes
       * Results in content: ''
       * Usage: before:content-empty
       */
      content: {
        empty: '\'\'',
      },
      height: {
        '80vh': '80vh',
        '90vh': '90vh',
      },
      maxHeight: {
        '80vh': '80vh',
        '90vh': '90vh',
      },
      spacing: {
        'element-spacing': 'var(--element-spacing)',
      },
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.gray.100'),
      }),
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
            '--tw-prose-links': theme('colors.primary.600'),
            '--tw-prose-counters': theme('colors.primary.600'),
            '--tw-prose-bullets': theme('colors.primary.600'),
            '--tw-prose-quote-borders': theme('colors.primary.600'),
            color: theme('colors.text'),
            a: {
              color: theme('colors.primary.600'),
              textDecoration: 'underline',
              transition: 'all .2s',
              '&:hover': {
                color: theme('colors.primary.700'),
                textDecoration: 'none',
              },
            },
          },
        },
      }),
    },
    /**
     * Colors
     * Extend the tailwind colors with our own colors for primary, secondary and accent.
     * Usage: text-primary, bg-secondary
     * Resources: Use https://www.tailwindshades.com/ to create shades based on your colors. Note that 500 should be your base color.
     */
    colors: {
      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      white: '#FFFFFF',
      black: '#111',
      text: '#262626',
      'primary-gradient': 'linear-gradient(90deg,#e42f26 0,#e46a26)',
      primary: {
        text: '#FFFFFF',
        DEFAULT: '#E42F26',
        50: '#F8CCC9',
        100: '#F6BAB7',
        200: '#F29793',
        300: '#ED756F',
        400: '#E9524A',
        500: '#E42F26',
        600: '#BB1F17',
        700: '#891711',
        800: '#570E0B',
        900: '#250605',
        950: '#0C0201',
      },
      secondary: {
        text: '#FFFFFF',
        DEFAULT: '#212529',
        50: '#73818E',
        100: '#6A7783',
        200: '#58626D',
        300: '#454E56',
        400: '#333940',
        500: '#212529',
        600: '#08090A',
        700: '#000000',
        800: '#000000',
        900: '#000000',
        950: '#000000',
      },
      accent: {
        text: '#FFFFFF',
        DEFAULT: '#E46A26',
        50: '#F8DAC9',
        100: '#F6CEB7',
        200: '#F2B593',
        300: '#ED9C6F',
        400: '#E9834A',
        500: '#E46A26',
        600: '#BB5217',
        700: '#893C11',
        800: '#57260B',
        900: '#251005',
        950: '#0C0501',
      },
      gray: {
        DEFAULT: '#1D1C1D',
        50: '#F5F5F5',
        100: '#E9E8E9',
        200: '#D0CED0',
        300: '#B7B4B7',
        400: '#9E9A9E',
        500: '#858085',
        600: '#6B676B',
        700: '#514E51',
        800: '#373537',
        900: '#1D1C1D',
        950: '#100F10',
      },
      info: '#0dcaf0',
      success: '#198754',
      warning: '#ffc107',
      danger: '#dc3545',
    },
  },
  plugins: [
    /**
     * Forms
     * More info: https://github.com/tailwindlabs/tailwindcss-forms
     */
    require('@tailwindcss/forms'),

    /**
     * Typography
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
      /*
       Style base classes
      */
      addBase({
        p: {
          marginBottom: '1rem',
          '&:last-child': {
            marginBottom: 0,
          },
        },
        hr: {
          backgroundColor: 'currentColor',
          marginBlock: '40px',
          display: 'block',
          height: '1px',
          border: 'none',
        },
        table: {
          wordBreak: 'break-word',
        },
        a: {
          color: theme('colors.primary.600'),
          textDecoration: 'underline',
          transition: 'all .2s',
          '&:hover': {
            color: theme('colors.primary.700'),
            textDecoration: 'none',
          },
        },
        dt: {
          margin: 0,
        },
        dd: {
          margin: 0,
        },
      }),

      /**
         * Utilities
         * Add base color classes that can be reused for certain specific css selectors
         * Usage: bg-color-default, text-link-color, states:text-link-color-states
         */
      addUtilities({
        '.bg-color-default': {
          backgroundColor: theme('colors.white'),
        },
        '.text-color-default': {
          color: theme('colors.text'),
        },
        '.text-color-gradient': {
          backgroundImage: theme('colors.primary-gradient'),
          color: theme('colors.black'),
        },
        '.text-link-color': {
          color: theme('colors.primary.600'),
        },
        '.text-link-color-states': {
          color: theme('colors.primary.600'),
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
       */
      // Create a combined variant for active, focus and hover
      addVariant('states', ['&:hover', '&:focus', '&:active']);
      addVariant('group-states', [
        ':merge(.group):hover &',
        ':merge(.group):focus &',
        ':merge(.group):active &',
      ]);
      //  Create a combined variant for js and no-js, class will be applied in html-head-js
      addVariant('js', ['.js &']);
      addVariant('no-js', ['.no-js &']);
      // Create a combined variant for touch and no-touch, class will be applied in html-head-jsVariant('touch', ['.touch &']);
      addVariant('touch', ['.touch &']);
      addVariant('no-touch', ['.no-touch &']);
      // Create a combined variant for disabled, class will be applied in html-head-jsVariant('touch', ['.touch &']);
      addVariant('disabled', ['&:disabled', '&.disabled', '&[aria-disabled="true"]']);
    }),
  ],
};

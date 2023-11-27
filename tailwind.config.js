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
      xs: '420px',
      sm: '580px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1680px',
      '4xl': '1920px',
      '5xl': '2000px',
    },
    /**
     * Font families
     * Usage: font-body, font-heading
     */
    fontFamily: {
      body: 'var(--font-body-family)',
      heading: 'var(--font-heading-family)',
    },
    /**
     * Default font sizes
     * Usage text-base, text-sm, etc.
     * Default line height is set on the body
     * Exceptions can be made with leading-tight, leading-wider, etc.
     *
     * It's recommended to not change these values
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
        screen: ['100vh', '100dvh'],
      },
      maxWidth: {
        screen: ['100vw', '100dvw'],
        'content-width': '1440px',
        'content-width-lg': '1200px',
        'content-width-md': '820px',
        'content-width-sm': '620px',
      },
      maxHeight: {
        '80vh': '80vh',
        '90vh': '90vh',
        screen: ['100vh', '100dvh'],
      },
      minHeight: {
        screen: ['100vh', '100dvh'],
        'mobile-menu': ['calc(100vh - 72px)', 'calc(100dvh - 72px)'],
      },
      spacing: {
        'content-wrapper-padding': 'var(--content-wrapper-padding)',
        'container-spacing': 'var(--container-spacing)',
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
      /* Animations
      ** Based on keyframes
      */
      animation: {
        fadein: 'fadein .25s cubic-bezier(0, 0, 0.3, 1) calc(var(--animation-delay) * 75ms) 1 forwards',
        zoomout: 'zoomout .5s cubic-bezier(0.5, 1, 0.89, 1) .2s 1 forwards',
      },
      keyframes: ({ theme }) => ({
        fadein: {
          '0%': { opacity: 0,
            transform: 'translateY(20px)' },
          '100%': { opacity: 1,
            transform: 'translateY(0)' },
        },
        zoomout: {
          '0%': { opacity: 0,
            transform: 'scale(1.25)' },
          '100%': { opacity: 1,
            transform: 'scale(1)' },
        },
      }),
      typography: theme => ({
        DEFAULT: {
          css: {
            '--tw-prose-links': theme('colors.primary.600'),
            '--tw-prose-counters': theme('colors.primary.600'),
            '--tw-prose-bullets': theme('colors.primary.600'),
            '--tw-prose-quote-borders': theme('colors.primary.600'),
            color: theme('colors.text-default'),
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
     * Usage: text-primary, bg-secondary, etc.
     * Resources: Use https://www.tailwindshades.com/ to create shades based on your colors. Note that 500 should be your base color.
     */
    colors: {
      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      white: '#FFFFFF',
      'bg-default': '#FFFFFF',
      black: '#111',
      'text-default': '#262626',
      'primary-gradient': {
        DEFAULT: 'linear-gradient(90deg,#e42f26 0,#e46a26)',
        bg: 'linear-gradient(90deg, #e42f26, #e46a26 50%, #e42f26) 0/200%',
        'bg-hover': 'linear-gradient(90deg, #e42f26, #e46a26 50%, #e42f26) 100%/200%',
      },
      primary: {
        text: '#FFFFFF',
        DEFAULT: '#C82019',
        50: '#F8CCC9',
        100: '#F6BAB7',
        200: '#F29793',
        300: '#ED756F',
        400: '#E9524A',
        500: '#C82019',
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
        text: '#FFFFFF',
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
    plugin(function ({ addBase, addUtilities, addVariant, theme }) {
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
         * Usage: bg-bg-default
         */
      addUtilities({
        '.text-color-gradient': {
          backgroundImage: theme('colors.primary-gradient.DEFAULT'),
          color: theme('colors.black'),
        },
        '.ellipsis': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
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
      // Create a combined variant for active, focus and hover, use as states:class-when-hovered-focused-and-active
      addVariant('states', ['&:hover', '&:focus', '&:active']);
      addVariant('group-states', [
        ':merge(.group):hover &',
        ':merge(.group):focus &',
        ':merge(.group):active &',
      ]);
      //  Create a  variant for js and no-js, class will be applied in html-head-js and can be used with js:class-for-js or no-js:class-for-no-script
      addVariant('js', ['.js &']);
      addVariant('no-js', ['.no-js &']);
      // Create a combined variant for touch and no-touch, class will be applied in html-head-js and can be used as touch:class-for-touch-devices
      addVariant('touch', ['.touch &']);
      addVariant('no-touch', ['.no-touch &']);
      // Create a combined variant for disabled. Use as disabled:disabled-class
      addVariant('disabled', ['&:disabled', '&.disabled', '&[aria-disabled="true"]']);
    }),
  ],
};

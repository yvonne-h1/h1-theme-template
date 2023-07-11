# CBT Instructions

---

## Developing

When you run `npm run start` the work files will be watched for change and an [Shopify development theme](https://shopify.dev/themes/tools/cli#development-themes) will be created. The theme/assets folder is not rebuilt from scratch. We configured the development themes with editor syncing. This means that all your changes made inside the customizer from your development theme will be synced to your local data JSON files.

With `npm run start:dev` or `npm run start:stage` you can shortcut the prompt and directly use the dev or stage environment. We don't create this command for live environments.

---

## Deploying

Rollup.js is responsible for the build and watching the process of all CSS / JS and assets. On every production build the theme/assets folder will be cleaned up and rebuilt again with the files inside the dev/assets, dev/js, and dev/scss folders. We use the .env file to manage the different deploy environments.

### Managing environments

The .env file holds all the stores/environments where the storefront is used. Think about the dev, stage, and live environments. Since we use [Shopify CLI 3](https://shopify.dev/docs/themes/tools/cli) it's needed to prompt each CLI command for the store you want to use. When you use one of the CLI commands from the package.json you will be asked which store you want to use from the .env file. The file shops.js in your root is responsible for the options available.

_Note that the .env file is pushed to Git. It's common to use the .env files also  for secret keys and to not push it to Git. We only use it to show the stores that are using this theme. That's why we push it to Git

### Deploy commands

For deploying themes we have a few commands. These are the most important.

- `npm run start:pull` Is used to pull a theme with all data saved inside the JSON files.
- `npm run start:push` Is used to push your code changes to an existing theme without the data saved inside the JSON files.
- `npm run start:upload` Is used to upload a new theme to a store with all your code changes including the data saved inside the JSON files.

_All templates are JSON files, where each template has its own settings stored in this specific JSON file. All template JSON files are therefore ignored in the pull and push process to make sure no changes are overwritten on either side.

---

## Rules for writing code

- Code is written to last. Use comments as much as possible and don't use hacks to fix issues.
- Use sections and blocks to allow the client the freedom to adjust their theme.
- Don't use third-party libraries, unless absolutely necessary.
- DRY coding. Use snippets for repeating code.

### Styles

- We prefer to use mostly Tailwind classes and work **utility first**.
- To prevent CLS we write all our layout, spacing, sizing, and font classes directly on the Liquid. This can be done by using format container, site center, site spacing classes or one of the Tailwind classes.
- We apply [BEM](https://getbem.com/) classes to every element for readability and to find things back. It can be that no style is applied on this class.
- We work mobile-first. Use @screen md { ... your css } and md:[your-class] to define CSS on breakpoints. More info: [screen directive](https://Tailwindcss.com/docs/functions-and-directives) and [customize screens](https://Tailwindcss.com/docs/screens)
- We write modern css based on the [postcss-preset-env](https://github.com/csstools/postcss-preset-env). All features in stage 2 are supported.
- If you need to repeat your classes inside a section then consider:
  - Usage of a loop
  - Split bigger components into smaller components with liquid snippets. **Max snippet depth is 4 for performance.**
  - Create a [BEM](https://getbem.com/) class with related SCSS that's loaded from the dynamic folder
  - If it applies on (almost) every page then you can consider adding it to the main CSS. Be very strict with this.
- If you need to apply classes based on an if statement then keep the if statement outside the `class=""` property.
- Because Tailwind uses a regex expression to recognize the classes used in your project, all Tailwind classes must be fully written out. So don't use font-[{{- size -}}] but use font-xs so that the class can be recognized by Tailwind.
- Tailwind searches for classes inside the folders defined inside the Tailwind config content object.
- Classes inside the Shopify schema's will be recognized.
- Prettier is used to optimize the CSS and to reorder the tailwind classes on file safe. Note that the automatic reordering of tailwind classes does not work inside liquid capture statements.

### Javascript

- JS is written in vanilla javascript. Don't use jQuery in your project.
- Javascript should be only loaded inside the section where it's needed. Except for the global javascript.
- We prefer to write javascript in [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).
- JS is optimized by [TerserJS](https://github.com/terser/terser). Modern JS is the rule.
- Eslint is used to check your javascript code for mistakes and typos.
- Prettier formats your javascript code on safe.
- Third-party javascript needed for the frontend in the project is added to the dependencies inside the package.json or inside the dev/assets/js/ext folder. This will not be optimized by Terser. Try to don't use third-party libraries that are loading jQuery.
- Always inform your client about performance issues.

---

## Tailwind and Layers

We use [tailwind](https://tailwindcss.com/docs/) for the theme styling.

### Tailwind config

The Tailwind config can be extended to the project's needs.
Components, Utilities, and variants added to the config are available inside intellisense. Be strict on your tailwind config extensions. But feel free to extend the fonts, text sizes, and colors for your project needs.

[More info](https://Tailwindcss.com/docs/configuration)

### Tailwind layers

Tailwind uses the \``@layer`\` directive to tell Tailwind on which â€œbucketâ€ a set of custom styles belong to. Valid taiwlind layers are \``base`\`, \``components`\`, and \``utilities`\`.

Tailwind will automatically move the used classes to the right @layer tailwind directive, so you donâ€™t have to worry about authoring your CSS in a specific order to avoid specificity issues.

[More info](https://Tailwindcss.com/docs/functions-and-directives)

### Code layers

Tailwind uses its layer directives purely so that its processor knows where and in what order to print the styles added. In addition, Tailwind is a utility-first CSS framework. This means there is no very specific CSS (`.container.container--full`). Since the CBT has components that print slightly more specific code, we are forced to create and render the different CSS in cascade layers. So we can set the importance of the CSS. This prevents problems with utility classes being not specified again and CSS added by third-party libraries.

The dev/scss folder is divided in three folders to give you to possibility to optimise your CSS easily

- The `dynamic` folder adds CSS that will be added dynamically to your page.
- The `main` folder loads all critical CSS.
- The `mixins` folder is used for SCSS mixins that can be used inside the other CSS files.

Inside these folders you have different folders that correspond with the tailwind layers. In each file you should wrap your code inside the corresponding `@layer ... { }`. All the layers will be rendered in order inside the browser. So for the browser `code-base` is the most less important layer and `code-sections` the most important.

- The `code-base` layer injects base styling and resets added by the tailwind algorithm and the scss/main/base folder.
- The `code-modules` is used to add third party CSS from the dynamic/modules folder like SwiperJs or Fancybox. The intention is that you only import files here and do not apply any custom styling. That's how we keep the hierarchy intact. To apply custom styling to a third-party library you can use the component layer.
- The `code-components` layer injects components classes added by the tailwind algorithm, the scss/main/components folder, and the scss/dynamic/components folder. You can choose by loading your component dynamic or critical. Use critical only for styles that are used really often, for example, a button.
- The `code-utilities` layer injects utility classes added by the tailwind algorithm and the scss/main/utilities folder. This layer utilizes the biggest Tailwind power. All utility classes from tailwind will be rendered in here. For example `text-md`, `bg-primary`, and `states:underline`.
- The `code-sections` layer is used to add custom section styling that cannot be easily done with component or utilities classes. For example, add a color scheme update for a product card inside the code-sections directive. You should be very strict with this layer.

---

## Prettier

Prettier is used to format your liquid, SCSS, and javascript automatically. So we use the same coding standards and output consistent code.
[More info](https://prettier.io/)

---

## Theme check

All code that we write should be written following the Shopify principles. These can be checked with the `npm run stcheck`. All liquid will be checked on syntax errors, missing templates, unused variables, deprecated code, and performance issues. The CBT is default theme check ready. Make sure your write clean code by doing a check inside a QA.

[More info](https://shopify.dev/themes/tools/theme-check)

---

## Styleguide

We strive to work for the smallest to the biggest elements. For this workflow, we need to adjust and create all style guide-related elements for the project first. After that, you will use the style guide classes and components inside the other store components. Your PM should arrange your style guide tickets first.

### Colors

- The branding colors for the project can be set inside html-head-colors.liquid
- Inside Tailwind.config.js (theme.extend.colors) we transform the branding colors set inside html-head-colors.liquid to Tailwind classes.
- Inside Tailwind.config.js (plugins addUtilities) we add the base branding colors as utility classes so you can use these directly.
- With the settings-schema.json (branding section) you can make the colors optional and customizable in the customizer.
- The color schemes can be set inside the tailwind utility layer (scss/main/utilities/color-schemes.scss).

### Typography

- Fonts will be defined inside html-head-fonts.liquid. By default we have defined a heading and body font. This can be a Shopify, Google or custom fonts.
- Inside Tailwind.config.js (theme.fontFamily) e transform the branding fonts set inside html-head-fonts.liquid to Tailwind variables.
- Inside Tailwind.config.js (theme.fontSizes) the default body font sizes are defined for the project. We use the sizes from Tailwind. The line-height is set on the body, exceptions can be set with the leading- class from Tailwind.
- The utility class `.text-...` applies only a font-size. The default line height is set on the `html` tag. Overwite for line-heights can be applied with the `leading-...` classes
- Heading styles can be defined inside headings.scss.
- Rte styles can be set inside rte.scss and are based on tailwind prose.
- With label.scss you can define custom text label styling. Here you can make typography styles that do a little bit more then font-size only. For example letter-spacing, font-weight or capitalize.

### Layout

- Screen sizes for breakpoints are defined inside Tailwind.config (theme.screens).
- Common variables for the layout are set inside root-variables.scss.
- We use the format-container.liquid snippet to align each section the same way.
- Inside container.scss, site-center.scss and site-spacing.scss the layout system classes are build.

### Logo, favicons & webmanifest

- The logo is inside global-logo.liquid and is defined as a svg as possible
- Favicons / touch icons and the webmanifest can be generated with [real favicon generator](https://realfavicongenerator.net/) and are placed inside the dev/assets folder. Make sure you use the liquid asset filter and customizer settings inside the webmanifest and browser config file.

### Icons

- We have divided the SVG icons in three section: UI, Payment and socials. The icons can be changed inside the global-icon-[type].liquid file.
- The icons sizes are defined inside icons.scss
- The size can be given to each icon with icon_class property. For example `icon_class: 'w-3 md:w-3'`

### Images

- Images are loaded with format-image.liquid. Here you can lazy load the images, preserve space for cls and optimize for all screen sizes.
- Load images lazy by default. Images above the fold don't need to be lazy.
- Create for sections create a lazy option in the customizer.
- Placeholders are set inside

### Buttons

- Buttons can be styled inside buttons.scss. We have different color schemes, sizes, and types of buttons.
- The default challenge and quick payment button from Shopify should also be styled here.

### Components

Because we work from the smallest component to the biggest element it's good to style all your base components separately so you can reuse it for future use.

- Product cards
- Article cards
- Banners
- Badges
- Prices
- Quantity selector
- Forms
- Collapsibles
- Variants/product options
- Pagination
- Project-related components

---

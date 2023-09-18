# H1 Default Theme Instructions

---

## Developing

When you run `npm run start` the work files will be watched for change and an [Shopify development theme](https://shopify.dev/themes/tools/cli#development-themes) will be created. The theme/assets folder is not rebuilt from scratch. We configured the development themes with editor syncing. This means that all your changes made inside the customizer from your development theme will be synced to your local data JSON files.

With `npm run start:dev` or `npm run start:stage` you can shortcut the prompt and directly use the dev or stage environment.

---

## Deploying

Rollup.js is tasked with handling the building and monitoring of all CSS, JS, and assets. During each production build, the theme/assets folder is cleared and then reconstructed using the files from the dev/assets, dev/js, and dev/scss folders. Our deployment environments are managed through the .env file.

### Managing environments

The .env file serves as a repository for all the stores/environments where the storefront is utilized. These environments typically include the development (dev), staging (stage), and live environments. We rely on [Shopify CLI 3](https://shopify.dev/docs/themes/tools/cli) and it necessitates requesting the store information with each CLI command. Consequently, when running CLI commands specified in the package.json, you will be prompted to select the store from the options listed in the .env file. The file shops.js in the root directory is responsible for managing and providing these available store options.

It's important to note that although the .env file is pushed to Git, it is commonly used for storing secret keys that should not be shared publicly. However, in our case, we only utilize it to display the stores that are currently using this theme. Hence, we deliberately push the .env file to Git for this specific purpose.

### Deploy commands

We have a set of essential commands for deploying themes, each serving a distinct purpose:

- `npm run start:pull`: This command allows you to pull a theme along with all the data saved inside the JSON files. It retrieves the theme and its associated data from a target store.
- `npm run start:push`: When you run this command, your code changes are pushed to an existing theme. However, this process does not affect the data stored inside the JSON files, ensuring that no valuable data is overwritten during the update.
- `npm run start:upload`: For uploading a completely new theme to a store, including all your code changes and the data saved inside the JSON files, you can use this command. It's particularly useful when deploying a fresh theme to a store.

Each template is represented by a JSON file, and each of these JSON files stores specific settings relevant to its corresponding template. To safeguard against unintended data loss or conflicts, the pull and push processes intentionally ignore the template JSON files, ensuring that no critical changes are accidentally overwritten on either side during deployment.

---

## Rules for writing code

- `Sustainable Code`: Prioritize writing code that is durable and maintainable over time. To achieve this, extensively use comments to document the code's functionality, making it easier for others to understand and modify in the future. Avoid resorting to quick fixes or hacks to address issues.
- `Modularity`: Design the code in a modular manner, using sections and blocks. This approach empowers the client to have greater flexibility in adjusting and customizing their theme according to their needs and preferences.
- `Minimal Third-Party Dependencies`: Whenever possible, refrain from using third-party libraries unless they are absolutely necessary. Relying on fewer external dependencies reduces the risk of potential compatibility issues and security vulnerabilities.
- `DRY Coding`: Emphasize the "Don't Repeat Yourself" (DRY) principle. Utilize code snippets for repetitive tasks to ensure a more efficient and maintainable codebase. By reusing code, you minimize duplication and potential inconsistencies.

By adhering to these principles, the codebase will be more organized, comprehensible, and adaptable, benefiting both developers and clients in the long run.

## Javascript

- JS is written in vanilla javascript. Don NOT use jQuery in your project.
- Javascript should be only loaded inside the section where it's needed, except for the global.js javascript.
- We prefer to write javascript in [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).
- JS is optimized by [TerserJS](https://github.com/terser/terser). Modern JS is the rule.
- Eslint is used to check your javascript code for mistakes and typos.
- Prettier formats your javascript code on safe.
- Third-party javascript needed for the frontend in the project is added to the dependencies inside the package.json or inside the dev/assets/js/ext folder. Be careful with third-party apps that include jQuery.

## Styles

We use [tailwind](https://tailwindcss.com/docs/) for the theme styling.
### Tailwind and Layers

- We prefer to use Tailwind classes and work **utility first**.
- To prevent CLS we write all our layout, spacing, sizing, and font classes directly on the Liquid. This can be done by using format container, site center, site spacing classes or one of the Tailwind classes.
- We apply [BEM](https://getbem.com/) classes to every element for readability and to find things back. It can be that no style is applied on this class.
- We work mobile-first. Use @screen md { ... your css } and md:[your-class] to define CSS on breakpoints. More info: [screen directive](https://Tailwindcss.com/docs/functions-and-directives) and [customize screens](https://Tailwindcss.com/docs/screens)
- We write modern css based on the [postcss-preset-env](https://github.com/csstools/postcss-preset-env). All features in stage 2 are supported.
- Use [logical spacing](https://web.dev/learn/design/internationalization/#logical-properties), so don't use margin-left or left-px or text-right, but instead use margin-inline-start, start-px and text-end. Right now, Tailwind supports inline logical operators.
- If you need to repeat your classes inside a section then consider:
  - Usage of a loop
  - Split bigger components into smaller components with liquid snippets. **For performance, max snippet depth is 4.**
  - Create a BEM class with related SCSS that's loaded from the custom folder
  - If it applies on (almost) every page then you can consider adding it to the main CSS. Be very strict with this.
- If you need to apply classes based on an if statement then keep the if statement outside the `class=""` property.
- Because Tailwind uses a regex expression to recognize the classes used in your project, all Tailwind classes must be fully written out. So don't use font-[{{- size -}}] but use font-xs so that the class can be recognized by Tailwind.
- Tailwind searches for classes inside the folders defined inside the Tailwind config content object.
- Classes inside the Shopify schema's will be recognized.
- Prettier is used to optimize the CSS and to reorder the tailwind classes on file safe. Note that the automatic reordering of tailwind classes does not work inside liquid capture statements.

### Tailwind config

The Tailwind config can be extended to the project's needs. [More info](https://Tailwindcss.com/docs/configuration)

### Tailwind layers

Tailwind uses the \``@layer`\` directive to define additional styles. Valid taiwlind layers are \``base`\`, \``components`\`, and \``utilities`\`.

With Tailwind, you don't need to be concerned about the order in which you author your CSS classes to avoid specificity issues. Tailwind will handle this for you automatically by moving the used classes to the appropriate @layer Tailwind directive.

This means that you can freely author your CSS classes without having to worry about the order in which they appear in your code. Tailwind will intelligently organize and manage the specificity of the classes to ensure proper styling without any conflicts.

By leveraging @layer directives, Tailwind effectively deals with specificity concerns, making your development process smoother and more efficient. You can focus on building your interface and applying the desired styles, trusting Tailwind to handle the rest.

[More info](https://Tailwindcss.com/docs/functions-and-directives)

### Code layers

The dev/scss folder is divided in three folders to give you to possibility to optimise your CSS easily

- The `custom` folder adds CSS that will be added dynamically to your page.
- The `main` folder loads all critical CSS.
- The `mixins` folder is used for SCSS mixins that can be used inside the other CSS files. Right now, these are not used.

Inside the designated folders, various subfolders correspond to different Tailwind layers. Each file in these subfolders should be wrapped within the appropriate @layer ... { } directive. The layers will be rendered in the browser in the following order: base, h1-styles-modules, h1-styles-components, h1-styles-utilities, and finally, h1-styles-sections.

- The `base` layer is responsible for injecting base styling and resets introduced by the Tailwind algorithm and the scss/main/base folder. It sets the foundation for the theme.
- The `h1-styles-modules` layer is utilized for adding third-party CSS from the custom/modules folder, such as SwiperJs or Fancybox. Here, the intention is to only import files without applying any custom styling. This approach maintains the hierarchy and separation of concerns. To apply custom styling to a third-party library, you can use the component layer.
- The `h1-styles-components` layer injects classes for components added by the Tailwind algorithm, the scss/main/components folder, and the scss/custom/components folder. You can choose to load your component dynamically or critically. The critical option should be reserved for styles that are used frequently, like styles for a commonly used button.
- The `h1-styles-utilities` layer is responsible for injecting utility classes added by the Tailwind algorithm and the scss/main/utilities folder. This layer harnesses the full power of Tailwind's utility classes, including classes like text-md, bg-primary, and states:underline.
- The `h1-styles-sections` layer is used to add custom section styling that cannot be easily achieved with component or utility classes. For instance, you can add a specific color scheme update for a product card inside the h1-styles-sections directive. It is crucial to be selective and strict with this layer, using it judiciously for specific section styling.

By following this layer-based approach, you can effectively organize your styles and maintain a clean and manageable codebase in your Tailwind CSS project.

---

## Prettier

Prettier is used to format your liquid, SCSS, and javascript automatically. So we use the same coding standards and output consistent code.
[More info](https://prettier.io/)

---

## Theme check

All code that we write should be written following the Shopify principles. These can be checked with the `npm run stcheck`. All liquid will be checked on syntax errors, missing templates, unused variables, deprecated code, and performance issues.

[More info](https://shopify.dev/themes/tools/theme-check)

---

## Styleguide

We work using components. So, we need to adjust and create all components for the project first. After that, you will use the style guide classes and components inside the other store components.

### Colors

- The branding colors for the project can be set inside the tailwind.config.js
- You can use a generator like https://www.tailwindshades.com/ to create and adjust all the variants of your colors
- Inside Tailwind.config.js (plugins addUtilities) we add the base branding colors as utility classes so you can use these directly.
- The color schemes should be updated in the tailwind utility layer (scss/main/utilities/color-schemes.scss).

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
- We use the render-container-content.liquid snippet to align each section the same way.
- Inside container.scss, content-wrapper.scss and site-spacing.scss the layout system classes are build.

### Logo, favicons & webmanifest

- The logo is inside global-logo.liquid and is defined as a svg as possible
- Favicons / touch icons and the webmanifest can be generated with [real favicon generator](https://realfavicongenerator.net/) and are placed inside the dev/assets folder. Make sure you use the liquid asset filter and customizer settings inside the webmanifest and browser config file.

### Icons

- We have divided the SVG icons in three sections: UI, Payment and Socials. The icons can be changed inside the icons-[type].liquid file.
- The icons sizes are defined inside icons.scss
- The size can be given to each icon with icon_class property. For example `icon_class: 'w-3 md:w-3'`

### Images

- Images are loaded with responsive-image.liquid. Here you can optimize for screen sizes, preserve space for cls etc.
- By default, Shopify adds lazy loading when sections are further down the page when using the image_tag filter.

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

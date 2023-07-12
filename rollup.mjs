/*
 * Module bundler to optimize JS, CSS and Assets
 *
 * Notes:
 * Please don't use rollup-plugin-postcss.
 * It's not updated and can't output multiple css files.
 */

import chokidar from 'chokidar';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import eslint from '@rollup/plugin-eslint';
import fs from 'fs';
import { glob } from 'glob';
import { nodeResolve as resolve } from '@rollup/plugin-node-resolve';
import read from 'read-file';
import * as rollup from 'rollup';
import styles from 'rollup-plugin-styles';
import { terser } from 'rollup-plugin-terser';

/*
 * Config
 * files: will create a new chunk
 * modules: wil not create a new chunk and cause a full rebuild
 */
const config = {
  mode: process.argv.includes('--watch') ? 'development' : 'production',
  notify: true,
  dest: './theme/assets',
  assets: 'dev/assets',
  js: {
    files: ['./dev/js/*.js', './dev/js/ext/*.js'],
    modules: ['./dev/js/modules/*.js'],
  },
  scss: {
    files: [
      './dev/scss/main/main-base.scss',
      './dev/scss/main/main-components.scss',
      './dev/scss/main/main-utilities.scss',
      './dev/scss/dynamic/components/**/*.scss',
      './dev/scss/dynamic/modules/**/*.scss',
      './dev/scss/dynamic/sections/**/*.scss',
    ],
    main: [
      {
        input: 'main-base',
        inputFull: './dev/scss/main/main-base.scss',
        dest: `./theme/snippets`,
        rename: `main-base-css.liquid`,
        wrapper: '@layer h1-styles-base { [[ stylesheet_content ]] }',
        watch: ['./tailwind.config.js', './dev/scss/main/base/**/*.scss'],
        watchLiquid: false,
      },
      {
        input: 'main-components',
        inputFull: './dev/scss/main/main-components.scss',
        dest: `./theme/snippets`,
        rename: `main-components-css.liquid`,
        wrapper: '@layer h1-styles-components { [[ stylesheet_content ]] }',
        watch: ['./tailwind.config.js', './dev/scss/main/components/**/*.scss'],
        watchLiquid: true,
      },
      {
        input: 'main-utilities',
        inputFull: './dev/scss/main/main-utilities.scss',
        dest: `./theme/snippets`,
        rename: `main-utilities-css.liquid`,
        wrapper: '@layer h1-styles-utilities { [[ stylesheet_content ]] }',
        watch: ['./tailwind.config.js', './dev/scss/main/utilities/**/*.scss'],
        watchLiquid: true,
      },
    ],
  },
  liquid: {
    files: [
      './theme/layout/*.liquid',
      './theme/sections/*.liquid',
      './theme/snippets/*.liquid',
      './theme/templates/**/*.liquid',
    ],
  },
};

/*
 * Define Rollup, Eslint, Terser & scss options
 */
const eslintOptions = {
  fix: false,
  throwOnError: false,
  throwOnWarning: false,
  include: [...config.js.files, ...config.js.modules],
  exclude: ['./node_modules/**/*'],
};

const terserOptions = {
  ecma: '2016',
  mangle: false,
  compress: false,
  toplevel: false,
};

const scssOptions = {
  mode: 'extract',
  minimize: true,
  url: false,
};

const inputOptions = {
  input: globify(config.js.files),
  cache: true,
  treeshake: false,
  watch: false,
  plugins: [resolve()],
};

const outputOptions = {
  dir: config.dest,
  format: 'es',
  sourcemap: true,
  assetFileNames: '[name][extname]',
  entryFileNames: '[name].js',
  chunkFileNames: '[name]-[hash].async.js',
  globals: {
    jquery: '$',
  },
  plugins: [],
};

/*
 * Notify
 * @param message {string}: your console message
 */
function notify(message) {
  if (!message || !config.notify) {
    return false;
  }
  console.log(`\x1b[36m ${message}`);
}

/*
 * Globify an array
 * @param array {array}: array with globs
 */
function globify(array = []) {
  if (!Array.isArray(array) || !array[0]) {
    return array;
  }
  return array
    .map((item) => {
      return glob.sync(item);
    })
    .flat();
}

/*
 * Check if file is used in main css
 * @param file {string}: path to file
 * @return { array }: with main file paths that use this file
 */
function usedInMainCss(file) {
  // strip extension from file
  file = file.split('/').pop().replace('.scss', '').replace('.css', '');

  const mainFiles = config.scss.main.reduce((mainFiles, mainItem) => {
    const content = read.sync(mainItem.inputFull, 'utf8');
    if (!!content.includes(file)) {
      mainFiles.push(globify(mainItem.inputFull));
    }
    return mainFiles;
  }, []);

  return mainFiles;
}

/*
 * Rollup plugin
 * Notify file updates see you see in the terminal which file is updated
 * @param type {string}: file extension (.js/.css)
 */
function notifyUpdates(type) {
  return {
    name: 'notify-updates',
    writeBundle(options, bundle) {
      // Show updated file notifications
      for (let filename in bundle) {
        let file = `${config.dest}/${filename}`;
        if (!filename.includes('.old.js')) {
          notify(`Updated: ${file}`);
        }
      }

      // JS file will trigger a full reload
      if (type == 'JS') {
        notify(`Trigger reload...`);
      }
    },
  };
}

/*
 * Bundle function.
 * @param type {string}: 'CSS' or 'JS'
 * @param inputOptions {object}: object with rollup input options
 * @param outOptions {object}: object with rollup output options
 */
let cleanedUp = false;
async function bundle(type, inputOptions, outputOptions) {
  if (!inputOptions || !outputOptions) {
    return false;
  }

  // Clean up assets folder if command uses --all and not cleaned up yet.
  if (!cleanedUp && config.mode == 'production' && process.argv.includes('--all')) {
    cleanedUp = true;
    inputOptions.plugins = [
      del({
        targets: `${config.dest}/**/*`,
      }),
      copy({
        targets: [{ src: `${config.assets}/**/*`, dest: config.dest }],
      }),
      ...inputOptions.plugins,
    ];
    notify('Cleaned up assets');
    notify('Copied assets');
  }

  if (config.mode == 'development') {
    // Notify when a new file is added to the assets folder
    outputOptions.plugins = [...outputOptions.plugins, notifyUpdates(type)];
  } else {
    // Notify when build startsnpm r
    notify(`Bundling ${type} assets...`);
  }

  // Catch error when bundling fails
  try {
    // Create a bundle
    const bundle = await rollup.rollup(inputOptions);

    // Write the bundle to disk
    await bundle.write(outputOptions);

    // Close the bundle
    await bundle.close();

    // Notify when build is done
    if (config.mode == 'production') {
      notify(`Built ${type} assets`);
    }
  } catch (err) {
    // Log CSS/JS error
    notify(err);
  }
}

/*
 * Process and optimise Javascript.
 * @param input {string / array}: input files or array.
 */
async function processJs(input) {
  if (!input) {
    return false;
  }

  // Copy default options
  let _inputOptions = { ...inputOptions };
  let _outputOptions = { ...outputOptions };

  // Update options
  _inputOptions.input = input;
  _inputOptions.plugins = [..._inputOptions.plugins, eslint(eslintOptions), terser(terserOptions)];

  // Create the bundle
  await bundle('JS', _inputOptions, _outputOptions);
}

/*
 * Process and optimise CSS.
 * @param input {string / array}: input files or array.
 */
async function processCss(input) {
  if (!input) {
    return false;
  }

  // Transform every input to an array
  if (typeof input == 'string') {
    input = [input];
  }

  // Check if one of the main stylesheets needs to be updated
  let processMain = [];
  config.scss.main.map((mainItem) => {
    let processFile = input.map((file) => !!file.includes(mainItem.input)).filter(Boolean)[0];
    if (!processFile) {
      return;
    }
    // Add event to create inline or production css/liquid file
    processMain.push(
      copy({
        hook: 'closeBundle',
        targets: [
          {
            src: `${config.dest}/${mainItem.input}.css`,
            dest: config.dest,
            rename: () => `${mainItem.input}-prod.css`,
            transform: (contents) => {
              return mainItem.wrapper.replace('[[ stylesheet_content ]]', contents.toString());
            },
          },
        ],
      }),
      copy({
        hook: 'closeBundle',
        targets: [
          {
            src: `${config.dest}/${mainItem.input}.css`,
            dest: mainItem.dest,
            rename: () => mainItem.rename,
            transform: (contents) => {
              return `{% style %}${mainItem.wrapper.replace(
                '[[ stylesheet_content ]]',
                contents.toString()
              )}{% endstyle %}`;
            },
          },
        ],
      })
    );
  });

  // Copy default options
  let _inputOptions = { ...inputOptions };
  let _outputOptions = { ...outputOptions };

  // Update options
  _inputOptions.input = input;
  _inputOptions.plugins = [
    ..._inputOptions.plugins,
    styles(scssOptions),
    // CSS bundles will also create a JS file. Clean this up.
    del({
      hook: 'closeBundle',
      targets: `${config.dest}/*.old.js`,
    }),
    // Create inline main css
    ...processMain,
  ];

  // Update output plugins
  (_outputOptions.sourcemap = false),
    (_outputOptions.entryFileNames = '[name].old.js'),
    (_outputOptions.chunkFileNames = '[name]-[hash].old.js'),
    // Create the bundle
    await bundle('CSS', _inputOptions, _outputOptions);
}

/*
 * Create watcher
 */
class Watcher {
  constructor() {
    this.javascript();
    this.scss();
    this.assets();
    this.freeze = false;
    this.timer = (ms = 1000) => {
      this.freeze = true;
      setTimeout(() => {
        this.freeze = false;
      }, ms);
    };
  }

  /*
   * Watch javascript files
   */
  javascript() {
    // Watch input files and process
    chokidar.watch(config.js.files).on('change', (file) => {
      if (this.freeze) return false;
      this.timer();
      notify(`Processing ${file}...`);
      processJs(file);
    });

    // Watch module files and process
    chokidar.watch(config.js.modules).on('change', (file) => {
      if (this.freeze) return false;
      this.timer();
      notify(`Processing all js...`);
      processJs(globify(config.js.files));
    });
  }

  /*
   * Watch SCSS files
   */
  scss() {
    // Watch input files and process
    chokidar.watch(config.scss.files).on('change', (file) => {
      if (this.freeze) return false;
      this.timer();
      notify(`Processing ${file}...`);
      processCss(file);
      // Update one of the main files if needed
      let usedInMain = usedInMainCss(file);
      if (usedInMain.length >= 1) {
        usedInMain.map((file) => {
          notify(`Processing ${file}...`);
        });
        processCss(usedInMain);
      }
    });

    // Watch main input files and process
    config.scss.main.map((mainItem) => {
      chokidar.watch([mainItem.watch]).on('change', (file) => {
        if (this.freeze) return false;
        if (file.includes(mainItem.rename)) return false;
        this.timer();
        notify(`Processing ${mainItem.inputFull}...`);
        processCss(globify(mainItem.inputFull));
      });
    });

    // On change liquid files process main css
    chokidar.watch([config.liquid.files]).on('change', (file) => {
      if (this.freeze) return false;
      this.timer();
      const isMainFile = config.scss.main.find((mainItem) => file.includes(mainItem.input));
      const mainFiles = config.scss.main.reduce((mainFiles, mainItem) => {
        if (mainItem.watchLiquid) {
          mainFiles.push(globify(mainItem.inputFull));
        }
        return mainFiles;
      }, []);
      if (mainFiles.length >= 1 && !isMainFile) {
        // Process main files one for on to have a nice hot reload
        mainFiles.map((file, index) => {
          setTimeout(() => {
            notify(` Processing ${file}...`);
            processCss(file);
          }, index * 250);
        });
      }
    });
  }

  /*
   * Watch assets folder
   */
  assets() {
    // Watch input files and process asset to theme/assets folder
    chokidar.watch(`${config.assets}/**/*`).on('change', (file) => {
      if (this.freeze) return false;
      this.timer();
      let destination = file.replace(config.assets, 'theme/assets');
      fs.copyFile(file, destination, null, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        notify(`Updated asset: ${destination}...`);
      });
    });
  }
}

/*
 * Initialize
 */
if (config.mode == 'development') {
  // If development mode only watch files
  const watcher = new Watcher();
} else {
  // If production mode build assets
  switch (true) {
    case process.argv.includes('--js'):
      processJs(globify(config.js.files));
      break;
    case process.argv.includes('--css'):
      processCss(globify(config.scss.files));
      break;
    default:
      processJs(globify(config.js.files));
      processCss(globify(config.scss.files));
  }
}

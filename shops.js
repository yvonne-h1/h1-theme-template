/**
 * Pick a store for Shopify CLI theme commands in the package.json
 * Because you need to give the store which theme command
 *
 * The Shopify CLI 3 --store flag is set by this file
 * SHOPIFY_FLAG_STORE = The store handle
 *
 * The Shopify CLI 3 --theme flag is set by this file
 * SHOPIFY_FLAG_PATH = The path to the theme folder
 *
 * Other flags are set in the package.json
 */

const prompts = require('prompts');
const dotenv = require('dotenv');

// Add .env config to current node process
dotenv.config();

// Check if there is a environment predefined with the --environments flag
const environment = process.argv.reduce((environment, arg, index) => {
  let prevArg = process.argv[index - 1];
  if (prevArg && prevArg.includes('--environments')) {
    return arg.replace(',', '');
  }
  return environment;
}, '');

// Get shops form process env
const shops = Object.entries(process.env)
  .filter((entry) => entry[0].includes('SHOP_'))
  .map((entry) => {
    let environment = entry[0].replace('SHOP_', ''),
      shop = entry[1],
      title = `${shop} (${environment.toUpperCase()})`;
    return {
      title: title,
      value: shop,
      env: environment,
    };
  });

// Get shop from selected environment if --environments flag is used
let shop = shops.find((shop) => shop.env.toLowerCase() == environment.toLowerCase());

// Export Shop you want to use
module.exports = new Promise(async (resolve) => {
  // If there is a environment matched with a shop predefined then use that shop
  if (shop && environment) {
    resolve({
      [environment]: {
        SHOPIFY_FLAG_STORE: shop.value,
        SHOPIFY_FLAG_PATH: 'theme',
      },
    });
  }

  // Else ask for which shop you want to use
  else {
    const question = await prompts({
      type: 'select',
      name: 'value',
      message: 'Which shopify store do you want to use?',
      choices: shops,
      initial: 0,
    });
    // Resolve export with selected shop
    resolve({
      shop: {
        SHOPIFY_FLAG_STORE: question.value,
        SHOPIFY_FLAG_PATH: 'theme',
      },
    });
  }
});

/* eslint no-unused-vars: 0 */

window.drawerToggleClasses = {
  filters: 'filter-is-open',
  cartDrawer: 'cart-drawer-is-open',
  mobileMenu: 'mobile-menu-is-open',
  headerSearch: 'search-is-open',
};

/**
  * debug function check, returns true when on localhost or myshopify.com domain
*/
const debug = () => window.location.hostname === '127.0.0.1' || window.location.hostname.indexOf('myshopify.com') !== -1;

const windowWidth = () => window.innerWidth;

let scrollY; // we'll store the scroll position here

const trapFocusHandlers = {};
/**
 * @param {Object} element the element to check
 * @returns true if the element is in the viewport
 */
function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'summary, a[href], button:enabled, [tabindex]:not([tabindex^=\'-\']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe',
    ),
  );
}

/**
 * Traps focus within a container
 * @param {Object} container the container to trap focus within
 * @param {Object} elementToFocus the element to focus when trapFocus is called
 */
function trapFocus(container, elementToFocus = container) {

  const elements = getFocusableElements(container);

  const first = elements[0];
  const last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (event.target !== container && event.target !== last && event.target !== first) return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event?.code.toUpperCase() !== 'TAB') return; // If not TAB key

    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if ((event.target === container || event.target === first) && event.shiftKey) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

/**
 * Removes the event listeners added by trapFocus()
 * @param {Object} elementToFocus
 */
function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

/**
 * add class to the body when a modal is opened
 * Keep the document.style.top for iOS devices
 */
function addPreventScroll() {
  // remember scroll position
  scrollY = window.scrollY;

  // prevent the body from jumping when the position fixed is added and wait to make sure it's been added
  document.body.style.top = `${(scrollY < window.innerHeight) ? 0 - scrollY : 0}px`;
  setTimeout(() => {
    document.documentElement.classList.add('prevent-scroll');
  }, 100);
}

function removePreventScroll() {
  document.documentElement.classList.remove('prevent-scroll');
  document.body.style.top = 0;

  // restore scroll position
  window.scrollTo(0, scrollY);
}

/**
 * Pauses all media on the page
 */
function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
      '*',
    );
  } );
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  } );
  document.querySelectorAll('video').forEach(video => video.pause());
  document.querySelectorAll('product-model').forEach(model => model.modelViewerUI?.pause());
}

/**
 * A custom element that wraps a search-form
*/
if (!customElements.get('search-form')) {
  class SearchForm extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('form input');
      this.submit = this.querySelector('form [type="submit"]');

      this.input.addEventListener('input', this.onInput.bind(this));

      this.input.addEventListener( 'input', debounce(() => {
        this.onInput.bind(this);
      }, 100));
    }

    onInput() {
      const searchLength = this.input.value.trim();
      if (!searchLength.length) {
        this.submit.disabled = 'disabled';
      }
      else {
        if(this.submit.disabled) this.submit.removeAttribute('disabled');
      }
    }
  }

  customElements.define('search-form', SearchForm);
}
/**
 * A custom element that wraps a quantity input
*/
if (!customElements.get('quantity-input')) {
  class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('[data-qty-input]');
      this.changeEvent = new Event('change', {
        bubbles: true,
      } );

      this.querySelectorAll('button').forEach(button =>
        button.addEventListener('click', this.onButtonClick.bind(this)),
      );
    }

    onButtonClick(event) {
      event.preventDefault();
      const previousValue = this.input.value;

      event.currentTarget.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
      if (previousValue !== this.input.value) {
        this.input.dispatchEvent(this.changeEvent);
      }
    }
  }

  customElements.define('quantity-input', QuantityInput);
}

/**
 * @param {Function} fn function to debounce
 * @param {Integer} wait time in ms
 * @returns a timeout function that will only execute fn after wait ms have passed since the last time it was called
 */
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * @param {Object} form the form to serialize
 * @returns a JSON string of the form data
 */
const serializeForm = (form) => {
  const obj = {};
  const formData = new FormData(form);
  for (const key of formData.keys()) {
    obj[key] = formData.get(key);
  }
  return JSON.stringify(obj);
};

/**
 * @param {*} type the type of data to fetch
 * @returns a config object for fetch
 */
function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: `application/${type}`,
    },
  };
}

/**
 * Prevents the default action of an event
 */
document.querySelectorAll('.prevent-hashjump').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hashtag = event.target.href.split('#');
    if (hashtag[1]) {
      const targetElem = document.querySelector('#' + hashtag[1]);
      if (targetElem) {
        const scrollTop = window.pageYOffset;

        window.scrollTo( {
          top: scrollTop,
        } );
        setTimeout(function () {
          window.scrollTo( {
            top: scrollTop,
          } );
        }, 1);
      }
    }
  } );
} );

// listen for resize event
window.addEventListener( 'resize', debounce(() => {
  windowWidth();
}, 50));

/*
 * Shopify Common JS - Don't change
 *
 */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {
  };
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement('form');
  form.setAttribute('method', method);
  form.setAttribute('action', path);

  for (var key in params) {
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (event) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    }
    else {
      for (var i = 0; i < provinces.length; i++) {
        var opt2 = document.createElement('option');
        opt2.value = provinces[i][0];
        opt2.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt2);
      }

      this.provinceContainer.style.display = '';
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = window.shop.moneyWithCurrencyFormat || '${{amount}}';
Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') {
    cents = cents.replace('.','');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
    return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
      full = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '1' + thousands),
      cents   = parts[1] ? (decimal + parts[1]) : '';

    return full + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
  case 'amount':
    value = formatWithDelimiters(cents, 2);
    break;
  case 'amount_no_decimals':
    value = formatWithDelimiters(cents, 0);
    break;
  case 'amount_with_comma_separator':
    value = formatWithDelimiters(cents, 2, '.', ',');
    break;
  case 'amount_no_decimals_with_comma_separator':
    value = formatWithDelimiters(cents, 0, '.', ',');
    break;
  }

  return formatString.replace(placeholderRegex, value);
};
/* Update cart items */
if (!customElements.get('cart-items')) {
  class CartItems extends HTMLElement {
    constructor() {
      super();

      this.cartDrawer = document.querySelector('cart-drawer');
      this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status');

      this.isCartPage = !!document.body.classList.contains('template-cart');

      this.sectionsToFetch = [
        ...this.getCartSectionsToRender().map(section => section.section),
      ];
      if (this.isCartPage) {
        this.sectionsToFetch = [
          ...this.sectionsToFetch,
          ...this.getCartRelatedSection().map(section => section.section),
        ];
      }
      else if(this.cartDrawer && this.cartDrawer.options.showUpsell) {
        this.sectionsToFetch = [
          ...this.sectionsToFetch,
          ...this.getDrawerSectionsToRender().map(section => section.section),
        ];
      }

      this.debouncedOnChange = debounce((event) => {
        if (event.target != document.getElementById('Cart-note')) this.onChange(event);
      }, 300);

      this.addEventListener('change', this.debouncedOnChange.bind(this));
    }

    onChange(event) {
      this.updateQuantity(
        event.target.dataset.index,
        event.target.value,
        document.activeElement.getAttribute('name'),
      );
    }

    async updateQuantity(line, quantity, name) {
      this.enableLoading(line);

      const body = JSON.stringify( {
        line,
        quantity,
        sections: this.sectionsToFetch,
        sections_url: window.location.pathname,
      });

      try {
        const response = await fetch(routes.cart_change_url, {
          ...fetchConfig(),
          ...{ body },
        });

        if (!response.ok) {
          throw new Error(response.status);
        }

        this.parsedState = await response.json();

        // On success:
        this.classList.toggle('cart-is-empty', this.parsedState.item_count === 0);

        // render the sections
        this.updateContent(this.parsedState, line, name);
      }
      catch (error) {
        debug() && console.log('Error updating the item.', error);

        document.querySelector('[data-cart-loader-active="show"]')?.classList.add('hidden');
        document.querySelector('[data-cart-loader-active="hidden"]')?.classList.remove('hidden');
        // document.getElementById('cart-errors').textContent = window.cartStrings.error;

        // Do a new fetch to the cart so you get the correct values of the item that had errors
        if (error.toString().includes('422')) {
          this.updateAfterError(line, name);
        }
      }
      finally {
        this.disableLoading();
      }
    }

    async updateAfterError(line, name) {
      // Do a new fetch to the cart so you get the correct values of the item that had errors
      const body = JSON.stringify( {
        sections: this.sectionsToFetch,
        sections_url: window.location.pathname,
      });
      const response = await fetch(routes.cart_update_url, {
        ...fetchConfig('javascript'),
        ...{ body },
      });

      const parsedState = await response.json();
      const lineItemWithError = parsedState.items[line -1];

      if (line) {
        // update the sections
        this.updateContent(parsedState, line, name);

        // show the error
        this.showLineItemError(line, lineItemWithError.quantity);
      }
    }

    updateContent(parsedState, line, name) {
      if (!('sections' in parsedState)) return;

      let sectionsToRender = [
        ...this.getCartSectionsToRender(),
      ];
      if (this.isCartPage) {
        sectionsToRender = [
          ...sectionsToRender,
          ...this.getCartRelatedSection(),
        ];
      }
      else if (this.cartDrawer && this.cartDrawer.options.showUpsell) {
        sectionsToRender = [
          ...sectionsToRender,
          ...this.getDrawerSectionsToRender(),
        ];
      }

      sectionsToRender.forEach((section) => {
        if (section?.selector) {
          const selector = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

          if (selector) {
            selector.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          }

          // update the cart drawer recommendations
          if (section.selector === '.js-cart-related-items') {
            setTimeout(() => {
              selector.classList.remove('opacity-0');
            }, 500);
          }
          if (section.selector === '.js-cart-related-items-swiper') {
            // init the swiper after a change
            setTimeout(() => {
              selector.querySelector('swiper-slider').init();
            }, 500);
          }
        }
      });

      document.getElementById(`CartItem-${line}`)?.querySelector(`[name="${name}"]`)?.focus();
    }

    // show error text for the line item
    showLineItemError(line, quantity) {
      document.getElementById(`Line-item-error-${line}`).querySelector('.cart-item__error-text').innerHTML = window.cartStrings.quantityError.replace('[quantity]',quantity);
      document.getElementById(`Quantity-${line}`).value = quantity;

      this.lineItemStatusElement.setAttribute('aria-hidden', true);

      const cartStatus = document.getElementById('cart-live-region-text');
      cartStatus.setAttribute('aria-hidden', false);

      setTimeout(() => {
        cartStatus.setAttribute('aria-hidden', true);
      }, 1000);
    }

    getCartSectionsToRender() {
      return [
        {
          id: 'main-cart-items',
          section: document.getElementById('main-cart-items').dataset.id,
          selector: '.js-cart-item-contents',
        },
        {
          id: 'main-cart-footer',
          section: document.getElementById('main-cart-footer').dataset.id,
          selector: '.js-cart-footer-contents',
        },
        {
          id: 'cart-icon-bubble',
          section: 'theme-cart-icon-bubble',
          selector: '[data-cart-icon-bubble]',
        },
      ];
    }

    getDrawerSectionsToRender() {
      return [
        {
          id: 'main-cart-recommendations',
          section: document.getElementById('main-cart-recommendations').dataset.id,
          selector: '.js-cart-related-items',
        },
        {
          id: 'cartDrawer',
          section: document.getElementById('cartDrawer').dataset.id,
          selector: '.js-cart-related-items-swiper',
        },
      ];
    }

    getCartRelatedSection() {
      return [
        {
          id: 'cartRelated',
          section: document.getElementById('cartRelated').dataset.id,
          selector: '.cart-related-items',
        },
      ];
    }

    getSectionInnerHTML(html, selector = '.shopify-section') {
      return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
    }

    enableLoading() {
      document.querySelector('cart-items').classList.add('cart-items-is-loading');
      document.querySelector('[data-cart-loader-active="show"]')?.classList.remove('hidden');
      document.querySelector('[data-cart-loader-active="hidden"]')?.classList.add('hidden');
      document.activeElement.blur();
      this.lineItemStatusElement.setAttribute('aria-hidden', false);
    }

    disableLoading() {
      document.querySelector('cart-items').classList.remove('cart-items-is-loading');
    }
  }
  customElements.define('cart-items', CartItems);
}

/* Remove item from the cart  */
if (!customElements.get('cart-remove-button')) {
  class CartRemoveButton extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('click', (event) => {
        event.preventDefault();
        this.closest('cart-items').updateQuantity(this.dataset.index, 0);
      });
    }
  }
  customElements.define('cart-remove-button', CartRemoveButton);
}

/* Update the cart note */
if (!customElements.get('cart-note')) {
  class CartNote extends HTMLElement {
    constructor() {
      super();
      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify( {
          note: event.target.value,
        });
        fetch(`${routes.cart_update_url}`, {
          ...fetchConfig(),
          ...{
            body,
          },
        });
      }, 300));
    }
  }
  customElements.define('cart-note', CartNote);
}

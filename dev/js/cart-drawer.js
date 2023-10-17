class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.body = document.querySelector('body');
    this.activeClass = window.drawerToggleClasses.cartDrawer;
    this.cartIconBubble = document.querySelectorAll('[aria-controls="cartDrawer"]');

    this.options = {
      showUpsell: false,
    };

    if (this?.dataset?.options) {
      const dataOptions = JSON.parse(this.dataset.options);
      this.options = {
        ...this.options,
        ...dataOptions,
      };
    }
  }

  /**
   * called after an item is added to the cart from the product-form-component.js and the settings say to open the drawer
   * @param {Object} trigger, is passed on from product-form-component, in case there was an add from quickshop
   */
  open(trigger = null) {
    const drawer = this.querySelector('#cartDrawer');
    this.body.classList.add(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', true));

    // add the eventListener to close on ESC key
    drawer.addEventListener('keyup', event => event.code === 'Escape' && this.close(trigger));

    addPreventScroll();
    trapFocus(drawer);
  }

  /**
   * called after an item is added to the cart from the product-form-component.js and the ESC key was used to close the drawer
   * @param {Object} trigger, is passed on from product-form-component, in case there was an add from quickshop
   */
  close(trigger = null) {
    this.body.classList.remove(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', false));

    removePreventScroll();
    removeTrapFocus(trigger);
  }

  /**
   * renderContents:
   * @param {Object} parsedState, passed after an item is added to the cart from the product-form-component.js
   */
  renderContents(parsedState) {
    if (!('sections' in parsedState)) return;

    this.getSectionsToRender().forEach((section) => {
      if (section?.selector) {
        const selector = document.querySelector(section.selector);

        if (selector) {
          selector.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }
      }
    });
  }

  /**
   * renderCartDrawer
   * Renders the drawer and the cart icon bubble
   * When there is an error for the quantity that is being added, the max quantity still gets added, so we have to update the sections.
   */
  async renderCartDrawer() {
    const body = JSON.stringify( {
      sections: this.getSectionsToRender().map(section => section.section),
      sections_url: window.location.pathname,
    });
    const response = await fetch(routes.cart_update_url, {
      ...fetchConfig('javascript'),
      ...{ body },
    });

    const parsedState = await response.json();
    this.renderContents(parsedState);
  }

  /**
   * getSectionsToRender:
   * @returns the sections to be rendered after an item is added to the cart from the product-form-component.js.
   */
  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        section: 'cart-drawer',
        selector: '[data-cart-drawer]',
      },
      {
        id: 'cart-icon-bubble',
        section: 'theme-cart-icon-bubble',
        selector: '[data-cart-icon-bubble]',
      },
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }
}

if (!customElements.get('cart-drawer')) {
  customElements.define('cart-drawer', CartDrawer);
}

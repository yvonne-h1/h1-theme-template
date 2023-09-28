class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.body = document.querySelector('body');
    this.activeClass = window.drawerToggleClasses.cartDrawer;
    this.cartIconBubble = document.querySelectorAll('[aria-controls="cartDrawer"]');

    // Listen for the class-toggle-component close event, since this triggers the cart drawer to close
    document.addEventListener('toggle-closed', (event) => {
      if (event.detail.id === 'cartDrawer') {

        // Close all quick shops in the cartDrawer
        if (this.querySelector('quick-shop')) {
          this.querySelector('quick-shop').closePopups();
        }
      }
    });
  }

  /**
   * open the drawer, called after an item is added to the cart from the product-form-component.js and the settings say to open the drawer
   */
  open() {
    const drawer = this.querySelector('#cartDrawer');
    this.body.classList.add(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', true));

    // add the eventListener
    drawer.addEventListener('keyup', event => event.code === 'Escape' && this.close());

    trapFocus(drawer);
  }

  close() {
    this.body.classList.remove(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', false));

    removeTrapFocus();
  }

  /**
   * renderContents:
   * @param {Object} parsedState, passed after an item is added to the cart from the product-form-component.js
   */
  renderContents(parsedState) {
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

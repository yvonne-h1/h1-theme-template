class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.drawer = this;
    this.body = document.querySelector('body');
    this.activeClass = window.drawerToggleClasses.cartDrawer;
    this.cartIconBubble = document.querySelectorAll('[aria-controls="cartDrawer"]');

    this.drawer.addEventListener('keyup', event => event.code === 'Escape' && this.close());

    document.addEventListener('toggle-closed', (event) => {
      console.log(event);
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
    this.body.classList.add(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', true));

    trapFocus(this.drawer);
  }

  close() {
    this.body.classList.remove(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', false));

    // Close all quick shops
    if (this.querySelectorAll('quick-shop').length > 0) {
      this.querySelector('quick-shop').closePopups();
    }

    removeTrapFocus();
  }

  /**
   * renderContents:
   * @param {Object} parsedState, passed after an item is added to the cart from the product-form-component.js
   */
  renderContents(parsedState) {
    this.getSectionsToRenderForCartNotification().forEach((section) => {
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
    const cartDrawerContent = `${window.location.pathname}?section_id=cart-drawer`;
    const cartIconBubbleContent = `${window.location.pathname}?section_id=theme-cart-icon-bubble`;

    fetch(cartDrawerContent)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;

        document.querySelector('#cartDrawer').innerHTML = this.getSectionInnerHTML(html, '#cartDrawer');
      })
      .catch((error) => {
        throw error;
      });;

    fetch(cartIconBubbleContent)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        document.querySelector('#cart-icon-bubble').innerHTML= this.getSectionInnerHTML(html, '#cart-icon-bubble');
      })
      .catch((error) => {
        throw error;
      });
  }

  /**
   * getSectionsToRenderForCartNotification:
   * @returns the sections to be rendered after an item is added to the cart from the product-form-component.js.
   */
  getSectionsToRenderForCartNotification() {
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

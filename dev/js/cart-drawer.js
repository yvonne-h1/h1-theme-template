class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.drawer = this;
    this.body = document.querySelector('body');
    this.activeClass = window.drawerToggleClasses.cartDrawer;
    this.cartIconBubble = document.querySelectorAll('[aria-controls="cartDrawer"]');
    this.cartDrawerTrigger = document.querySelector('[data-cart-icon-bubble]');

    this.onBodyClick = this.handleBodyClick.bind(this);

    this.cartDrawerTrigger.addEventListener('click', this.open.bind(this));
    this.drawer.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
  }

  open() {
    this.body.classList.add(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', true));

    this.drawer.focus();
    trapFocus(this.drawer);
  }

  close() {
    this.body.classList.remove(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', false));

    removeTrapFocus();
  }

  renderContents(parsedState) {
    this.getSectionsToRender().forEach((section) => {
      if (section?.selector) {
        const selector = document.querySelector(section.selector);

        if (selector) {
          selector.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector,
          );
        }
      }
    } );
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        section: 'cart-drawer',
        selector: '[data-cart-drawer]',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '[data-cart-icon-bubble]',
      },
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  handleBodyClick(event) {
    const target = event.target;
    if (target !== this.drawer && !target.closest('cart-drawer')) {
      this.close();
    }
  }
}

if (!customElements.get('cart-drawer')) {
  customElements.define('cart-drawer', CartDrawer);
}

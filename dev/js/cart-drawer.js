class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.drawer = this;
    this.body = document.querySelector('body');
    this.activeClass = 'cart-drawer-is-open';
    this.cartIconBubble = document.querySelector('cart-icon-bubble');

    this.closeButtons = this.querySelectorAll('[data-cart-button-close]');
    this.closeButtons.forEach((btn) => btn.addEventListener('click', this.close.bind(this)));

    this.onBodyClick = this.handleBodyClick.bind(this);

    this.drawer.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
  }

  open() {
    this.body.classList.add(this.activeClass);
    this.cartIconBubble.toggleButton.setAttribute('aria-expanded', true);

    this.drawer.focus();
    trapFocus(this.drawer);
    document.body.addEventListener('click', this.onBodyClick);
  }

  close() {
    this.body.classList.remove(this.activeClass);
    this.cartIconBubble.toggleButton.setAttribute('aria-expanded', false);

    document.body.removeEventListener('click', this.onBodyClick);
    removeTrapFocus();
  }

  renderContents(parsedState) {
    this.getSectionsToRender().forEach((section) => {
      if (section?.selector) {
        const selector = document.querySelector(section.selector);

        if (selector) {
          selector.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        }
      }
    });

    // Re-bind the close drawer buttons
    this.querySelectorAll('[data-cart-button-close]').forEach((btn) =>
      btn.addEventListener('click', this.close.bind(this))
    );
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

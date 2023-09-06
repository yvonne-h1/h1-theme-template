class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.drawer = this;
    this.body = document.querySelector('body');
    this.activeClass = window.drawerToggleClasses.cartDrawer;
    this.cartIconBubble = document.querySelectorAll('[aria-controls="cartDrawer"]');

    this.onBodyClick = this.handleBodyClick.bind(this);

    this.drawer.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
  }

  open() {
    this.body.classList.add(this.activeClass);
    this.cartIconBubble.forEach(button => button.setAttribute('aria-expanded', true));

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
          selector.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }
      }
    } );
  }

  /**
   * renderCartDrawer
   * Renders the drawer and the cart icon bubble because when there is an error for the quantity that is being added, the max quantity still gets added
   */
  async renderCartDrawer() {
    const cartDrawerContent = `${window.location.pathname}?section_id=cart-drawer`;
    const cartIconBubbleContent = `${window.location.pathname}?section_id=cart-icon-bubble`;

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
      });;

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

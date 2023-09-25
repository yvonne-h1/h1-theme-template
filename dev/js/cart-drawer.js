class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.drawer = this;
    this.body = document.querySelector('body');
    this.activeClass = window.drawerToggleClasses.cartDrawer;
    this.cartIconBubble = document.querySelectorAll('[aria-controls="cartDrawer"]');

    this.onBodyClick = this.handleBodyClick.bind(this);

    this.drawer.addEventListener('keyup', event => event.code === 'Escape' && this.close());
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
    document.querySelector('.js-cart-drawer-recommendations').classList.add('opacity-0');
    this.getSectionsToRender().forEach((section) => {
      if (section?.selector) {
        const selector = document.querySelector(section.selector);

        if (selector) {
          selector.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          if (section.selector === '.js-cart-drawer-recommendations') {
            setTimeout(() => {
              selector.classList.remove('opacity-0');
            }, 500);
          }
        }
      }
    });
  }

  /**
   * renderCartDrawer
   * Renders the drawer and the cart icon bubble because when there is an error for the quantity that is being added, the max quantity still gets added, so we have to update the sections.
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

  getSectionsToRender() {
    return [
      // {
      //   id: 'cart-drawer',
      //   section: 'cart-drawer',
      //   selector: '[data-cart-drawer]',
      // },
      {
        id: 'main-cart-recommendations',
        section: document.getElementById('main-cart-recommendations').dataset.id,
        selector: '.js-cart-drawer-recommendations',
      },
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

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  handleBodyClick(event) {
    const target = event.target;
    if (target !== this.drawer && !target.closest('cart-drawer')) this.close();
  }
}

if (!customElements.get('cart-drawer')) {
  customElements.define('cart-drawer', CartDrawer);
}

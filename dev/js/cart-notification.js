/**
 * CartNotification
 */
class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.querySelector('[data-cart-notification]');
    this.validContent = this.querySelector('[data-cart-notification-valid]');
    this.invalidContent = this.querySelector('[data-cart-notification-invalid]');
    this.onBodyClick = this.handleBodyClick.bind(this);
    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelectorAll('[data-cart-notification-close]').forEach((closeButton) => {
      closeButton.addEventListener('click', () => this.close());
    });
  }

  /**
   * toggleNotificationClasses
   * @description Toggles the right classes to show or hide the cart notification
   */
  toggleOpenState() {
    this.classList.toggle('cart-notification--open');
  }

  /**
   * open
   * @param {Boolean} hasError
   */
  open(hasError = false) {
    if (hasError) {
      this.validContent.classList.add('hidden');
      this.invalidContent.classList.remove('hidden');
    } else {
      this.validContent.classList.remove('hidden');
      this.invalidContent.classList.add('hidden');
    }

    this.toggleOpenState();

    this.notification.addEventListener(
      'transitionend',
      () => {
        this.notification.focus();
        trapFocus(this.notification);
      },
      { once: true }
    );

    document.body.addEventListener('click', this.onBodyClick);
  }

  /**
   * close
   */
  close() {
    this.toggleOpenState();
    document.body.removeEventListener('click', this.onBodyClick);
    removeTrapFocus(this.activeElement);
  }

  /**
   * renderContents
   * @param {Object} parsedState
   */
  renderContents(parsedState) {
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section) => {
      document.getElementById(section.id).innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.section],
        section.selector
      );
    });
    this.open();
  }

  /**
   * renderQuantityError
   * @param {String} inventoryQuantity
   */
  renderQuantityError(inventoryQuantity) {
    const errorMessageElem = this.notification.querySelector(
      '[data-cart-notification-error-message]'
    );
    const inventoryQty = parseInt(inventoryQuantity) || 0;

    errorMessageElem.innerText = window.cartStrings.quantityError.replace(
      '[quantity]',
      inventoryQty
    );

    this.open(true);
  }

  /**
   * getSectionsToRender
   * @returns {Array} Sections to render
   */
  getSectionsToRender() {
    return [
      {
        id: 'cart-notification-product',
        section: 'cart-notification-product',
        selector: `#cart-notification-product-${this.productId}`,
      },
      {
        id: 'cart-notification-button',
        section: 'cart-notification-button',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '[data-cart-icon-bubble]',
      },
    ];
  }

  /**
   * getSectionInnerHTML
   * @param {String} String that contains html
   * @param {String} selector
   * @returns
   */
  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  /**
   * handleBodyClick
   * @param {Object} event
   */
  handleBodyClick(event) {
    const target = event.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      this.close();
    }
  }

  /**
   * setActiveElement
   * @param {Node} element
   */
  setActiveElement(element) {
    this.activeElement = element;
  }
}

if (!customElements.get('cart-notification')) {
  customElements.define('cart-notification', CartNotification);
}

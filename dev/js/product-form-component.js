class ProductFormComponent extends HTMLElement {
  constructor() {
    super();

    this.form = this.querySelector('form');
    if (!this.form) return;

    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cartNotification = document.querySelector('cart-notification');
    this.cartDrawer = document.querySelector('cart-drawer');
    this.cartItems = document.querySelector('cart-items');

    this.isCartPage = !!document.body.classList.contains('template-cart');
  }

  onSubmitHandler(event, trigger = null) {
    if (event) event.preventDefault();

    const submitButton = this.querySelector('[type="submit"]');
    submitButton.setAttribute('disabled', true);
    submitButton.classList.add('button--loading');

    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];

    let sectionsToFetch = [];
    if (this.cartDrawer) {
      sectionsToFetch = [
        ...sectionsToFetch,
        ...this.cartDrawer.getSectionsToRender().map(section => section.section),
      ];
    }
    else if(this.isCartPage) {
      sectionsToFetch = [
        ...sectionsToFetch,
        ...this.cartItems.getCartSectionsToRender().map(section => section.section),
        ...this.cartItems.getCartRelatedSection().map(section => section.section),
      ];
    }
    if (this.cartNotification) {
      sectionsToFetch = [
        ...sectionsToFetch,
        ...this.cartNotification.getSectionsToRender().map(section => section.section),
      ];
    }

    const formData = new FormData(this.form);
    formData.append('sections', sectionsToFetch);
    formData.append('sections_url', window.location.pathname);
    config.body = formData;

    fetch(`${routes.cart_add_url}`, config)
      .then(response => response.json())
      .then((parsedState) => {
        if (parsedState.status == 422) {
          // When quantity error
          this.cartNotification?.renderQuantityError(formData.get('inventory_quantity'), submitButton);

          // Render the cart drawer items again because even if there was a quantity error, items could still have been added
          this.cartDrawer?.renderContents();
          this.cartItems?.updateAfterError();
          return;
        }
        if (this.cartDrawer) {
          this.cartDrawer.renderContents(parsedState);
        }
        else if (this.cartItems) {
          this.cartItems.updateContent(parsedState);
        }

        switch (submitButton.dataset.addToCartBehavior) {
        case 'open_cart_drawer':
          // Set timeout to force animation. Because content is just updated with renderContents
          setTimeout(() => {
            this.cartDrawer?.open(trigger);
          },100);
          break;
        case 'show_cart_notification':
        default:
          this.cartNotification?.renderContents(parsedState, submitButton);
        }
      })
      .catch((error) => {
        debug() && console.error(error);
      })
      .finally(() => {
        submitButton.classList.remove('button--loading');
        submitButton.removeAttribute('disabled');
      });
  }
}

if (!customElements.get('product-form-component')) {
  customElements.define('product-form-component', ProductFormComponent);
}

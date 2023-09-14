if (!customElements.get('product-form-component')) {
  class ProductFormComponent extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartNotification = document.querySelector('cart-notification');
      this.cartDrawer = document.querySelector('cart-drawer');
      this.cartItems = document.querySelector('cart-items');
    }

    onSubmitHandler(event) {
      event.preventDefault();

      const submitButton = this.querySelector('[type="submit"]');
      submitButton.setAttribute('disabled', true);
      submitButton.classList.add('button--loading');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const sectionsToFetch = [
        ...this.cartDrawer.getSectionsToRender().map(section => section.section),
        ...this.cartNotification.getSectionsToRender().map(section => section.section),
      ];

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
            this.cartDrawer.renderCartDrawer();
            this.cartItems?.updateAfterError();
            return;
          }

          this.cartDrawer.renderContents(parsedState);

          switch (submitButton.dataset.addToCartBehavior) {
          case 'open_cart_drawer':
            // Set timeout to force animation. Because content is just updated with renderContents
            setTimeout(() => {
              this.cartDrawer.open();
            },100 );
            break;
          case 'show_cart_notification':
          default:
            this.cartNotification?.renderContents(parsedState, submitButton);
          }
        })
        .catch((event) => {
          debug() && console.error(event);
        })
        .finally(() => {
          submitButton.classList.remove('button--loading');
          submitButton.removeAttribute('disabled');
        });
    }
  }

  window.ProductFormComponent = ProductFormComponent;
  customElements.define('product-form-component', ProductFormComponent);
}

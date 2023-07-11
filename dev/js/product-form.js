if (!customElements.get('product-form')) {
  class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cartNotification = document.querySelector('cart-notification');
      this.cartDrawer = document.querySelector('cart-drawer');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();

      const submitButton = this.querySelector('[type="submit"]');
      submitButton.setAttribute('disabled', true);
      submitButton.classList.add('button--loading');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const sectionsToFetch = [
        ...this.cartDrawer.getSectionsToRender().map((section) => section.id),
        ...this.cartNotification.getSectionsToRender().map((section) => section.id),
      ];

      const formData = new FormData(this.form);
      formData.append('sections', sectionsToFetch);
      formData.append('sections_url', window.location.pathname);
      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((parsedState) => {
          if (parsedState.status == 422) {
            // When quantity error
            this.cartNotification.setActiveElement(document.activeElement);
            this.cartNotification.renderQuantityError(formData.get('inventory_quantity'));
            return;
          }

          this.cartDrawer.renderContents(parsedState);

          switch (submitButton.dataset.addToCartBehavior) {
            case 'open_cart_drawer':
              // Set timeout to force animation. Because content is just updated with renderContents
              setTimeout(() => {
                this.cartDrawer.open();
              });
              break;
            case 'show_cart_notification':
            default:
              this.cartNotification.setActiveElement(document.activeElement);
              this.cartNotification.renderContents(parsedState);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          submitButton.classList.remove('button--loading');
          submitButton.removeAttribute('disabled');
        });
    }
  }

  window.ProductForm = ProductForm;
  customElements.define('product-form', ProductForm);
}

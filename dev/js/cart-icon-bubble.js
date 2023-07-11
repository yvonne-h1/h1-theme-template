if (!customElements.get('cart-icon-bubble')) {
  class CartIconBubble extends HTMLElement {
    constructor() {
      super();

      this.toggleButton = this.querySelector('[aria-controls="cart-drawer"]');
      this.cartDrawer = document.querySelector('cart-drawer');

      if (this.cartDrawer) {
        this.toggleButton.addEventListener('click', this.toggle.bind(this));
      }
    }

    toggle(event) {
      event.preventDefault();
      event.stopPropagation();

      this.cartDrawer.drawer.classList.contains(this.cartDrawer.activeClass)
        ? this.cartDrawer.close()
        : this.cartDrawer.open();
    }
  }
  window.CartIconBubble = CartIconBubble;
  customElements.define('cart-icon-bubble', CartIconBubble);
}

if (!customElements.get('quick-shop')) {
  class QuickShop extends HTMLElement {
    constructor() {
      super();

      this.parentCard = this.closest('[data-product-card]');
      this.productCards = document.querySelectorAll('[data-product-card]');
      this.quickShopOptions = document.querySelectorAll('[data-quick-shop-option]');

      this.parentCard.addEventListener('mouseleave', () => {
        this.updateLabelState();
      });

      this.parentCard?.querySelectorAll('[data-quick-shop-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
          this.updateLabelState();
          this.onPopupToggle();
        });
      });

      // Bind option select events
      this?.querySelectorAll('[data-quick-shop-option]').forEach((option) => {
        option.addEventListener('click', () => {
          const label = option?.closest('.quick-shop__option')?.querySelector('.option__label');
          this.updateLabelState(label);
          this.onOptionSelect(option.value, option.dataset.inventoryQuantity);
        });
      });
    }

    /**
     * labelstate
     * @description Toggles the option labels active state.
     */
    updateLabelState(label) {
      //remove all checked states from option labels
      this.quickShopOptions.forEach((option) => {
        const label = option?.closest('.quick-shop__option')?.querySelector('.option__label');
        label?.classList.remove('option__label--checked');
      });
      label?.classList.add('option__label--checked');
    }
    /**
     * onPopupOpen
     * @description Opens the options popup on touch devices.
     */
    onPopupToggle() {
      // Close other quick shops
      this.productCards.forEach((card) => {
        if (!card.isSameNode(this.parentCard)) {
          card.classList.remove('quick-shop--is-open');
        }
      });
      this.parentCard.classList.toggle('quick-shop--is-open');
    }

    /**
     * onOptionSelect
     * @description Adds the clicked option/variant to the cart leveraging the product form component. Adds a variant to the cart.
     * @param {String} variantId
     * @param {String} inventoryQuantity
     */
    onOptionSelect(variantId, inventoryQuantity) {
      const productForm = this.querySelector('product-form');
      const hiddenId = productForm.querySelector('input[name="id"]');
      const hiddenInventoryQty = productForm.querySelector('input[name="inventory_quantity"]');
      const submitButton = productForm.querySelector('[type="submit"]');

      hiddenId.value = variantId;
      hiddenInventoryQty.value = inventoryQuantity;
      submitButton.click();
    }
  }

  window.QuickShop = QuickShop;
  customElements.define('quick-shop', QuickShop);
}

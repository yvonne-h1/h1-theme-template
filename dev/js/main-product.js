// Swiper is imported already

if (!customElements.get('product-detail-swiper')) {
  class ProductDetailSwiper extends HTMLElement {
    constructor() {
      super();

      this.swiperElement = this.querySelector('[data-product-detail-swiper]');

      this.swiperOptions = {direction: 'horizontal'};

      this.init();
    }

    init() {
      window.addEventListener('load', (event) => {
        this.swiperInstance = new Swiper(this.swiperElement, this.swiperOptions);
      });
      Fancybox.bind('[data-fancybox]', {
        animated: false,
        showClass: false,
        mainClass: 'image-zoom',
      });
    }
  }

  customElements.define('product-detail-swiper', ProductDetailSwiper);
}

if (!customElements.get('product-info')) {
  class ProductInfo extends HTMLElement {
    constructor() {
      super();
      this.productForm = this.querySelector('product-form-component');
      this.productFormQuantity = this.productForm?.querySelector('input[name="quantity"]');
      this.quantityInput = this.querySelector('quantity-input');
      this.quantityInputElement = this.quantityInput?.querySelector('input[name="quantity"]');
      this.quantityInputElement?.addEventListener('change', () => {
        this.handleQuantityInput();
      });
    }

    /**
     * handleQuantityInput
     * @description Set the quantity from the quantity input web component to the product form web component.
     */
    handleQuantityInput() {
      this.productFormQuantity.value = this.quantityInputElement.value;
    }
  }
  customElements.define('product-info', ProductInfo);
}

// Swiper is imported already

if (!customElements.get('product-detail-swiper')) {
  class ProductDetailSwiper extends HTMLElement {
    constructor() {
      super();

      this.swiperElement = this.querySelector('[data-product-detail-swiper]');

      this.swiperOptions = {
        direction: 'horizontal',
      };

      this.init();
    }

    init() {
      window.addEventListener('load', () => {
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
      this.submitButtonWrapper = this.querySelector('product-form-component');
      this.fixedClasses = ['fixed','bg-white','p-4'];

      this.productForm = this.querySelector('product-form-component');
      this.productFormQuantity = this.productForm?.querySelector('input[name="quantity"]');
      this.quantityInput = this.querySelector('quantity-input');
      this.quantityInputElement = this.quantityInput?.querySelector('input[name="quantity"]');
      this.quantityInputElement?.addEventListener('change', () => {
        this.handleQuantityInput();
      });

      // On scroll, observe the product form on mobile and make it fixed when necessary
      this.debouncedOnScroll = debounce((event) => {
        if (window.innerWidth >= 768) {
          this.submitButtonWrapper.classList.remove(...this.fixedClasses);
          document.body.style.paddingBottom = 0;
          return;
        }
        this.productInfoObserver(event);
      }, 10);
      window.addEventListener('scroll', this.debouncedOnScroll.bind(this));
    }

    /**
   * productInfoObserver
   * @description Observe the product form and add/remove the sticky class when necessary.
   */
    productInfoObserver() {
      // Register IntersectionObserver
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          // const infoColBottom = this.previousElementSibling.getBoundingClientRect().bottom - 20;
          // const formHeight = this.querySelector('[data-product-form]').clientHeight;
          const isBottomVisible = entry.boundingClientRect.bottom + 50 < window.innerHeight;
          // console.log(infoColBottom,formHeight,isBottomVisible);

          if (isBottomVisible) {
            this.submitButtonWrapper.classList.add(...this.fixedClasses);
            // set the height of the element to the same height as the wrapper so there's no jump when the sticky (fixed) class is applied. Also wait a bit because the dynamic checkout might be loaded later
            setTimeout(() => {
              document.body.style.paddingBottom = `${this.submitButtonWrapper.clientHeight}px`;
            }, 500);
          }
          else {
            this.submitButtonWrapper.classList.remove(...this.fixedClasses);
            document.body.style.paddingBottom = 0;
          }
        });
      });

      // Declares what to observe, and observes its properties.
      observer.observe(this.querySelector('[data-product-form]'));
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

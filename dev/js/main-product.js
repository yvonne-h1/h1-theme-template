
class ProductInfo extends HTMLElement {
  constructor() {
    super();
    this.quickAddWrapper = this.querySelector('[data-product-form]');
    this.quickAddContent = this.querySelector('[data-product-form-inner]');
    this.fixedClass = 'is-fixed';

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
        this.quickAddWrapper.classList.remove(this.fixedClass);
        document.body.style.paddingBottom = 0;
        return;
      }
      // check for window height for accessibility. We don't fix the element for small screens
      if (window.innerHeight > 480) {
        this.productInfoObserver(event);
      }
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
        const isBottomVisible = entry.boundingClientRect.bottom + 50 < window.innerHeight;
        if (isBottomVisible) {
          this.quickAddWrapper.classList.add(this.fixedClass);
          // set the height of the element to the same height as the wrapper so there's no jump when the sticky (fixed) class is applied. Also wait a bit because the dynamic checkout might be loaded later

          setTimeout(() => {
            document.body.style.paddingBottom = `${this.quickAddContent.clientHeight}px`;
          }, 500);
        }
        else {
          this.quickAddWrapper.classList.remove(this.fixedClass);
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
if (!customElements.get('product-info')) {
  customElements.define('product-info', ProductInfo);
}

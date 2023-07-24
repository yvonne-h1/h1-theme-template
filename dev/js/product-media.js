(async () => {
  if (!customElements.get('product-media')) {
    const { default: Swiper, Navigation } = await import('swiper');
    const { Fancybox } = await import('@fancyapps/ui');

    Swiper.use([Navigation]);

    class ProductMedia extends HTMLElement {
      constructor() {
        super();
        this.swiper();
        this.fancybox();
      }

      swiper() {
        // Check if Swiper exists
        if (typeof Swiper == 'undefined') return false;

        // Get swiper element
        this.swiperElement = this.querySelector('[data-product-media-swiper]');

        // Swiper options
        this.swiperOptions = {
          threshold: 10,
          direction: 'horizontal',
        };

        // Init swiper
        this.swiperInstance = new Swiper(this.swiperElement, this.swiperOptions);

        // Rebuid Swiper in design mode
        if (Shopify.designMode && this.swiperInstance) {
          window.addEventListener('shopify:section:load', () => {
            this.swiperInstance.update();
          });
        }
      }

      /*
       * Create fancybox
       */
      fancybox() {
        // Check if Fancybox exists
        if (typeof Fancybox == 'undefined') return false;

        Fancybox.bind('[data-fancybox]', {
          animated: false,
          showClass: false,
          mainClass: 'image-zoom',
        });
      }
    }

    window.ProductMedia = ProductMedia;

    customElements.define('product-media', ProductMedia);
  }
})();

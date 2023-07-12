(async () => {
  if (!customElements.get('product-recommendations')) {
    const {
      default: Swiper,
      A11y,
      Navigation,
      Pagination,
      Scrollbar,
      Autoplay,
    } = await import('swiper');

    Swiper.use([A11y, Navigation, Pagination, Scrollbar, Autoplay]);

    class ProductRecommendations extends HTMLElement {
      constructor() {
        super();

        this.swiperElement = this.querySelector('[data-swiper]');

        this.swiperOptions = {
          threshold: 10,
        };

        // Check if we have extra options on the HTML
        if (this.swiperElement.dataset && this.swiperElement.dataset.options) {
          const jsonOptions = JSON.parse(this.swiperElement.dataset.options);

          if (jsonOptions) {
            this.swiperOptions = {
              ...this.swiperOptions,
              ...jsonOptions,
            };
          }
        }

        this.swiperInstance = new Swiper(this.swiperElement, this.swiperOptions);

        // Only do it once, not on every web component render.
        window.onload = () => {
          this.init();
        };
      }

      init() {
        if (this.dataset && this.dataset.url) {
          fetch(this.dataset.url)
          .then((response) => response.text())
          .then((text) => {
            const html = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('[data-recommended-products]').innerHTML;

            this.querySelector('[data-recommended-products]').innerHTML = html;

            this.swiperInstance.update();
            if (this.swiperOptions.navigation) {
              this.swiperInstance.navigation.init();
              this.swiperInstance.navigation.update();
            }
            if (this.swiperOptions.pagination) {
              this.swiperInstance.pagination.init();
              this.swiperInstance.pagination.update();
            }
            if (this.swiperOptions.scrollbar) {
              this.swiperInstance.scrollbar.init();
              this.swiperInstance.scrollbar.updateSize();
            }
          })
          .catch((error) => {
            console.error(error);
          });
        }
      }
    }

    window.ProductRecommendations = ProductRecommendations;

    customElements.define('product-recommendations', ProductRecommendations);
  }
})();

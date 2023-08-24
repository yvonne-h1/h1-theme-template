
import Swiper from 'swiper';
import { A11y, Navigation, Pagination, Scrollbar, Autoplay } from 'swiper/modules';

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
    this.swiperElement = this.querySelector('[data-swiper]');

    this.swiperOptions = {
      observer: true,
      modules: [A11y, Navigation, Pagination, Scrollbar, Autoplay],
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
    console.log('this.swiperOptions', this.swiperOptions);

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
        .catch((e) => {
          debug() && console.error(e);
        });
    }
  }
}

if (!customElements.get('product-recommendations')) {
  customElements.define('product-recommendations', ProductRecommendations);
}

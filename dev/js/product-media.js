import Fancybox from './modules/fancybox.js';
import Swiper from './modules/swiper.js';
import { navigation } from './modules/swiper.js';

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
      observer: true,
      modules: [navigation],
    };

    // Init swiper
    this.swiperInstance = new Swiper(this.swiperElement, this.swiperOptions);

    // Rebuild Swiper in design mode
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
      dragToClose: false,
      mainClass: 'fancybox-products',
    });
  }
}

if (!customElements.get('product-media')) {
  customElements.define('product-media', ProductMedia);
}

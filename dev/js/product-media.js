import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { Fancybox } from '@fancyapps/ui';

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
      modules: [Navigation],
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
      mainClass: 'image-zoom',
    });
  }
}

if (!customElements.get('product-media')) {
  customElements.define('product-media', ProductMedia);
}

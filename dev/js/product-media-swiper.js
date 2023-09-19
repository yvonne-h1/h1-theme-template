import Swiper from 'swiper';
import { A11y, Navigation, Thumbs } from 'swiper/modules';
import { Fancybox } from '@fancyapps/ui';

class ProductMediaSlider extends HTMLElement {
  constructor() {
    super();

    // Create elements
    this.thumbnailSwiper();
    this.mainSwiper();
    this.fancybox();

    // Reduce actions (So the event can also be removed)
    this.reducer = {
      slideToVariant: event => this.slideToVariant(event),
    };

    // Listen for variant change and go to slide
    document.addEventListener('variant-change', this.reducer.slideToVariant);
  }

  /*
    * Create thumb slider
    */
  thumbnailSwiper() {
    // Check if Swiper exists
    if (!Swiper) return false;

    // Get Thumbnails slider element & Set swiper options
    this.swiperThumbs = this.querySelector('[data-product-media-thumbnails-slider]');
    this.swiperThumbsOptions = {
      a11y: true,
      observer: true,
      spaceBetween: 8,
      slidesPerView: 3,
      slidesOffsetBefore: 16,
      slidesOffsetAfter: 16,
      centerInsufficientSlides: true,
      modules: [A11y, Thumbs],
      breakpoints: {
        375: {
          slidesPerView: 3.2,
          slidesOffsetBefore: 16,
          slidesOffsetAfter: 16,
        },
        580: {
          slidesPerView: 4.2,
          slidesOffsetBefore: 16,
          slidesOffsetAfter: 16,
        },
        768: {
          slidesPerView: 5.2,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0,
        },
        1441: {
          slidesPerView: 6.2,
          slidesOffsetBefore: 0,
          slidesOffsetAfter: 0,
        },
      },
    };

    // Create Thumbnails slider
    this.swiperThumbsInstance = new Swiper(this.swiperThumbs, this.swiperThumbsOptions);

    // Rebuild Swiper in design mode after delay
    if (Shopify.designMode && this.swiperThumbsInstance) {
      window.addEventListener('shopify:section:load', () => {
        setTimeout(() => {
          this.swiperThumbsInstance.update();
        }, 300);
      });
    }
  }

  /*
    * Create main slider
    */
  mainSwiper() {
    // Check if Swiper exists
    if (!Swiper) return false;

    // Get swiper element
    this.swiperMain = this.querySelector('[data-product-media-swiper]');

    // Get thumb options
    let thumbOptions;
    if (this.swiperThumbsInstance) {
      thumbOptions = {
        thumbs: {
          swiper: this.swiperThumbsInstance.hostEl,
          slideThumbActiveClass: 'swiper-slide-thumb-active',
          multipleActiveThumbs: false,
          autoScrollOffset: 1,
        },
      };
    }

    // Get initial slide and swiper index
    let initialSlideIndex = 0;
    const initialVariantId = parseInt(this.swiperMain.dataset.productMediaSlider);

    if (initialVariantId) {
      const initialSlide = this.matchVariantIdWithSlide(initialVariantId);
      initialSlideIndex = initialSlide ? initialSlide : initialSlideIndex;
    }

    // Swiper options
    this.swiperMainOptions = {
      a11y: true,
      rewind: true,
      observer: true,
      initialSlide: initialSlideIndex,
      modules: [Navigation, A11y, Thumbs],
      navigation: {
        nextEl: '.product-media-swiper__button-next',
        prevEl: '.product-media-swiper__button-prev',
      },
      ...thumbOptions,
    };

    // Create Main slider
    this.swiperMainInstance = new Swiper(this.swiperMain, this.swiperMainOptions);

    // Rebuild Swiper in design mode
    if (Shopify.designMode && this.swiperMainInstance) {
      window.addEventListener('shopify:section:load', () => {
        this.swiperMainInstance.update();
      });
    }
  }

  /*
    * Create fancybox
    */
  fancybox() {
    // Check if Fancybox exists
    if (!Fancybox) return false;

    Fancybox.bind('[data-fancybox]', {
      animated: false,
      showClass: false,
      dragToClose: false,
      trapFocus: false,
      placeFocusBack: false,
      autoFocus: false,
      mainClass: 'fancybox-products',
      Thumbs: {
        type: 'modern',
      },
      Images: {
        // Disable animation from/to thumbnail on start/close
        zoom: true,
      },
      on: {
        ready: (fancybox) => {
          trapFocus(fancybox.$container);
        },
        destroy: () => {
          removeTrapFocus();
        },
      },
    });
  }

  /*
    * Slide to variant
    * @Param event {object}: event object with variant
    */
  slideToVariant(event) {
    if (event?.detail?.variant?.id) {
      const slideIndex = this.matchVariantIdWithSlide(event.detail.variant.id);
      if (typeof slideIndex == 'number') this.goToSlide(slideIndex);
    }
  }

  /*
    * Match variant id with slide
    * @param id {int}: variant id
    */
  matchVariantIdWithSlide(id) {
    if (!id || !this.swiperMain) return false;

    // Get slides
    const slides = this.swiperMain.querySelectorAll('[data-product-variant-image]');

    // Match id with slides id's
    const slide = [...slides].find((slide) => {
      // Get variant id's attached to slide
      const slideVariants = JSON.parse(slide.dataset.productVariantImage);

      // Check if variant id match the slide variant id's
      if (slideVariants.includes(id)) return slide;
    });

    // return false if no slide found
    if (!slide) return false;

    // return matched slide index
    return this.getNodeIndex(slide);
  }

  /*
    * go to slide
    * @param slide {node} / {int}: slide node / index
    */
  goToSlide(slide) {
    if ((typeof slide != 'number' && typeof slide != 'object') || !this.swiperMainInstance) return false;

    // Get index, transform node to slide index or string to int
    const index = typeof slide == 'number' ? parseInt(slide) : this.getNodeIndex(slide);

    // go to slide
    this.swiperMainInstance.slideTo(index);
  }

  getNodeIndex(node) {
    return Array.from(node.parentNode.children).indexOf(node);
  }
}

if (!customElements.get('product-media-swiper')) {
  customElements.define('product-media-swiper', ProductMediaSlider);
}
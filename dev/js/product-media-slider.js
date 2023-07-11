(async () => {
  if (!customElements.get('product-media-slider')) {
    const {
      default: Swiper,
      Navigation,
      Pagination,
      Scrollbar,
      Autoplay,
      Thumbs,
    } = await import('swiper');

    const { Fancybox } = await import('@fancyapps/ui');

    Swiper.use([Navigation, Pagination, Scrollbar, Autoplay, Thumbs]);

    class ProductMediaSlider extends HTMLElement {
      constructor() {
        super();

        // Create elements
        this.thumbSlider();
        this.mainSlider();
        this.fancybox();

        // Reduce actions (So the event can also be removed)
        this.reducer = {
          slideToVariant: (e) => this.slideToVariant(e),
        };

        // Listen for variant change and go to slide
        document.addEventListener('variant-change', this.reducer.slideToVariant);
      }

      /*
       * Create thumb slider
       */
      thumbSlider() {
        // Check if Swiper exists
        if (!Swiper) {
          return false;
        }

        // Get Thumbnails slider element & Set swiper options
        this.swiperThumbs = this.querySelector('[data-product-media-thumbnails-slider]');
        this.swiperThumbsOptions = {
          threshold: 10,
          spaceBetween: 8,
          direction: 'horizontal',
          slidesPerView: 'auto',
          watchSlidesProgress: true,
          navigation: {
            nextEl: '.swiper-button-thumbnails-next',
            prevEl: '.swiper-button-thumbnails-prev',
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
      mainSlider() {
        // Check if Swiper exists
        if (typeof Swiper == 'undefined') {
          return false;
        }

        // Get swiper element
        this.swiperMain = this.querySelector('[data-product-media-slider]');

        // Get thumb options
        let thumbOptions;
        if (this.swiperThumbsInstance) {
          thumbOptions = {
            thumbs: {
              swiper: this.swiperThumbsInstance,
              slideThumbActiveClass: 'swiper-slide-thumb-active border-primary',
            },
          };
        }

        // Get initial slide and swiper index
        let initialSlideIndex = 0;
        const initalVariant = parseInt(this.swiperMain.dataset.productMediaSlider);

        if (initalVariant) {
          const initialSlide = this.matchVariantIdWithSlide(initalVariant);
          initialSlideIndex = initialSlide ? initialSlide : initialSlideIndex;
        }

        // Swiper options
        this.swiperMainOptions = {
          threshold: 10,
          direction: 'horizontal',
          initialSlide: initialSlideIndex,
          navigation: {
            nextEl: '.product-media-slider__button-next',
            prevEl: '.product-media-slider__button-prev',
          },
          ...thumbOptions,
        };

        // Create Main slider
        this.swiperMainInstance = new Swiper(this.swiperMain, this.swiperMainOptions);

        // Rebuid Swiper in design mode
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
        if (typeof Swiper == 'undefined') {
          return false;
        }

        Fancybox.bind('[data-fancybox]', {
          animated: false,
          showClass: false,
          mainClass: 'image-zoom',
        });
      }

      /*
       * Slide to variant
       * @Param e {object}: event object with variant
       */
      slideToVariant(e) {
        if (e?.detail?.variant?.id) {
          const slideIndex = this.matchVariantIdWithSlide(e.detail.variant.id);
          if (typeof slideIndex == 'number') {
            this.goToSlide(slideIndex);
          }
        }
      }

      /*
       * Match variant id with slide
       * @param id {int}: variant id
       */
      matchVariantIdWithSlide(id) {
        if (!id || !this.swiperMain) {
          return false;
        }

        // Get slides
        const slides = this.swiperMain.querySelectorAll('[data-product-variant-image]');

        // Match id with slides id's
        const slide = [...slides].find((slide) => {
          // Get variant id's attached to slide
          const slideVariants = JSON.parse(slide.dataset.productVariantImage);

          // Check if variant id match the slide variant id's
          if (slideVariants.includes(id)) {
            return slide;
          }
        });

        // return false if no slide found
        if (!slide) {
          return false;
        }

        // return matched slide index
        return getNodeIndex(slide);
      }

      /*
       * go to slide
       * @param slide {node} / {int}: slide node / index
       */
      goToSlide(slide) {
        if ((typeof slide != 'number' && typeof slide != 'object') || !this.swiperMainInstance) {
          return false;
        }

        // Get index, transform node to slide index or string to int
        const index = typeof slide == 'number' ? parseInt(slide) : getNodeIndex(slide);

        // go to slide
        this.swiperMainInstance.slideTo(index);
      }
    }

    window.ProductMediaSlider = ProductMediaSlider;

    customElements.define('product-media-slider', ProductMediaSlider);
  }
})();

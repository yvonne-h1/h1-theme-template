/**
 * SwiperSlider
 * @description Web component used to create sliders, configurable with data-options attribute.
 * @documentation https://swiperjs.com/swiper-api
 *
 * To prevent CLS update the custom variables with the values used for each breakpoint. Variables are
 * --swiper-slidesPerView
 * --swiper-spaceBetween
 * Remove the variables when using 1 sliderPerView.
 *
 * @example
<swiper-slider data-options='{
    "threshold": 10,
    "loop": false,
    "scrollbar": true,
    "navigation": {
      "nextEl": ".swiper-button-next-{{ section.id }}",
      "prevEl": ".swiper-button-prev-{{ section.id }}"
    },
    "pagination": {
      "el": ".swiper-pagination-{{ section.id }}",
      "type": "bullets"
    },
    "slidesPerView": 1,
    "spaceBetween": 16,
    "breakpoints": {
      "768": {
        "slidesPerView": 2,
        "spaceBetween": 24
      },
      "1024": {
        "slidesPerView": 3,
        "spaceBetween": 32
      }
    }
  }'>
  <div class="swiper" [--swiper-spaceBetween:16px]
      md:[--swiper-slidesPerView:2]
      md:[--swiper-spaceBetween:24px]
      lg:[--swiper-slidesPerView:3]
      md:[--swiper-spaceBetween:32px]
      data-swiper>
    <div class="swiper-wrapper flex">
      {%- for item in (1..8) -%}
        <div class="swiper-slide" data-swiper-slide-index="{{ forloop.index }}">
          <h2>
            Your slide
          </h2>
        </div>
      {%- endfor -%}
    </div>

    <button
      class="swiper-button-prev swiper-button-prev-{{ section.id }} "
      aria-label="{% render "render-translation", namespace: "accessibility", key: "previous_slide", fallback: "Previous slide" %}"
    >
      {%- render 'icons', icon: 'chevron-left', icon_class: 'w-5' -%}
    </button>
    <button
      class="swiper-button-next swiper-button-next-{{ section.id }} "
      aria-label="{% render "render-translation", namespace: "accessibility", key: "next_slide", fallback: "Next slide" %}"
    >
      {%- render 'icons', icon: 'chevron-right', icon_class: 'w-5' -%}
    </button>

    <div class="swiper-pagination swiper-pagination-{{ section.id }} flex justify-center"></div>
    <div class="swiper-scrollbar  swiper-scrollbar-{{ section.id }}"></div>
  </div>
</swiper-slider>
 */
import Swiper from 'swiper';
import { A11y, Navigation, Pagination, Scrollbar, Autoplay } from 'swiper/modules';

class SwiperSlider extends HTMLElement {
  constructor() {
    super();

    this.swiper = this.querySelector('[data-swiper]');

    // Stop when the swiper is not found
    if (!this.swiper) return;

    // Default to improve user experience
    this.swiperOptions = {
      observer: true,
      threshold: 10,
      isRecommendations: false,
      modules: [A11y],
      destroyAfter: false,
      hasVideo: false,
    };

    // Check if we have extra options on the HTML
    if (this.dataset.options) {
      const options = JSON.parse(this.dataset.options);
      if (options) {
        this.swiperOptions = {
          ...this.swiperOptions,
          ...options,
        };
      }
    }

    // Load the Navigation, Pagination, Scrollbar, Autoplay modules as needed
    if (this.swiperOptions.pagination) this.swiperOptions.modules.push(Pagination);
    if (this.swiperOptions.navigation) this.swiperOptions.modules.push(Navigation);
    if (this.swiperOptions.scrollbar) this.swiperOptions.modules.push(Scrollbar);
    if (this.swiperOptions.autoplay) this.swiperOptions.modules.push(Autoplay);

    if (this.swiperOptions.destroyAfter) {
      window.addEventListener('resize', debounce(() => {
        const ww = window.innerWidth;
        if (ww >= this.swiperOptions.destroyAfter && this.swiperInstance) {
          this.swiperInstance.destroy();
        }
        else {
          this.init();
        }
      }, 50));

      window.addEventListener('DOMContentLoaded',() => {
        const ww = window.innerWidth;
        if (ww >= this.swiperOptions.destroyAfter && this.swiperInstance) {
          this.swiperInstance.destroy();
        }
        else if (ww < this.swiperOptions.destroyAfter) {
          this.init();
        }
      });
    }
    else {
      // render the options and init the swiper
      this.init();
    }

    // When the swiper has video
    if (this.swiperOptions.hasVideo) {
      this.debouncedOnLoad = debounce((event) => {
        this.swiperObserver(event.type);
      }, 100);

      // check if the swiper is visible
      window.addEventListener('load', this.debouncedOnLoad.bind(this));

      window.addEventListener('scroll', this.debouncedOnLoad.bind(this));

      // when the swiper contains a video, pause it when it's swiped out and play it if it's swiped into view and has autoplay enabled
      this.swiperInstance.on('slideChangeTransitionEnd', (swiper) => {
        const previousSlide = swiper.slides[swiper.previousIndex];
        const previousSlideType = previousSlide.dataset.swiperVideoType;
        const previousVideo = previousSlide.querySelector(previousSlideType);

        const currentSlide = swiper.slides[swiper.activeIndex];
        const currentSlideType = currentSlide.dataset.swiperVideoType;
        const currentVideo = currentSlide.querySelector(currentSlideType);

        if (previousVideo && !this.getPausedState(previousVideo, previousSlideType)) previousVideo.pauseVideo();
        if (currentVideo && currentVideo.options.autoplay && !this.getPausedState(currentVideo, currentSlideType) && currentVideo.dataset.videoIsPaused !== 'true') currentVideo.playVideo();
      });
    }

    // Listen to extra events when in Shopify editor
    if (Shopify.designMode) {
      // Update the swiper when the section event is triggered
      window.addEventListener('shopify:section:load', event => this.init(event, true));

      // When on block select go to the slide in front-end
      window.addEventListener('shopify:block:select', event => this.handleBlockSelect(event));

      // When on block deselect go to the slide in front-end
      window.addEventListener('shopify:block:deselect', event => this.handleBlockSelect(event));
    }
  }

  getPausedState(video, type) {
    switch (type) {
    case 'youtube-video':
      return video.getPausedState();
    case 'vimeo-video':
      return video.paused;
    case 'custom-video':
      return video.videoElement.paused;
    }
  };

  swiperObserver() {
    if (!this.swiperInstance) return;

    // Register IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const elementBounds = entry.boundingClientRect;
        const isBottomVisible = !!(elementBounds.bottom < window.innerHeight) && elementBounds.bottom;
        const isTopVisible = !!(elementBounds.top > 0) && elementBounds.top;

        const swiper = this.swiperInstance;
        const currentSlide = swiper.slides[swiper.activeIndex];
        const currentSlideType = currentSlide.dataset.swiperVideoType;
        const currentVideo = currentSlide.querySelector(currentSlideType);

        if (isBottomVisible && isTopVisible || entry.isIntersecting && entry.intersectionRatio > 0.9) {
          if (currentVideo && currentVideo.options.autoplay) currentVideo.playVideo();
        }
        else if (!this.getPausedState(currentVideo, currentSlideType)) currentVideo.pauseVideo();
      });
    });
    observer.observe(this);
  }

  init(event = null, updateSwiper = false) {
    // only used for the Theme Editor to check if the swiper matches the section that was updated
    if (updateSwiper && event.detail.sectionId !== this.swiperOptions.sectionID) return;

    // Check if we have extra options on the HTML
    if (this.dataset.options) {
      const options = JSON.parse(this.dataset.options);
      if (options) {
        this.swiperOptions = {
          ...this.swiperOptions,
          ...options,
        };
      }
    }

    if (this.swiperOptions.destroyAfter) {
      const ww = window.innerWidth;
      if (ww >= this.swiperOptions.destroyAfter && this.swiperInstance) {
        this.swiperInstance.destroy();
        return;
      }
    }

    if (updateSwiper) {
      this.updateSwiper();
    }
    else {
      // Call swiper with selected swiper element and options
      this.swiperInstance = new Swiper(this.swiper, this.swiperOptions);
    }
  }

  updateSwiper() {
    this.swiperInstance.update();

    if (this.swiperOptions.navigation?.nextEl) {
      this.swiperInstance.navigation.init();
      this.swiperInstance.navigation.update();
    }
    if (this.swiperOptions.pagination?.el) {
      this.swiperInstance.pagination.init();
      this.swiperInstance.pagination.render();
    }
    // SCROLLBAR doesn't update in the theme editor. This seems to be a bug in swiper.
    if (this.swiperOptions.scrollbar?.el) {
      this.swiperInstance.scrollbar.init();
      this.swiperInstance.scrollbar.updateSize();
      this.swiperInstance.scrollbar.setTranslate();
    }
  }

  /**
   * Handles the theme editor block change/edit event
   * @param {Object} event
   */
  handleBlockSelect(event) {
    if (event.detail.sectionId !== this.swiperOptions.sectionID) return;

    // Check if the slide index is set
    if (!('swiperSlideIndex' in event.target.dataset)) return;

    // Set the slide index based on loop settings or not
    let swipeToSlideIndex = parseInt(event.target.dataset.swiperSlideIndex) - 1;
    if (this.swiperOptions.loop) swipeToSlideIndex = parseInt(event.target.dataset.swiperSlideIndex) + 1;

    // Slide to slide based on the data attribute from the target
    const sliderToUpdate = event.target.closest('[data-swiper]');
    sliderToUpdate.swiper.slideTo(swipeToSlideIndex, 1000);
  }
}

if (!customElements.get('swiper-slider')) {
  customElements.define('swiper-slider', SwiperSlider);
}

class ProductRecommendations extends SwiperSlider {
  constructor() {
    super();

    const dataOptions = this.querySelector('swiper-slider').dataset.options;
    // Check if we have extra options on the HTML
    if (dataOptions) {
      const options = JSON.parse(dataOptions);
      if (options) {
        this.swiperOptions = {
          ...this.swiperOptions,
          ...options,
        };
      }
    }

    this.init();
  }

  init() {
    if (this.dataset && this.dataset.url) {
      fetch(this.dataset.url)
        .then(response => response.text())
        .then((text) => {

          const html = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('[data-recommended-products]').innerHTML;
          this.querySelector('[data-recommended-products]').innerHTML = html;

          this.swiperInstance = new Swiper(this.swiper, this.swiperOptions);
        })
        .catch((event) => {
          debug() && console.error(event);
        });
    }
  }
}

if (!customElements.get('product-recommendations')) {
  customElements.define('product-recommendations', ProductRecommendations);
}


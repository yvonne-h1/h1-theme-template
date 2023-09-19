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
      modules: [A11y, Navigation, Pagination, Scrollbar, Autoplay],
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

    // render the options and init the swiper
    this.initOptions();

    // Listen to extra events when in Shopify editor
    if (Shopify.designMode) {
      // Update the swiper when the section event is triggered
      window.addEventListener('shopify:section:load', event => this.initOptions(event, true));

      // When on block select go to the slide in front-end
      window.addEventListener('shopify:block:select', event => this.handleBlockSelect(event));

      // When on block deselect go to the slide in front-end
      window.addEventListener('shopify:block:deselect', event => this.handleBlockSelect(event));
    }
  }

  initOptions(event = null, updateSwiper = false) {
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

    if (updateSwiper) {
      this.swiperInstance.update();

      if (this.swiperOptions.navigation.nextEl) {
        this.swiperInstance.navigation.init();
        this.swiperInstance.navigation.update();
      }
      if (this.swiperOptions.pagination.el) {
        this.swiperInstance.pagination.init();
        this.swiperInstance.pagination.render();
      }
      // SCROLLBAR doesn't update in the theme editor. This seems to be a bug in swiper.
      if (this.swiperOptions.scrollbar.el) {
        this.swiperInstance.scrollbar.init();
        this.swiperInstance.scrollbar.updateSize();
        this.swiperInstance.scrollbar.setTranslate();
      }
    }
    else {
      // Call swiper with selected swiper element and options
      this.swiperInstance = new Swiper(this.swiper, this.swiperOptions);
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

    // Only do it once, not on every web component render.
    window.onload = () => this.init();
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
        .catch((event) => {
          debug() && console.error(event);
        });
    }
  }
}

if (!customElements.get('product-recommendations')) {
  customElements.define('product-recommendations', ProductRecommendations);
}


/** Use as:
  <div is="custom-video" class="video-wrapper">
    <div class="img (img--double or img--landscape) img--cover">
      <video {% if video_placeholder != blank %}poster="{{ video_placeholder | img_url: 'master' }}"{% endif %} preload muted playsinline>
        <source src="{{- video_url -}}" type="video/mp4" />
      </video>
      <button class="button button--link" data-video-play-button>
        {%- render 'global-icon', icon: 'play' -%}
      </button>
    </div>
  </div>

  Note that custom elements cannot be used in a page template, hence the is="custom-video" property. This needs a polyfill for iOS!!!
*/

if(!customElements.get('custom-video')) {
  class CustomVideo extends HTMLElement {
    constructor() {
      super();

      this.options = {
        isSwiper: false,
        autoplay: false,
      };

      // Get options from element data and combine with this.options
      if (this?.dataset?.options) {
        this.options = JSON.parse(this.dataset.options);
      }

      if (typeof videoElement === 'undefined') {
        this.videoElement = this.querySelector('video');
        this.videoTrigger = this.querySelector('[data-video-trigger]');
        this.videoContent = this.querySelector('[data-video-content]');

        // video and button click
        this.videoTrigger.addEventListener('click', this.loadVideo.bind(this));
        this.videoElement.addEventListener('click', this.loadVideo.bind(this));

        this.debouncedOnLoad = debounce((event) => {
          this.videoObserver(event);
        }, 100);

        if (this.options.autoplay) {
          // play video on scroll
          window.addEventListener('scroll', this.debouncedOnLoad.bind(this));

          this.videoObserver();
        }
      }
      else {
        // this is used when calling this function from inside a slider
        this.videoElement = videoElement;
        this.videoTrigger = videoTrigger;
        this.videoObserver();
      }

      if (this.options.isSwiper) {
        // play the video on load
        document.addEventListener('swiper-loaded', (event) => {
          const swiper = event.detail.swiper;
          if (!swiper) return;

          const currentSlide = swiper.slides[swiper.activeIndex].querySelector('custom-video');
          if (currentSlide && this.options.autoplay) this.playVideo();
        });
        // pause the video on hide
        document.addEventListener('swiper-hidden', (event) => {
          const swiper = event.detail.swiper;
          if (!swiper) return;

          const currentSlide = swiper.slides[swiper.activeIndex].querySelector('custom-video');
          if (!currentSlide) return;

          if (currentSlide) this.pauseVideo();
        });

        // listen for the slide change event
        document.addEventListener('slide-change', (event) => {
          const swiper = event.detail.swiper;
          if (!swiper) return;

          const previousSlide = swiper.slides[swiper.previousIndex].querySelector('custom-video');
          const currentSlide = swiper.slides[swiper.activeIndex].querySelector('custom-video');

          if (previousSlide && this.videoElement.playing) this.pauseVideo();
          if (currentSlide && this.options.autoplay === 1 && !this.videoElement.playing) this.playVideo();
        });
      }
    }

    videoObserver() {
      if (this.options.isSwiper) return;

      // Register IntersectionObserver
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const isPortrait = window.innerWidth < 768;
          const elementBounds = entry.boundingClientRect;
          const isBottomVisible = elementBounds.bottom < window.innerHeight;
          const isTopVisible = elementBounds.top > 0;
          // portrait video might be outside viewport on mobile, so it should still play on load
          if (
            (isPortrait && isTopVisible) ||
            (!isPortrait && isBottomVisible && isTopVisible)
          ) {
            this.playVideo();
          }
          else {
            this.pauseVideo();
          }
        });
      });

      // If video is playing, observe it. This data element is also set when a customer clicks to pause so it doesn't start playing again
      if (this.videoElement.dataset.videoIsPaused !== 'true') {
        observer.observe(this.videoElement);
      }
    }

    // When video is manually paused, add data attribute to keep track of paused state
    loadVideo() {
      if (this.videoElement.paused) {
        this.playVideo();
        this.videoElement.dataset.videoIsPaused = 'false';
      }
      else {
        this.pauseVideo();
        this.videoElement.dataset.videoIsPaused = 'true';
      }
    }

    playVideo() {
      this.videoTrigger.classList.add('hidden');
      this.videoContent.classList.add('hidden');
      this.videoElement.play();
    }

    pauseVideo() {
      this.videoTrigger.classList.remove('hidden');
      this.videoContent.classList.remove('hidden');
      this.videoElement.pause();
    }
  }

  window.CustomVideo = CustomVideo;

  customElements.define('custom-video', CustomVideo);
}

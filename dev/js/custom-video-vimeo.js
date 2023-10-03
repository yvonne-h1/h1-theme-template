/** Use as:
  <vimeo-video class="video-element aspect-video data-options='{}'>
  <iframe
    src="https://player.vimeo.com/video/{{ video_id }}?autoplay=1{{ loop }}"
    class="js-vimeo h-full w-full"
    allow="autoplay; encrypted-media"
    allowfullscreen
    title="{{ section.settings.video_description }}"
  ></iframe>
  </vimeo-video>

  Example video: https://vimeo.com/215656349
*/

class CustomVimeoVideo extends HTMLElement {
  constructor() {
    super();

    this.videoTriggers = this.querySelectorAll('[data-video-trigger]');
    this.videoContent = this.querySelector('[data-video-content]');

    this.options = {
      id: '',
      autoplay: false,
      isSwiper: false,
    };

    if (this?.dataset?.options) {
      const dataOptions = JSON.parse(this.dataset.options);
      this.options = {
        ...this.options,
        ...dataOptions,
      };
    }

    // init video
    this.player = new Vimeo.Player(this.querySelector('iframe'));
    this.paused = true;

    this.player.on('pause', () => {
      this.paused = true;
      this.showPlayerElements();
    });

    this.videoTriggers.forEach(trigger => trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.playVideo();
    }));

    this.debouncedOnLoad = debounce((event) => {
      this.videoObserver(event.type);
    }, 100);

    if (this.options.autoplay) {
      // mute the video
      this.player.setVolume(0);

      // play video on scroll
      window.addEventListener('scroll', this.debouncedOnLoad.bind(this));

      // play video if it's visible on load
      window.addEventListener('load', this.debouncedOnLoad.bind(this));
    }

    if (this.options.isSwiper) {
    // play the video on load
      document.addEventListener('swiper-loaded', (event) => {
        const swiper = event.detail.swiper;
        if (!swiper) return;

        const currentSlide = swiper.slides[swiper.activeIndex].querySelector('vimeo-video');
        if (!currentSlide) return;

        if (currentSlide && this.options.autoplay) this.playVideo();
      });
      // pause the video on hide
      document.addEventListener('swiper-hidden', (event) => {
        const swiper = event.detail.swiper;
        if (!swiper) return;

        const currentSlide = swiper.slides[swiper.activeIndex].querySelector('vimeo-video');
        if (!currentSlide) return;

        if (currentSlide) this.pauseVideo();
      });

      document.addEventListener('slide-change', (event) => {
        const swiper = event.detail.swiper;
        if (!swiper) return;

        window.removeEventListener('scroll', this.debouncedOnLoad.bind(this));

        const previousSlide = swiper.slides[swiper.previousIndex].querySelector('vimeo-video');
        const currentSlide = swiper.slides[swiper.activeIndex].querySelector('vimeo-video');

        if (previousSlide && !this.paused) this.pauseVideo();
        if (currentSlide && this.options.autoplay && this.paused) this.playVideo();
      });
    }
  }

  videoObserver() {
    if (this.options.isSwiper) return;

    // Register IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const elementBounds = entry.boundingClientRect;
        const isBottomVisible = !!(elementBounds.bottom < window.innerHeight) && elementBounds.bottom;
        const isTopVisible = !!(elementBounds.top > 0) && elementBounds.top;

        if (isBottomVisible && isTopVisible || entry.isIntersecting && entry.intersectionRatio > 0.9) {
          this.playVideo();
        }
        else {
          this.pauseVideo();
        }
      });
    });
    observer.observe(this);
  }

  playVideo() {
    if (!this.player) return;
    this.player.play()
      .then(() => {
      // The video is playing
        this.paused = false;
        this.hidePlayerElements();
      })
      .catch((error) => {
        console.error(error.name);
      });
  }

  pauseVideo() {
    if (!this.player) return;

    this.player.pause()
      .then(() => {
        this.paused = true;
        // The video is paused
        this.showPlayerElements();
      })
      .catch((error) => {
        console.error(error.name);
      });
  }

  hidePlayerElements() {
    this.videoTriggers.forEach(trigger => trigger.classList.add('hidden'));
    this.videoContent?.classList.add('hidden');
  }

  showPlayerElements() {
    this.videoTriggers.forEach(trigger => trigger.classList.remove('hidden'));
    this.videoContent?.classList.remove('hidden');
  }
}

if (!customElements.get('vimeo-video')) {
  customElements.define('vimeo-video', CustomVimeoVideo);
}

/** Use as:
  <youtube-video class="video-element aspect-video data-options='{}'>
    <div class="video-element__placeholder" data-video-trigger>
      <img src="{{ poster }}"> // placeholder image
      <button
        class="video-element__button button button--primary h-12 w-12 rounded-full p-2 touch:p-3"
        aria-label="{%- render 'render-translation', namespace: 'products.product.media', key: 'play_video', fallback: 'Play video' -%}"
        data-video-play-button>
        {%- render 'icons', icon: 'play', icon_size: 'w-4' -%}
      </button>
    </div>
    <div id="ytplayer"></div>
  </youtube-video>

  Example video: https://www.youtube.com/watch?v=_8yZMfDfkbw
*/

class CustomYTVideo extends HTMLElement {
  constructor() {
    super();

    var tag = document.createElement('script');

    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    this.options = {
      id: '',
      autoplay: false,
      video_element_id: 'ytplayer',
      isSwiper: false,
    };

    if (this?.dataset?.options) {
      const dataOptions = JSON.parse(this.dataset.options);
      this.options = {
        ...this.options,
        ...dataOptions,
      };
    }

    // if ID is missing, return
    if (this.options.id === '') {
      debug() && console.error('youtube ID is missing');
      return;
    }

    // overwrite true/false with integer
    this.options.autoplay
      ? (this.options.autoplay = 1) && (this.options.muted = 1)
      : (this.options.autoplay = 0) && (this.options.muted = 0);

    this.player;
    this.videoTriggers = this.querySelectorAll('[data-video-trigger]');
    this.videoContent = this.querySelector('[data-video-content]');

    window.playerIsReady = false;

    // init video
    this.loadVideo();

    this.debouncedOnLoad = debounce((event) => {
      this.videoObserver(event.type);
    }, 100);

    if (this.options.autoplay === 1) {
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

        const currentSlide = swiper.slides[swiper.activeIndex].querySelector('youtube-video');
        if (!currentSlide) return;

        if (currentSlide && this.options.autoplay === 1) this.playVideoFunc();
      });
      // pause the video on hide
      document.addEventListener('swiper-hidden', (event) => {
        const swiper = event.detail.swiper;
        if (!swiper) return;

        const currentSlide = swiper.slides[swiper.activeIndex].querySelector('youtube-video');
        if (!currentSlide) return;

        if (currentSlide) this.pauseVideoFunc();
      });

      // listen for the slide change event
      document.addEventListener('slide-change', (event) => {
        const swiper = event.detail.swiper;
        if (!swiper) return;

        const previousSlide = swiper.slides[swiper.previousIndex].querySelector('youtube-video');
        const currentSlide = swiper.slides[swiper.activeIndex].querySelector('youtube-video');
        const playerState = this.player.getPlayerState(); // 2 is paused
        console.log(playerState, this.options.autoplay, currentSlide);

        if (previousSlide && playerState !== 2) this.pauseVideoFunc();
        if (currentSlide && this.options.autoplay === 1 && playerState !== 1 && this.dataset.videoIsPaused === 'false') this.playVideoFunc();
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

        if (window.playerIsReady) {
          if (isBottomVisible && isTopVisible || entry.isIntersecting && entry.intersectionRatio > 0.9) {
            this.playVideoFunc();
          }
          else {
            this.pauseVideoFunc();
          }
        }
        else {
          this.loadVideo();
        }
      });
    });
    if (this.dataset.videoIsPaused !== 'true') {
      observer.observe(this);
    }
  }

  loadVideo() {
    const self = this;

    window.onYouTubeIframeAPIReady = () => {
      const player = new YT.Player(self.options.video_element_id, {
        height: '100%',
        width: 1440,
        videoId: self.options.id,
        playerVars: {
          rel: 0,
          playsinline: self.options.autoplay,
          autoplay: self.options.autoplay,
          mute: self.options.muted,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });

      function onPlayerStateChange(event) {
        // playing
        if (event.data === 1) {
          self.dataset.videoIsPaused = 'false';
        }
        // paused
        if (event.data === 2) {
          self.dataset.videoIsPaused = 'true';
          // if video is paused, show placeholder
          self.showPlayerElements();
        }
      }

      function onPlayerReady() {
        window.playerIsReady = true;
        player.stopVideo(); // prevent video from playing
        self.player = player;

        self.videoTriggers.forEach(trigger => trigger.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          self.playVideoFunc();
        }),
        );

        // when autoplay is enabled, let observer determine if it should play
        if (self.options.autoplay === 1) {
          self.videoObserver();
        }
      }
    };
  }

  playVideoFunc() {
    if (!this.player) return;

    this.player.playVideo();
    this.hidePlayerElements();
  }

  pauseVideoFunc() {
    if (!this.player) return;

    this.player.pauseVideo();
    this.showPlayerElements();

    this.dataset.videoIsPaused = 'true';
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

if (!customElements.get('youtube-video')) {
  customElements.define('youtube-video', CustomYTVideo);
}

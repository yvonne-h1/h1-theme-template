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

    this.options = {
      id: '',
      autoplay: false,
      loop: false,
      controls: true,
      isSwiper: false,
      wrapperID: '',
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
      debug() && console.error('vimeo ID is missing');
      return;
    }

    this.videoTriggers = this.querySelectorAll('[data-video-trigger]');
    this.videoContent = this.querySelector('[data-video-content]');
    this.paused = true;

    this.debouncedOnLoad = debounce(() => {
      this.videoObserver();
    }, 100);

    if (this.options.autoplay) {
      // mute the video
      this.dataset.videoIsPaused = 'false';

      // play video on scroll
      window.addEventListener('scroll', this.debouncedOnLoad.bind(this));

      // play video if it's visible on load
      window.addEventListener('load', this.debouncedOnLoad.bind(this));
    }

    this.videoTriggers.forEach(trigger => trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.playVideo();
    }));

    if (!this.options.isSwiper) {
      this.loadVideo();
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
        else if (!this.paused) this.pauseVideo(false);
      });
    });
    observer.observe(this);
  }

  loadVideo() {
    // init video
    this.player = new Vimeo.Player(this.options.wrapperID, {
      ...this.options,
      height: 810,
      width: 1440,
      playsinline: true,
      muted: this.options.autoplay,
      autopause: false,
    });

    this.paused = false;

    this.player.on('pause', () => {
      this.paused = true;
      this.showPlayerElements();
    });

    this.player.on('ended', () => {
      this.showPlayerElements();
      this.dataset.videoIsPaused = 'true';
    });
  }

  /**
   * You can't programmatically trigger the initial playback of a Vimeo video,
   * so, in the case of a slider, the trigger comes when the slider is in view and autoplay is enabled.
   *
   */
  playVideo() {
    if (!this.player) {
      this.loadVideo();
      if (this.options.autoplay) {
        this.hidePlayerElements();
      }
    }
    else {
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
  }

  pauseVideo() {
    if (!this.player) return;

    this.player.pause()
      .then(() => {
        this.paused = true;
        this.showPlayerElements();

        this.dataset.videoIsPaused = 'true';
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

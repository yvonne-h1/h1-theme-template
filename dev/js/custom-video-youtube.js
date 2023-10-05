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
      loop: false,
      controls: true,
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

    this.player;
    this.videoTriggers = this.querySelectorAll('[data-video-trigger]');
    this.videoContent = this.querySelector('[data-video-content]');
    window.playerIsReady = false;

    // init video
    this.loadVideo();

    this.debouncedOnLoad = debounce(() => {
      this.videoObserver();
    }, 100);

    if (this.options.autoplay) {
      // play video on scroll
      window.addEventListener('scroll', this.debouncedOnLoad.bind(this));

      // play video if it's visible on load
      window.addEventListener('load', this.debouncedOnLoad.bind(this));
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
            this.playVideo();
          }
          else if (!getPausedState()) this.pauseVideo(false);
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
          playsinline: (self.options.autoplay) ? 1 : 0,
          autoplay: (self.options.autoplay) ? 1 : 0,
          mute: (self.options.autoplay) ? 1 : 0,
          controls: (self.options.controls) ? 1 : 0,
          loop: (self.options.loop) ? 1 : 0,
          playlist: (self.options.loop) ? this.options.id : '',
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });

      function onPlayerStateChange(event) {
        // playing
        if (event.data === 1) {
          self.hidePlayerElements();
        }
        // paused
        if (event.data === 2) {
          // if video is paused, show placeholder
          self.showPlayerElements();
        }
        // hide the elements when the video is done
        if (event.data === 0) {
          // if video has ended, show placeholder
          self.showPlayerElements();
        }
      }

      function onPlayerReady() {
        player.stopVideo(); // prevent video from playing

        window.playerIsReady = true;
        self.dataset.videoIsPaused = 'false';
        self.player = player;

        self.videoTriggers.forEach(trigger => trigger.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          self.playVideo();
        }));

        // when autoplay is enabled, let observer determine if it should play
        if (self.options.autoplay) {
          self.videoObserver();
        }
      }
    };
  }

  getPausedState() {
    return (this.player.getPlayerState() === 2) ? true : false;
  }

  playVideo() {
    if (!this.player) return;

    this.player.playVideo();
    this.hidePlayerElements();
  }

  pauseVideo() {
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

/** Use as:
  <div is="custom-video" class="video-wrapper">
    <div class="img (img--double or img--landscape) img--cover">
      <video {% if video_placeholder != blank %}poster="{{ video_placeholder | img_url: 'master' }}"{% endif %} preload muted playsinline>
        <source src="{{- video_url -}}" type="video/mp4" />
      </video>
      <button class="button button--primary" data-video-trigger>
        {%- render 'icons', icon: 'play' -%}
      </button>
    </div>
  </div>

  Note that custom elements cannot be used in a page template, hence the is="custom-video" property. This needs a polyfill for iOS!!!
*/
class CustomVideo extends HTMLElement {
  constructor() {
    super();

    this.options = {
      isSwiper: false,
      autoplay: false,
      loop: false,
      controls: true,
    };

    // Get options from element data and combine with this.options
    if (this?.dataset?.options) {
      this.options = JSON.parse(this.dataset.options);
    }

    this.videoElement = this.querySelector('video');
    this.videoTriggers = this.querySelectorAll('[data-video-trigger]');
    this.videoContent = this.querySelector('[data-video-content]');

    // video and button click
    this.videoTriggers.forEach(trigger => trigger.addEventListener('click', this.loadVideo.bind(this)));
    this.videoElement.addEventListener('click', this.loadVideo.bind(this));

    this.debouncedOnLoad = debounce(() => {
      this.videoObserver();
    }, 100);

    if (this.options.autoplay) {
      // play video on scroll
      window.addEventListener('scroll', this.debouncedOnLoad.bind(this));

      this.videoObserver();
    }

    // If the video is not on a loop, hide the elements when it's done
    if (!this.options.loop) {
      this.videoElement.addEventListener('ended', () => {
        this.showPlayerElements();
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
        if ((isPortrait && isTopVisible) || (!isPortrait && isBottomVisible && isTopVisible)) {
          this.playVideo();
        }
        else if (!this.videoElement.paused) this.pauseVideo();
      });
    });

    // If video is playing, observe it. This data element is also set when a customer clicks to pause so it doesn't start playing again
    if (this.dataset.videoIsPaused !== 'true') {
      observer.observe(this.videoElement);
    }
  }

  // When video is manually paused, add data attribute to keep track of paused state
  loadVideo() {
    if (this.videoElement.paused) {
      this.playVideo();
      this.dataset.videoIsPaused = 'false';
    }
    else {
      this.pauseVideo();
      this.dataset.videoIsPaused = 'true';
    }
  }

  playVideo() {
    this.videoElement.play();
    this.hidePlayerElements();
  }

  pauseVideo() {
    this.videoElement.pause();
    this.showPlayerElements();
  }

  hidePlayerElements() {
    this.videoTriggers.forEach(trigger => trigger.classList.add('hidden'));
    this.videoContent.classList.add('hidden');
  }

  showPlayerElements() {
    this.videoTriggers.forEach(trigger => trigger.classList.remove('hidden'));
    this.videoContent.classList.remove('hidden');
  }
}

if(!customElements.get('custom-video')) {
  customElements.define('custom-video', CustomVideo);
}

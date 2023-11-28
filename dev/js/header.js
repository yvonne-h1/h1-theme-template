class HeaderComponent extends HTMLElement {
  constructor() {
    super();

    // select element
    this.headerElement = this;
    this.header = document.querySelector('[data-header]');
    this.headerWrapper = document.querySelector('.shopify-section-group-header-group');
    this.announcementBar = document.querySelector('#shopify-section-announcement-bar');
    this.headerInverse = !!this.headerElement.classList.contains('header--inverse');
    this.headerNav = this.querySelector('header-collapsible-component');
    this.mobileNavToggle = this.querySelector('mobile-nav-toggle');
    this.search = this.querySelector('[data-header-search]');
    this.searchToggle = this.querySelector('search-toggle');

    if (this.headerWrapper) {
      // scroll parameters
      this.currentScrollTop = 0;
      this.scrollOffset = 0;
      this.headerStart = 0;

      if (this.announcementBar) {
        const announcementBarHeight = this.announcementBar.offsetHeight;
        this.scrollOffset += announcementBarHeight;
        this.headerStart += announcementBarHeight;
      }

      if (this.headerElement) {
        this.scrollOffset += this.headerElement.offsetHeight;
      }

      // scroll event
      this.request = null; // Safe request animation frame
      this.timer = null; // Safe scroll timer

      window.addEventListener('scroll', debounce(() => {
        clearTimeout(this.timer);
        // A request animation frame is used to animate on max 60fps.
        if (!this.request) this.request = requestAnimationFrame(this.scrollAnimation.bind(this));
        this.timer = setTimeout(() => {
          // Stop animation, cancel request animation frame
          cancelAnimationFrame(this.request);
          this.request = null;
        }, 50);
      }, 10));
    }
  }

  scrollAnimation() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // only animate if header is closed.
    if (!document.body.classList.contains('desktop-submenu-is-open')) {
      if (scrollTop + window.innerHeight > document.body.clientHeight) {
        this.hide();
      }
      else if (scrollTop > this.currentScrollTop && scrollTop > this.scrollOffset) {
        this.hide();
      }
      else if (scrollTop <= this.headerStart) {
        this.revealTop();
      }
      else if (scrollTop < this.currentScrollTop && scrollTop > this.headerStart) {
        this.reveal();
      }
    }

    this.currentScrollTop = scrollTop;

    // Recall request animation loop
    this.request = requestAnimationFrame(this.scrollAnimation.bind(this));
  }

  hide() {
    document.body.classList.add('header-hidden', 'header-sticky');
    this.closeHeaderNav();
    this.closeMobileNav();
    this.closeSearch();
  }

  reveal() {
    document.body.classList.add('header-sticky');
    document.body.classList.remove('header-hidden');
    if (this.headerInverse) document.body.classList.add('header-inverse-solid');
  }

  revealTop() {
    if (this.headerInverse && !document.body.classList.contains('desktop-submenu-is-open')) document.body.classList.remove('header-inverse-solid');
    document.body.classList.remove('header-hidden', 'header-sticky');
  }

  closeHeaderNav() {
    if (!this.headerNav || window.innerWidth < 768) return false;
    this.headerNav.closeAll();
  }

  closeMobileNav() {
    if (!this.mobileNavToggle) return false;
    this.mobileNavToggle.remove();
  }

  closeSearch() {
    if (!this.search || !this.searchToggle) return false;
    if (this.search.classList.contains('header__search--is-active')) this.searchToggle.remove();
  }

  toggleHeaderClass(open = true) {
    this.inverse = !!this.header.classList.contains('header--inverse');
    if (open) {
      // set header open
      document.body.classList.add('desktop-submenu-is-open');
      this.inverse && this.header.classList.add('header-inverse-solid');
    }
    else {
      document.body.classList.remove('desktop-submenu-is-open');
      this.inverse && document.body.classList.remove('header-inverse-solid');
    }
  }
}

if (!customElements.get('header-component')) {
  customElements.define('header-component', HeaderComponent);
}

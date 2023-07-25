class HeaderCollapsibleComponent extends Collapsible {
  constructor() {
    super();
    this.header = this.closest('[data-header]');
    this.headerWrapper = this.closest('.shopify-section-group-header-group');

    // add a class to this section so the header doesn't take up space
    this.headerWrapper.classList.add('group-[.header-hidden]/body:invisible');

    if (this.header) {
      this.inverse = !!this.header.classList.contains('header--inverse');
      this.backdrop = this.header.querySelector('.header-backdrop');

      // extra events
      this.backdrop?.addEventListener('click', this.closeAll.bind(this));

      // on key up
      document.addEventListener('keyup', (event) => {
        this.onKeyUp(event);
      } );
    }
  }

  events() {
    if (!this.header) {
      super.events();
    }
  }

  onKeyUp(event) {
    if (!document.body.classList.contains('header-is-open')) {
      return;
    }
    if (event?.code.toUpperCase() !== 'ESCAPE') {
      return;
    }
    const { classToToggle } = this.options;
    let group = this.querySelector(`[data-collapsible-group].${classToToggle}`);
    if (group) {
      this.close(group);
    }
  }

  open(group) {
    super.open(group);
    if (this.headerWrapper) {
      document.body.classList.add('header-is-open');
    }
    this.toggleHeaderClass(true);
  }

  close(group) {
    super.close(group);
    if (this.headerWrapper) {
      document.body.classList.remove('header-is-open');
    }
    this.toggleHeaderClass(false);
  }

  closeSiblings(currentGroup = null) {
    super.closeSiblings(currentGroup);
    this.toggleHeaderClass(false);
  }

  openAll() {
    super.openAll();
    this.toggleHeaderClass(true);
    if (this.headerWrapper) {
      document.body.classList.add('header-is-open');
    }
  }

  closeAll() {
    super.closeAll();
    this.toggleHeaderClass(false);
    if (this.headerWrapper) {
      document.body.classList.remove('header-is-open');
    }
  }

  toggleHeaderClass(open = true) {
    if (!this.header) {
      return false;
    }

    if (open) {
      // set header open
      document.body.classList.add('header-is-open');
      this.inverse && this.header.classList.add('header-inverse-solid');
    }
    else {
      // set header closed if all menu items are closed
      let close = true;
      const { classToToggle } = this.options;
      this.groups.forEach((group) => {
        if (group.classList.contains(classToToggle)) {
          close = false;
        }
      } );
      if (close) {
        document.body.classList.remove('header-is-open');
        this.inverse && document.body.classList.remove('header-inverse-solid');
      }
    }
  }
}

class SearchToggle extends ClassToggleComponent {
  constructor() {
    super();
  }

  construct() {
    super.construct();

    // elements
    this.header = this.closest('[data-header]');

    // key up escape
    document.addEventListener('keyup', (event) => {
      this.onKeyUp(event);
    } );

    // Remove classes incase the header navigation drawer is open.
    this.addEventListener('click', () => {
      document.body.classList.remove('header-is-open');
      document.body.classList.remove(window.drawerToggleClasses.mobileMenu);
      // Focus on input element if provided
      if (this.options.focusTarget) {
        document.querySelector(this.options.focusTarget)?.focus();
      }
    } );
  }

  onKeyUp(event) {
    if (!document.body.classList.contains(window.drawerToggleClasses.headerSearch)) {
      return;
    }
    if (event?.code.toUpperCase() !== 'ESCAPE') {
      return;
    }
    const { classToToggle } = this.options;
    if (this.target?.classList.contains(classToToggle)) {
      this.remove();
    }
  }

  add() {
    super.add();
    if (this.header) {
      document.body.classList.add(window.drawerToggleClasses.headerSearch);
    }
    if (this.target) {
      trapFocus(this.target);
    }
  }

  remove() {
    super.remove();
    if (this.header) {
      document.body.classList.remove(window.drawerToggleClasses.headerSearch);
    }
    removeTrapFocus();
  }
}

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
    this.productInfo = document.querySelector('[data-product-info]');

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
      this.raf = null; // Safe request animation frame
      (this.timer = null), // Safe scroll timer
      window.addEventListener('scroll', () => {
        clearTimeout(this.timer);
        if (!this.raf) {
          // A request animation frame is used to animate on max 60fps.
          this.raf = requestAnimationFrame(this.scrollAnimation.bind(this));
        }
        this.timer = setTimeout(() => {
          // Stop animation, cancel request animation frame
          cancelAnimationFrame(this.raf);
          this.raf = null;
        }, 50);
      },
      false,
      );
    }
  }

  scrollAnimation() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    // only animate if header is closed.
    if (!document.body.classList.contains('header-is-open')) {
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
    this.raf = requestAnimationFrame(this.scrollAnimation.bind(this));
  }

  hide() {
    document.body.classList.add('header-hidden', 'header-sticky');
    this.closeHeaderNav();
    this.closeMobileNav();
    this.closeSearch();
    this.productInfoPosition('up');
  }

  reveal() {
    document.body.classList.add('header-sticky');
    document.body.classList.remove('header-hidden');
    if (this.headerInverse) {
      document.body.classList.add('header-inverse-solid');
    }
    this.productInfoPosition('down');
  }

  revealTop() {
    if (this.headerInverse && !document.body.classList.contains('header-is-open')) {
      document.body.classList.remove('header-inverse-solid');
    }
    document.body.classList.remove('header-hidden', 'header-sticky');
    this.productInfoPosition('up');
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
    if (this.search.classList.contains('header__search--is-active')) {
      this.searchToggle.remove();
    }
  }

  productInfoPosition(pos = 'up') {
    if (!this.productInfo) {
      return;
    }
    if (pos == 'down') {
      this.productInfo.classList.replace('top-0', 'top-[4.5rem]');
    }
    else {
      this.productInfo.classList.replace('top-[4.5rem]', 'top-0');
    }
  }
}

if (!customElements.get('header-collapsible-component')) {
  customElements.define('header-collapsible-component', HeaderCollapsibleComponent);
}

if (!customElements.get('search-toggle')) {
  customElements.define('search-toggle', SearchToggle);
}

if (!customElements.get('header-component')) {
  customElements.define('header-component', HeaderComponent);
}

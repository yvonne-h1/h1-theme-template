/*
  Toggle class on another element.

  HTML Usage:
  <class-toggle-component data-options='{}'>
    <button>Click me</button>
  </class-toggle-component>
*/

if (!customElements.get('class-toggle-component')) {
  class ClassToggleComponent extends HTMLElement {
    constructor() {
      super();

      // Options
      this.options = {
        classToToggle: 'toggle--is-active',
        toggleTriggerClass: '',
        target: 'body',
        onHover: false,
        hoverDelay: 0,
        preventDefault: true,
        stopPropagation: true,
        ariaExpanded: false,
      };

      // Get options from element data and combine with this.options
      if (this?.dataset?.options) {
        const dataOptions = JSON.parse(this.dataset.options);
        this.options = {
          ...this.options,
          ...dataOptions,
        };
      }
      // For the menu drawer, filters, cart drawer and search, define the content they expand
      if (this.options.classToToggle === window.drawerToggleClasses.mobileMenu) this.targetID = 'menuDrawer';
      if (this.options.classToToggle === window.drawerToggleClasses.cartDrawer) this.targetID = 'cartDrawer';
      if (this.options.classToToggle === window.drawerToggleClasses.filters) this.targetID = 'CollectionFiltersForm';
      if (this.options.classToToggle === window.drawerToggleClasses.headerSearch) this.targetID = 'SearchModal';

      // All toggle components should have a button for accessibility purposes
      this.button = this.querySelector('button') || null;

      // Reduce actions (So the event can also be removed)
      this.reducer = {
        click: (e) => this.debounceClickEvent(e),
        mouseEnter: (e) => this.debouncedOnMouse(e, 'add'),
        mouseLeave: (e) => this.debouncedOnMouse(e, 'remove'),
      };

      // Construct web component
      this.construct();
    }

    /*
      Construct web component
    */
    construct() {
      this.target = document.querySelector(this.options.target);

      if (!this.target) return false;

      // Click
      this.removeEventListener('click', this.reducer.click);
      this.addEventListener('click', this.reducer.click);

      // Mouse enter and leave
      if (this.options.onHover) {
        this.removeEventListener('mouseenter', this.reducer.mouseEnter);
        this.addEventListener('mouseleave', this.reducer.mouseLeave);
      }
    }

    /*
      Debounce click event
      @param e {object}: mouse event
      Called by add event listener -> reducer.
    */
    debounceClickEvent(e) {
      if (!e) return false;
      this.preventDefault(e);
      this.stopPropagation(e);
      this.toggle();
    }

    /*
      Debounced mouse event
      @param e {object}: mouseevent
      @param type {string}: open/close/closeAll
      Called by add event listener -> reducer.
    */
    debouncedOnMouse(e, type) {
      if (!e) return false;
      const debouncer = debounce((type) => {
        switch (type) {
        case 'add':
          this.add();
          break;
        case 'remove':
          this.remove();
          break;
        default:
          this.toggle();
          break;
        }
      }, this.options.hoverDelay);
      debouncer(type);
    }

    // @param e {object}: click event
    preventDefault(e) {
      if (this.options.preventDefault) {
        e.preventDefault();
      }
    }

    // @param e {object}: click event
    stopPropagation(e) {
      if (this.options.stopPropagation) {
        e.stopPropagation();
      }
    }

    keyUpCloseEvent(event) {
      if (event?.code?.toUpperCase() !== 'ESCAPE') return;
      this.remove();
      removeTrapFocus();
    }

    add() {
      const { classToToggle, toggleTriggerClass } = this.options;
      if (this.target) {
        this.target.classList.add(classToToggle);
      }
      if (toggleTriggerClass) {
        this.classList.add(toggleTriggerClass);
      }
      // Switch aria-expanded
      if (this.options.ariaExpanded && this.button) {
        console.trace('here');
        this.button.setAttribute('aria-expanded', false);

        // get the modal this trigger controls and trap the focus on the expanded area
        const targetID = this.button.attributes['aria-controls'].value;
        const targetEl = document.getElementById(targetID);

        if (targetEl) {
          // set the tabindex of the elements
          const elements = getFocusableElements(targetEl);
          elements.forEach(el => el.setAttribute('tabindex', 0));
          trapFocus(targetEl, targetEl.firstElementChild);
        }

        document.addEventListener('keyup', this.keyUpCloseEvent.bind(this));
      }

      // listen for key up event
      if (classToToggle === window.drawerToggleClasses.mobileMenu || classToToggle === window.drawerToggleClasses.filters || classToToggle === window.drawerToggleClasses.headerSearch || classToToggle === window.drawerToggleClasses.cartDrawer) {
        document.addEventListener('keyup', this.keyUpCloseEvent.bind(this));
        document.querySelectorAll(`button[aria-controls="${this.targetID}"]`)?.forEach(button => button.setAttribute('aria-expanded', true));

        trapFocus(document.getElementById(this.targetID));
      }
    }

    remove() {
      const { classToToggle, toggleTriggerClass } = this.options;
      if (this.target) {
        this.target.classList.remove(classToToggle);
      }
      if (toggleTriggerClass) {
        this.classList.remove(toggleTriggerClass);
      }
      // Switch aria-expanded
      if (this.options.ariaExpanded && this.button) {
        this.button.setAttribute('aria-expanded', false);

        // get the modal this trigger controls and trap the focus on the expanded area
        const targetID = this.button.attributes['aria-controls'].value;
        const targetEl = document.getElementById(targetID);

        if (targetEl) {
          // set the tabindex of the elements
          const elements = getFocusableElements(targetEl);
          elements.forEach(el => el.setAttribute('tabindex', '-1'));
          removeTrapFocus(targetEl);
        }

        document.addEventListener('keyup', this.keyUpCloseEvent.bind(this));
      }

      if (classToToggle === window.drawerToggleClasses.mobileMenu || classToToggle === window.drawerToggleClasses.filters || classToToggle === window.drawerToggleClasses.headerSearch || classToToggle === window.drawerToggleClasses.cartDrawer) {

        removeTrapFocus(this.button);

        const predictiveSearch = document.querySelector('predictive-search');
        if (predictiveSearch && classToToggle === window.drawerToggleClasses.headerSearch) {
          predictiveSearch.close();
        }

        document.querySelectorAll(`button[aria-controls="${this.targetID}"]`)?.forEach(button => button.setAttribute('aria-expanded', false));
        document.removeEventListener('keyup', this.keyUpCloseEvent.bind(this));

        // return the focus to the trigger
        this.button?.focus();
      }
    }

    toggle() {
      const { classToToggle } = this.options;
      if (!this.target) return false;
      if (!this.target.classList.contains(classToToggle)) {
        this.add();
      }
      else {
        this.remove();
      }
    }
  }

  window.ClassToggleComponent = ClassToggleComponent;

  customElements.define('class-toggle-component', ClassToggleComponent);
}

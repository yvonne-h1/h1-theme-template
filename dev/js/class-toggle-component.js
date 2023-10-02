/*
  Toggle class on another element.

  Options:
    classToToggle: The class to toggle
    target: The element the class will be applied to. 'body' is default
    onHover: Open on hover instead on click
    hoverDelay: Delay after hovering
    ariaExpanded: For accessibility purposes set this when you are displaying a modal
    isDropdown: if this is an element with only a menu-list dropdown, set to true, so the focus is applied properly (see styleguide-forms.liquid for an example)

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
        target: 'body',
        onHover: false,
        hoverDelay: 0,
        ariaExpanded: false,
        isDropdown: false,
      };

      this.preventBackgroundScroll = false;

      // Get options from element data and combine with this.options
      if (this?.dataset?.options) {
        const dataOptions = JSON.parse(this.dataset.options);
        this.options = {
          ...this.options,
          ...dataOptions,
        };
      }

      // For the menu drawer, filters, cart drawer and search, define the content they expand
      if (this.options.classToToggle === window.drawerToggleClasses.cartDrawer) this.targetID = 'cartDrawer';
      if (this.options.classToToggle === window.drawerToggleClasses.filters) this.targetID = 'CollectionFiltersForm';

      // for the mobile menu, define the collapsible menu so we can close it, otherwise the wrong pane might be visible upon opening
      if (this.options.classToToggle === window.drawerToggleClasses.mobileMenu) {
        this.targetID = 'mobileMenu';

        this.mobileMenuCollapsible = document.getElementById(this.targetID).querySelector('collapsible-component');
      }

      // For the search modal, close other modals
      if (this.options.classToToggle === window.drawerToggleClasses.headerSearch) {
        this.targetID = 'SearchModal';

        // remove the classes for when other elements are open
        document.body.classList.remove('desktop-submenu-is-open');
        document.body.classList.remove(window.drawerToggleClasses.mobileMenu);
      }

      // prevent scroll for any of the modals
      if (this.targetID) this.preventBackgroundScroll = true;

      // All toggle components should have a button for accessibility purposes
      this.button = document.querySelector(`[aria-controls="${this.targetID}"`) || this.querySelector('button') || null;

      // Reduce actions (So the event can also be removed)
      this.reducer = {
        click: event => this.debounceClickEvent(event),
        mouseEnter: event => this.debouncedOnMouse(event, 'add'),
        mouseLeave: event => this.debouncedOnMouse(event, 'remove'),
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
      @param event {object}: mouse event
      Called by add event listener -> reducer.
    */
    debounceClickEvent(event) {
      if (!event) return false;

      event.preventDefault(event);
      event.stopPropagation(event);
      this.toggle();
    }

    /*
      Debounced mouse event
      @param event {object}: mouse event
      @param type {string}: open/close/closeAll
      Called by add event listener -> reducer.
    */
    debouncedOnMouse(event, type) {
      if (!event) return false;
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

    keyUpCloseEvent(event) {
      if (event?.code?.toUpperCase() !== 'ESCAPE') return;

      // don't close when a fancybox is open
      if (!document.documentElement.classList.contains('with-fancybox')) {
        this.remove();
      }

      removeTrapFocus(this.button);
    }

    add() {
      // add the event listener to close the modal again
      document.addEventListener('keyup', this.keyUpCloseEvent.bind(this));

      const { classToToggle } = this.options;

      // toggle the class
      if (this.target) this.target.classList.add(classToToggle);

      // focus the element and listen for key up event so we can close on ESCAPE
      if (this.targetID) {

        // dispatch a custom event so we can target specific logic based on the ID
        document.dispatchEvent(new CustomEvent('toggle-opened', {
          bubbles: true,
          detail: {
            id: this.targetID,
          },
        }));

        document.querySelectorAll(`button[aria-controls="${this.targetID}"]`)?.forEach(button => button.setAttribute('aria-expanded', true));

        const focusTarget = document.getElementById(this.targetID);
        const elementToFocus = (this.targetID === 'SearchModal') ? focusTarget.querySelector('input') : focusTarget;

        trapFocus(focusTarget, elementToFocus);
      }

      // Switch aria-expanded
      if (this.options.ariaExpanded && this.button) this.button.setAttribute('aria-expanded', true);

      // Add class to the document
      if (this.preventBackgroundScroll) addPreventScroll();

      // Switch aria-expanded
      if (this.isDropdown) {

        // get the modal this trigger controls and trap the focus on the expanded area
        const targetID = this.button.attributes['aria-controls'].value;
        const targetEl = document.getElementById(targetID);

        if (targetEl) {
          // set the tabindex of the elements
          const elements = getFocusableElements(targetEl);
          elements.forEach(el => el.setAttribute('tabindex', 0));
          trapFocus(targetEl, targetEl.firstElementChild);
        }
      }
    }

    remove() {
      const { classToToggle } = this.options;
      if (this.target) this.target.classList.remove(classToToggle);

      // Switch aria-expanded
      if (this.options.ariaExpanded && this.button) this.button.setAttribute('aria-expanded', false);

      // remove the trap focus
      if (this.targetID) {
        removeTrapFocus(this.button);

        // dispatch a custom event so we can target specific logic based on the ID
        document.dispatchEvent(new CustomEvent('toggle-closed', {
          bubbles: true,
          detail: {
            id: this.targetID,
          },
        }));

        this.mobileMenuCollapsible?.closeAll();

        // Close the predictive search
        const predictiveSearch = document.querySelector('predictive-search');
        if (predictiveSearch && classToToggle === window.drawerToggleClasses.headerSearch) predictiveSearch.close();

        document.querySelectorAll(`button[aria-controls="${this.targetID}"]`)?.forEach(button => button.setAttribute('aria-expanded', false));

        // return the focus to the trigger
        this.button?.focus();
      }

      // Remove class from the document
      if (this.preventBackgroundScroll) removePreventScroll();

      if (this.isDropdown) {
        // get the modal this trigger controls and trap the focus on the expanded area
        const targetID = this.button.attributes['aria-controls'].value;
        const targetEl = document.getElementById(targetID);

        if (targetEl) {
          // set the tabindex of the elements
          const elements = getFocusableElements(targetEl);
          elements.forEach(el => el.setAttribute('tabindex', '-1'));
          removeTrapFocus(targetEl);
        }

        document.removeEventListener('keyup', this.keyUpCloseEvent.bind(this));
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
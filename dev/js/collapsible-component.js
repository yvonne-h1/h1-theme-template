/*
  <collapsible-component
    data-options='
      {
        "closeSiblings": true
      }
    '
  >
    <div class="group" data-collapsible-group>
      <div class="collapsible__group group" data-collapsible-group {{ block.shopify_attributes }}>
        <button
          type="button"
          class="collapsible__trigger {{ section.settings.button_color_scheme }} flex w-full items-center justify-between {% if section.settings.button_color_scheme == '' -%}py-4 pr-4 no-underline transition group-[.collapsible-is-open]:font-bold{%- endif -%}"
          data-collapsible-trigger>
          Trigger text
          <span class="collapsible__trigger-icons">
            {%- render 'icons', icon: 'plus', icon_class: 'w-3 block group-[.collapsible-is-open]:hidden' -%}
            {%- render 'icons', icon: 'minus', icon_class: 'w-3 hidden group-[.collapsible-is-open]:block' -%}
          </span>
        </button>
        <div
          class="collapsible__target rte group-[.collapsible-is-open]:py-2"
          data-collapsible-target>
          <div class="p-0 pb-4">
            Content
          </div>
        </div>
      </div>
    </div>
  </collapsible-component>
*/

if (!customElements.get('collapsible-component')) {
  class Collapsible extends HTMLElement {
    constructor() {
      super();

      // Options
      this.options = {
        classToToggle: 'collapsible-is-open',
        closeSiblings: false,
        closeChildren: true,
        onHover: false,
        hoverDelay: 0,
        closeOnMouseleave: false,
        isMobileMenu: false,
        breakpointMax: false,
        trapFocus: true,
      };

      // Get options from element data and combine with this.options
      if (this?.dataset?.options) {
        const dataOptions = JSON.parse(this.dataset.options);
        this.options = {
          ...this.options,
          ...dataOptions,
        };
      }

      // Used for the main menu to retain the nested levels for the mobile menu
      this.state = [this.querySelector('nav')];

      this.timeout = null;

      window.addEventListener('resize', debounce(() => {
        this.init();
      }, 50));

      this.init();
    }

    init() {
      // Check if the window width allows for the collapsibles to be rendered
      let init;
      if (this.options.breakpointMax === false) {
        init = true;
      }
      else {
        if (this.options.breakpointMax < windowWidth()) {
          init = false;
        }
        else {
          init = true;
        }
      }
      this.construct(init);

    }

    construct(init = true) {

      // Init elements
      this.groups = this.hasAttribute('data-collapsible-group')
        ? [this.closest('[data-collapsible-group]')]
        : this.querySelectorAll('[data-collapsible-group]');
      this.triggers = this.querySelectorAll('[data-collapsible-trigger]');

      // Remove all event listeners
      this.triggers.forEach((trigger) => {
        trigger.removeEventListener('click', this.debounceClickEvent);

        if (this.options.onHover) trigger.removeEventListener('mouseenter', this.debouncedOnMouse);
      });
      this.groups.forEach((group) => {
        if (this.options.onHover) group.removeEventListener('mouseleave', this.debouncedOnMouse);
      });

      if (this.options.closeOnMouseleave) this.removeEventListener('mouseleave', this.debouncedOnMouse);

      // the collapsible breakpoint has been reached, so the collapsibles should be opened
      if (!init) {
        this.groups.forEach(group => this.open(group));

        // hide all trigger icons
        this.triggers.forEach((trigger) => {
          if (this.options.breakpointMax !== false) trigger.querySelector('.icon').classList.add('hidden');
        });

        return;
      }
      // close the collapsibles because the breakpoint demands them to be collapsed
      else if (init && this.options.breakpointMax !== false) {
        this.groups.forEach((group) => {
          if (group.classList.contains(this.options.classToToggle)) {
            this.close(group, false);
          }
        });
      }

      // Trigger events on [data-collapsible-trigger]
      this.triggers.forEach((trigger) => {

        // show all icons
        if (this.options.breakpointMax !== false) trigger.querySelector('.icon').classList.remove('hidden');

        // add event listeners
        trigger.addEventListener('click', this.debounceClickEvent.bind(this));
        if (this.options.onHover) {
          trigger.addEventListener('mouseenter', this.debouncedOnMouse.bind(this, 'open'));
        }
      });

      // Trigger events on [data-collapsible-group]
      this.groups.forEach((group) => {
        if (this.options.onHover) {
          group.addEventListener('mouseleave', this.debouncedOnMouse.bind(this, 'close'));
        }
      });

      // Trigger mouseleave on container <collapsible-component>
      if (this.options.closeOnMouseleave) {
        this.addEventListener('mouseleave', this.debouncedOnMouse.bind(this, 'closeAll'));
      }
    }

    /*
      Debounce click event
      @param event {object}: mouse event
      Called by add event listener -> reducer.
    */
    debounceClickEvent(event) {
      if (!event) return false;

      const buttonType = event.target.nodeName.toLowerCase();
      const group = event.target.closest('[data-collapsible-group]');

      // only toggle if is closed or target is not an <a> tag
      if (!group.classList.contains(this.options.classToToggle) || buttonType != 'a') {
        event.preventDefault();
        event.stopImmediatePropagation();

        this.toggle(group);
      }
    }

    /*
      Debounced mouse event
      @param event {object}: mouse event
      @param type {string}: open/close/closeAll
      Called by add event listener -> reducer.
    */
    debouncedOnMouse(type, event) {
      if (!event) return false;

      // clear old trigger
      clearTimeout(this.timeout);

      const group = event?.target?.closest('[data-collapsible-group]');

      // add new trigger
      this.timeout = setTimeout(() => {
        switch (type) {
        case 'open':
          this.open(group);
          break;
        case 'close':
          this.close(group);
          break;
        case 'closeAll':
          this.closeAll();
          break;
        default:
          break;
        }
      }, this.options.hoverDelay);
    }

    /*
      Open collapsible group
      @param group {node}: group selector
    */
    open(group) {
      if (!group) return false;

      // Close siblings if option is on
      if (this.options.closeSiblings) {
        if (!this.options.breakpointMax || (this.options.breakpointMax !== false && windowWidth() < this.options.breakpointMax)) {
          this.closeSiblings(group);
        }
      }

      // Open active group
      group.classList.add(this.options.classToToggle);

      // Only use focus when item is not hovered
      if (!this.options.onHover) {
        if (this.options.isMobileMenu) {
          trapFocus(group, group.querySelectorAll('.mobile-menu__submenu')[0].querySelectorAll('.mobile-menu__link')[0]);

          // to prevent different heights for each panel, we have to disable to overflow for hidden panels
          const parentSubmenu = group.closest('.mobile-menu__submenu') || group.closest('.mobile-menu__content') ;
          if (parentSubmenu) {
            parentSubmenu.scrollTop = 0;
            parentSubmenu.classList.remove('overflow-y-auto');
            parentSubmenu.classList.add('overflow-hidden');
          }
        }
        else if(this.options.trapFocus) {
          trapFocus(group);
        }
      }

      // Keep track of the state so we know where to add the focus when moving between the mobile menu items
      if (this.options.isMobileMenu) this.state.push(group);
    }

    /*
      close collapsible group,
      @param group {node}: group selector
    */
    close(group, focus = true) {
      if (!group) return false;

      if (focus) {
        removeTrapFocus(group);

        // Set the focus to the trigger when closing a collapsible
        if (!this.options.onHover) group.querySelector('[data-collapsible-trigger]').focus();
      }

      // Close active group
      group.classList.remove(this.options.classToToggle);
    }

    /*
      Toggle controller, open / close collapsibles
      @param group {node}: group selector
    */
    toggle(group) {
      if (!group) return false;

      // Check if already open
      if (!group.classList.contains(this.options.classToToggle)) {
        this.open(group);
      }
      else {
        // Close child collapsibles
        if (this.options.closeChildren) group.querySelectorAll('[data-collapsible-group]').forEach(group => this.close(group));

        // Close this group
        this.close(group);

        // Focus the previous menu
        if (this.options.isMobileMenu) {
          // to prevent different heights for each panel, we have to disable to overflow for hidden panels. We have to re-enable them when we close a panel
          const parentSubmenu = group.closest('.mobile-menu__submenu') || group.closest('.mobile-menu__content');
          if (parentSubmenu) {
            parentSubmenu.scrollTop = 0;
            parentSubmenu.classList.add('overflow-y-auto');
            parentSubmenu.classList.remove('overflow-hidden');
          }

          // remove the last item of the states
          this.state.splice(-1);
          const lastItem = this.state[this.state.length - 1];

          // focus the last item in the array
          trapFocus(lastItem);
        }
      }
    }

    /*
      Close all sibling collapsibles
      @param currentGroup {node}: current group selector
    */
    closeSiblings(currentGroup = null) {
      this.groups.forEach((group) => {
        if (group !== currentGroup && !group.contains(currentGroup) && !currentGroup.contains(group)) this.close(group, false);
      });
    }

    /*
      Open+ all collapsibles
    */
    openAll() {
      this.groups.forEach(group => group.classList.add(this.options.classToToggle));
    }

    /*
      Close all collapsibles
    */
    closeAll() {
      this.groups.forEach(group => group.classList.remove(this.options.classToToggle));
      this.state = [this.querySelector('nav')];
    }
  }

  window.Collapsible = Collapsible;

  customElements.define('collapsible-component', Collapsible);
}

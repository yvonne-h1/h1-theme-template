/*
HTML Usage with single group
<collapsible-component data-options='{}'>
  <div class="group" data-collapsible-group>
    <button
      type="button"
      data-collapsible-trigger
    >
      The trigger
      {%- render 'icons',
        icon: 'chevron-down',
        icon_class: 'w-3 absolute right-0 top-1/2 -translate-y-1/2 rotate-0 group-[.collapsible-is-open]:rotate-180'
      -%}
    </button>
    <div
      class="
        group-[.collapsible-is-open]:your-tailwind-class-state-example
      "
      data-collapsible-target
    >
      Your content goes here.
    </div>
  </div>
</collapsible-component>

HTML Usage with multiple & nested groups
<collapsible-component
  data-options='
    {
      "closeSiblings": true
    }
  '
>
  <div class="group" data-collapsible-group>
    <button
      type="button"
      data-collapsible-trigger
    >
      The trigger
      {%- render 'icons',
        icon: 'chevron-down',
        icon_class: 'w-3 absolute right-0 top-1/2 -translate-y-1/2 rotate-0 group-[.collapsible-is-open]:rotate-180'
      -%}
    </button>
    <div
      class=""
      data-collapsible-target
    >
      Your content goes here.
    </div>
  </div>
  <div class="group" data-collapsible-group>
    <button
      type="button"
      data-collapsible-trigger
    >
      The trigger
      {%- render 'icons',
        icon: 'chevron-down',
        icon_class: 'w-3 absolute right-0 top-1/2 -translate-y-1/2 rotate-0 group-[.collapsible-is-open]:rotate-180'
      -%}
    </button>
    <div
      class=""
      data-collapsible-target
    >
      Your content goes here.
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
        if (this.options.onHover) {
          trigger.removeEventListener('mouseenter', this.debouncedOnMouse);
        }
      });
      this.groups.forEach(group => {
        if (this.options.onHover) {
          group.removeEventListener('mouseleave', this.debouncedOnMouse);
        }
      });
      if (this.options.closeOnMouseleave) {
        this.removeEventListener('mouseleave', this.debouncedOnMouse);
      }

      // the collapsible breakpoint has been reached, so the collapsibles should be opened
      if (!init) {
        this.groups.forEach(group => {
          this.open(group);
        });

        // hide all trigger icons
        this.triggers.forEach(trigger => {
          trigger.querySelector('.icon').classList.add('hidden');
        });

        return;
      }
      // close the collapsibles because the breakpoint demands them to be collapsed
      else if (init && this.options.breakpointMax !== false) {
        this.groups.forEach(group => {
          if (group.classList.contains(this.options.classToToggle)) {
            this.close(group);
          }
        });
      }

      // Trigger events on [data-collapsible-trigger]
      this.triggers.forEach(trigger => {

        // show all icons
        trigger.querySelector('.icon').classList.remove('hidden');

        // add event listeners
        trigger.addEventListener('click', this.debounceClickEvent.bind(this));
        if (this.options.onHover) {
          trigger.addEventListener('mouseenter', this.debouncedOnMouse.bind(this, 'open'));
        }
      });

      // Trigger events on [data-collapsible-group]
      this.groups.forEach(group => {
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
      @param e {object}: mouse event
      Called by add event listener -> reducer.
    */
    debounceClickEvent(e) {
      if (!e) return false;

      const buttonType = e.target.nodeName.toLowerCase();
      const group = e.target.closest('[data-collapsible-group]');

      // only toggle if is closed or target is not an <a> tag
      if (!group.classList.contains(this.options.classToToggle) || buttonType != 'a') {
        e.preventDefault();
        e.stopImmediatePropagation();

        this.toggle(group);
      }
    }

    /*
      Debounced mouse event
      @param e {object}: mouse event
      @param type {string}: open/close/closeAll
      Called by add event listener -> reducer.
    */
    debouncedOnMouse(type, e) {
      if (!e) return false;

      // clear old trigger
      clearTimeout(this.timeout);

      const group = e?.target?.closest('[data-collapsible-group]');

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
        // trapFocus(group);
        if (this.options.isMobileMenu) {
          trapFocus(group, group.querySelectorAll('.mobile-menu__submenu')[0].querySelectorAll('.mobile-menu__link')[0]);
        }
        else {
          trapFocus(group);
        }
      }

      // Keep track of the state so we know where to add the focus when moving between the mobile menu items
      this.options.isMobileMenu && this.state.push(group);
    }

    /*
      close collapsible group,
      @param group {node}: group selector
    */
    close(group) {
      if (!group) return false;

      removeTrapFocus(group);

      // Set the focus to the trigger when closing a collapsible
      !this.options.onHover && group.querySelector('[data-collapsible-trigger]').focus();

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
        if (this.options.closeChildren) {
          group.querySelectorAll('[data-collapsible-group]').forEach(group => {
            this.close(group);
          });
        }

        // Close this group
        this.close(group);

        // Focus the previous menu
        if (this.options.isMobileMenu) {
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
      this.groups.forEach(group => {
        if (group !== currentGroup && !group.contains(currentGroup) && !currentGroup.contains(group)) {
          this.close(group);
        }
      });
    }

    /*
      Open+ all collapsibles
    */
    openAll() {
      this.groups.forEach(group => {
        group.classList.add(this.options.classToToggle);
      });

    }

    /*
      Close all collapsibles
    */
    closeAll() {
      this.groups.forEach(group => {
        group.classList.remove(this.options.classToToggle);
      });

      this.state = [this.querySelector('nav')];
    }
  }

  window.Collapsible = Collapsible;

  customElements.define('collapsible-component', Collapsible);
}

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
      };

      // Get options from element data and combine with this.options
      if (this?.dataset?.options) {
        const dataOptions = JSON.parse(this.dataset.options);
        this.options = {
          ...this.options,
          ...dataOptions,
        };
      }

      this.state = [this.querySelector('nav')];

      // Reduce actions (So the event can also be removed)
      this.reducer = {
        clickTarget: (e) => this.debounceClickEvent(e),
        mouseEnterTarget: (e) => this.debouncedOnMouse(e, 'open'),
        mouseLeaveGroup: (e) => this.debouncedOnMouse(e, 'close'),
        mouseLeaveContainer: (e) => this.debouncedOnMouse(e, 'closeAll'),
      };

      this.timeout = null;

      // Construct webcomponent
      this.construct();
    }

    /*
      Construct webcomponent
    */
    construct() {
      // Init elements
      this.groups = this.hasAttribute('data-collapsible-group')
        ? [this.closest('[data-collapsible-group]')]
        : this.querySelectorAll('[data-collapsible-group]');
      this.triggers = this.querySelectorAll('[data-collapsible-trigger]');

      // Init events
      // Trigger events on [data-collapsible-trigger]
      this.triggers.forEach((trigger) => {
        trigger.removeEventListener('click', this.reducer.clickTarget);
        trigger.addEventListener('click', this.reducer.clickTarget);

        // Mouse enter
        if (this.options.onHover) {
          trigger.removeEventListener('mouseenter', this.reducer.mouseEnterTarget);
          trigger.addEventListener('mouseenter', this.reducer.mouseEnterTarget);
        }
      });

      // Trigger events on [data-collapsible-group]
      this.groups.forEach((group) => {
        // Mouse leave
        if (this.options.onHover) {
          group.removeEventListener('mouseleave', this.reducer.mouseLeaveGroup);
          group.addEventListener('mouseleave', this.reducer.mouseLeaveGroup);
        }
      });

      // Trigger mouseleave on container <collapsible-component>
      if (this.options.closeOnMouseleave) {
        this.removeEventListener('mouseleave', this.reducer.mouseLeaveContainer);
        this.addEventListener('mouseleave', this.reducer.mouseLeaveContainer);
      }
    }

    /*
      Debounce click event
      @param e {object}: mouseevent
      Called by add event listener -> reducer.
    */
    debounceClickEvent(e) {
      if (!e) return false;
      const buttonType = e.currentTarget.nodeName.toLowerCase();
      const group = e.currentTarget.closest('[data-collapsible-group]');
      // only toggle if is closed or target is not an <a> tag
      if (!group.classList.contains(this.options.classToToggle) || buttonType != 'a') {
        e.preventDefault();
        this.toggle(group);
      }
    }

    /*
      Debounced mouse event
      @param e {object}: mouseevent
      @param type {string}: open/close/closeAll
      Called by add event listener -> reducer.
    */
    debouncedOnMouse(e, type) {
      if (!e) return false;

      // clear old trigger
      clearTimeout(this.timeout);

      // add new trigger
      this.timeout = setTimeout(() => {
        const group = e?.target?.closest('[data-collapsible-group]');
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

      // Close Siblings if option is on
      this.options.closeSiblings && this.closeSiblings(group);

      // Open active group
      group.classList.add(this.options.classToToggle);

      // Only use focus when item is not hovered
      !this.options.onHover && trapFocus(group);

      // Keep track of the state so we know where to add the focus when moving between the mobile menu items
      this.options.isMobileMenu && this.state.push(group);

    }

    /*
      close collapsible group,
      @param group {node}: group selector
    */
    close(group) {
      console.trace('close', group);

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
        // Open
        this.open(group);
      }
      else {
        // Close child collapsibles
        if (this.options.closeChildren) {
          group.querySelectorAll('[data-collapsible-group]').forEach((group) => {
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
      this.groups.forEach((group) => {
        if (
          group !== currentGroup &&
          !group.contains(currentGroup) &&
          !currentGroup.contains(group)
        ) {
          this.close(group);
        }
      });
    }

    /*
      Open+ all collapsibles
    */
    openAll() {
      this.groups.forEach((group) => {
        group.classList.add(this.options.classToToggle);
      });

    }

    /*
      Close all collapsibles
    */
    closeAll() {
      this.groups.forEach((group) => {
        group.classList.remove(this.options.classToToggle);
      });

      this.state = [this.querySelector('nav')];
    }
  }

  window.Collapsible = Collapsible;

  customElements.define('collapsible-component', Collapsible);
}

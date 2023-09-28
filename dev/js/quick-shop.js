import { Fancybox } from '@fancyapps/ui';
class QuickAdd extends HTMLElement {
  constructor() {
    super();

    this.parentCard = this.closest('[data-product-card]');

    this.querySelector('[data-quick-shop-toggle]')?.addEventListener('click', (event) => {
      event.currentTarget.classList.add('loading');
      event.currentTarget.setAttribute('disabled', true);
      this.trigger = event.currentTarget;

      setTimeout(() => {
        this.trigger.classList.remove('loading');
        this.trigger.removeAttribute('disabled');
      }, 250);

      this.fancybox();
    });
  }

  /**
   * onOptionSelect
   * @description Adds the clicked option/variant to the cart leveraging the product form component. Adds a variant to the cart.
   * @param {String} variantId
   * @param {String} inventoryQuantity
   */
  onOptionSelect(fancybox, option = null) {
    const productForm = fancybox.$container.querySelector('product-form-component');
    const hiddenId = productForm.querySelector('input[name="id"]');
    const hiddenInventoryQty = productForm.querySelector('input[name="inventory_quantity"]');
    const errorMessage = productForm.querySelector('[data-form-error]');

    const activeOption = Array.from(fancybox.$container.querySelector('.quick-shop').querySelectorAll('[data-quick-shop-option]')).filter(input => input.checked === true)[0] || option;

    if (!activeOption) {
      errorMessage.classList.add('block');
      return;
    }

    hiddenId.value = activeOption.value;
    if (hiddenInventoryQty) hiddenInventoryQty.value = activeOption.dataset.inventoryQuantity;

    // submit the form
    productForm.onSubmitHandler(null, this.trigger);

    // close the fancybox
    setTimeout(() => {
      fancybox.close();
    }, 250);
  }

  fancybox() {
    if (!Fancybox) return false;

    Fancybox.show([ {
      src: this.trigger.dataset.src,
      type: 'inline',
    } ],
    {
      trapFocus: false,
      placeFocusBack: false,
      autoFocus: false,
      dragToClose: false,
      animated: false,
      on: {
        done: (fancybox) => {
          trapFocus(fancybox.$container);

          // listen for click on item, this doesn't work for keyboards
          fancybox.$container.querySelectorAll('[data-quick-shop-option]').forEach((option) => {
            option.nextElementSibling.addEventListener('click', (event) => {
              event.preventDefault();
              this.onOptionSelect(fancybox, event.target.previousElementSibling);
            });
          });

          // listen for click on the button, for keyboards
          const submitButton = fancybox.$container.querySelector('[type="submit"]');
          submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.onOptionSelect(fancybox);
          });
        },
        destroy: () => {
          removeTrapFocus(this.trigger);
        },
      },
    },
    );
  }
}

if (!customElements.get('quick-shop')) {
  customElements.define('quick-shop', QuickAdd);
}

class VariantSelects extends HTMLElement {
  constructor() {
    super();

    this.options = {
      isPreorder: false,
    };
    // Get options from element data and combine with this.options
    if (this?.dataset?.options) {
      const dataOptions = JSON.parse(this.dataset.options);
      this.options = {
        ...this.options,
        ...dataOptions,
      };
    }

    this.optionName;
    this.optionValue;

    this.variantSelects = Array.from(document.querySelectorAll('variant-selects')).filter(select => select !== this)[0];
    this.variantInputs = document.querySelector('variant-radios');

    this.querySelectorAll('select').forEach(select => select.addEventListener('change', this.onVariantChange.bind(this)));

    this.productFormId = `#product-form-${this.options.productId}`;
    this.priceId = `price-${this.options.productId}`;
    this.inventoryId = `inventory-${this.options.productId}`;

    // On load, check if a variant is active
    window.addEventListener('load', () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('variant')) {
        this.onVariantChange();
      }
    });
  }

  onVariantChange(event) {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    }
    else {
      this.highlightOptions();
      this.dispatchVariantChange();
      if (event) {
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();
      }
    }

    if (event) {
      this.optionName = event.target.dataset.optionName || event.target.closest('fieldset').dataset.optionName;
      this.optionValue = event.target.value;

      // change the other possible variant inputs to the same value
      document.querySelectorAll(`[data-option-name=${this.optionName}]`).forEach((variantOption) => {
        if (variantOption.nodeName === 'FIELDSET') {
          variantOption.querySelector(`input[value="${this.optionValue}"]`).checked = true;
        }
        if (variantOption.nodeName === 'SELECT') {
          variantOption.querySelector(`option[value="${this.optionValue}"]`).selected = true;
        }
      });
    }
  }

  updateOptions() {
    this.variantOptions = Array.from(this.querySelectorAll('select'), select => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          if (!this.variantOptions[index]) return true;
          return this.variantOptions[index] === option;
        })
        .includes(false);
    });
  }

  dispatchVariantChange() {
    document.dispatchEvent(new CustomEvent('variant-change', {
      bubbles: true,
      variant: this.currentVariant,
      detail: {
        variant: this.currentVariant,
      },
    }));
  }

  updateURL() {
    if (!this.currentVariant) return;

    window.history.replaceState({}, '', `${this.options.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(this.productFormId, '#product-form-installment');

    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', {
        bubbles: true,
      }));
    });
  }

  highlightOptions() {
    // Loop over option groups
    this.querySelectorAll('[data-option-group]').forEach((option) => {
      // Get index from option group (1, 2 or 3)
      const optionIndex = parseInt(option.dataset.optionGroup);

      // Create compare options from group, remove selected option based on index
      // eslint-disable-next-line
      const compareOptions = [...this.variantOptions].filter((option, index) => index != optionIndex);

      // Loop over possible values for option group
      option.querySelectorAll('[data-variant-option-id]').forEach((optionEl) => {
        const value = optionEl.value;

        // Match option availability and check if the two current options are available for value
        let match = this.getVariantData().filter((variant) => {
          // Get available variants where the current option index is the option value
          if (variant.options[optionIndex] == value && variant.available) {
            // Create variant options, remove option based on option value
            // eslint-disable-next-line
            const variantOptions = [...variant.options].filter((option, index) => index != optionIndex);

            // Check if compare options is the same as variant options
            return variantOptions.every((item, index) => item.toLowerCase() === compareOptions[index].toLowerCase());
          }
          return false;
        });

        // Debug current index, current value, compare options and match
        // console.log(optionEl, optionIndex, value, compareOptions, match);

        // Enable/disable variant options
        match.length === 0 ? optionEl.setAttribute('disabled', true) : optionEl.removeAttribute('disabled');

        // update the other variant input (when available)
        const variantId = optionEl.dataset.variantOptionId;
        const selectOption = this.variantSelects?.querySelector(`[data-variant-option-id="${variantId}"]`);
        if (selectOption) {
          match.length === 0 ? selectOption.setAttribute('disabled', true) : selectOption.removeAttribute('disabled');
        }

        const radioOption = this.variantInputs?.querySelector(`label[for="${variantId}-radio"]`);
        radioOption?.classList.toggle('option__label--disabled', match.length == 0);
      });
    });
  }

  renderProductInfo() {
    const url = `${this.options.url}?variant=${this.currentVariant.id}&section_id=${this.options.section}`;
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {

        const html = new DOMParser().parseFromString(responseText, 'text/html');

        // update the price
        const priceSource = html.getElementById(this.priceId);
        const priceDestination = document.getElementById(this.priceId);
        if (priceSource && priceDestination) priceDestination.innerHTML = priceSource.innerHTML;

        // update the inventory
        const inventorySource = html.getElementById(this.inventoryId);
        const inventoryDestination = document.getElementById(this.inventoryId);
        if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;

        document.getElementById(this.priceId)?.classList.remove('hidden');
        if (this.currentVariant) {
          this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
        }

        // Update the inventory quantity hidden input
        if (!this.options.isPreorder) {
          const inventoryQtyDestination = document.querySelector(this.productFormId).querySelector('input[name="inventory_quantity"]');
          const inventoryQtySource = html.querySelector(this.productFormId).querySelector('input[name="inventory_quantity"]');
          const qtyInputDestination = this.closest('product-info').querySelector('quantity-input input[name="quantity"]');

          if (inventoryQtyDestination) inventoryQtyDestination.value = inventoryQtySource.value;

          // update the max attribute of the quantity input only if there was already a max attribute (for products that track the inventory)
          if (qtyInputDestination && 'max' in qtyInputDestination.attributes) {
            qtyInputDestination.max = inventoryQtySource.value;
            // check if the current value of the input is higher than the max. If so, set it to the max.
            if (+qtyInputDestination.value > +inventoryQtySource.value) {
              qtyInputDestination.value = inventoryQtySource.value;
            }
          }
        }

      });
  }

  /**
   * toggleAddButton
   * @param {Boolean} disable
   * @param {String} text
   * @param {Boolean} modifyClass
   * @returns {void}
   */
  toggleAddButton(disable = true, text, modifyClass = true) {
    const addButton = document.getElementById(this.productFormId)?.querySelector('[name="add"]');
    const addButtonText = addButton?.querySelector('[data-add-to-cart-button-text]');

    if (!addButton || !addButtonText) return;

    if (disable) {
      addButton.setAttribute('disabled', true);
      if (text) addButtonText.textContent = text;
    }
    else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const addButton = document.getElementById(this.productFormId)?.querySelector('[name="add"]');
    if (!addButton) return;

    addButton.textContent = window.variantStrings.unavailable;
    document.getElementById(this.priceId)?.classList.add('hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

if (!customElements.get('variant-selects')) {
  customElements.define('variant-selects', VariantSelects);
}

class VariantRadios extends VariantSelects {
  constructor() {
    super();

    this.variantSelects = document.querySelector('variant-selects');

    this.querySelectorAll('input').forEach(input => input.addEventListener('input', this.onVariantChange.bind(this)));

    this.updateOptions();
    this.updateMasterId();
    this.highlightOptions();
  }

  onVariantChange(event) {
    super.onVariantChange(event);
    this.highlightOptions();
  }

  updateOptions() {
    const fieldsetArray = Array.from(this.querySelectorAll('fieldset'));
    this.variantOptions = fieldsetArray.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find(radio => radio.checked).value;
    });
  }

  /*
   * Check for each option value if the other one/two selected variant options are available
   */
  highlightOptions() {
    // Loop over option groups
    this.querySelectorAll('[data-option-group]').forEach((option) => {
      // Get index from option group (1, 2 or 3)
      const optionIndex = parseInt(option.dataset.optionGroup);

      // Create compare options from group, remove selected option based on index
      // eslint-disable-next-line
      const compareOptions = [...this.variantOptions].filter((option, index) => index != optionIndex);

      // Loop over possible values for option group
      option.querySelectorAll('[data-option]').forEach((optionEl) => {
        let label = optionEl.querySelector('[data-option-label]'),
          input = optionEl.querySelector('[data-variant-option-id]'),
          value = input.value;

        // Match option availability and check if the two current options are available for value
        let match = this.getVariantData().filter((variant) => {
          // Get available variants where the current option index is the option value
          if (variant.options[optionIndex] == value && variant.available) {
            // Create variant options, remove option based on option value
            // eslint-disable-next-line
            const variantOptions = [...variant.options].filter((option, index) => index != optionIndex);

            // Check if compare options is the same as variant options
            return variantOptions.every((item, index) => item.toLowerCase() === compareOptions[index].toLowerCase());
          }
          return false;
        });

        // Debug current index, current value, compare options and match
        // console.log(optionIndex, value, compareOptions, match);

        // Enable/disable variant options
        label.classList.toggle('option__label--disabled', match.length == 0);

        // update the other variant input (when available)
        const variantId = input.dataset.variantOptionId;
        const selectOption = this.variantSelects?.querySelector(`[data-variant-option-id="${variantId}"]`);
        if (selectOption) {
          match.length === 0 ? selectOption.setAttribute('disabled', true) : selectOption.removeAttribute('disabled');
        }
      });
    });
  }
}

if (!customElements.get('variant-radios')) {
  customElements.define('variant-radios', VariantRadios);
}

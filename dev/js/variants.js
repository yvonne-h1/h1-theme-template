class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.dispatchVariantChange();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          if (!this.options[index]) {
            return true;
          }
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  dispatchVariantChange() {
    document.dispatchEvent(
      new CustomEvent('variant-change', {
        bubbles: true,
        variant: this.currentVariant,
        detail: {
          variant: this.currentVariant,
        },
      })
    );
  }

  updateMedia() {
    if (!this.currentVariant || !this.currentVariant?.featured_media) return;
    const newMedia = document.querySelector(
      `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
    );
    if (!newMedia) return;
    const parent = newMedia.parentElement;
    parent.prepend(newMedia);
    window.setTimeout(() => {
      parent.scroll(0, 0);
    });
  }

  updateURL() {
    if (!this.currentVariant) return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  renderProductInfo() {
    fetch(
      `${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`
    )
      .then((response) => response.text())
      .then((responseText) => {
        const id = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        document.getElementById(`price-${this.dataset.section}`)?.classList.remove('hidden');
        if (this.currentVariant) {
          this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
        }

        // Update the inventory quantity hidden input
        const inventoryQtyDestination = document
          .querySelector(`#product-form-${this.dataset.section}`)
          .querySelector('input[name="inventory_quantity"]');
        const inventoryQtySource = html
          .querySelector(`#product-form-${this.dataset.section}`)
          .querySelector('input[name="inventory_quantity"]');
        inventoryQtyDestination.value = inventoryQtySource.value;
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
    const addButton = document
      .getElementById(`product-form-${this.dataset.section}`)
      ?.querySelector('[name="add"]');
    const addButtonText = addButton.querySelector('[data-add-to-cart-button-text]');

    if (!addButton || !addButtonText) return;

    if (disable) {
      addButton.setAttribute('disabled', true);
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const addButton = document
      .getElementById(`product-form-${this.dataset.section}`)
      ?.querySelector('[name="add"]');
    if (!addButton) return;
    addButton.textContent = window.variantStrings.unavailable;
    document.getElementById(`price-${this.dataset.section}`)?.classList.add('hidden');
  }

  getVariantData() {
    this.variantData =
      this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

if (!customElements.get('variant-selects')) {
  customElements.define('variant-selects', VariantSelects);
}

class VariantRadios extends VariantSelects {
  constructor() {
    super();
    this.updateOptions();
    this.updateMasterId();
    this.highlightOptions();
  }

  onVariantChange() {
    super.onVariantChange();
    this.highlightOptions();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }

  /*
   * Check for each option value if the other one/two selected variant options are available
   */
  highlightOptions() {
    // If no selected element make all available
    let selectedElement = event
      ? event.target
      : this.querySelector('[data-option-group] input[checked]');
    if (!selectedElement) {
      this.querySelectorAll('[data-option-group]').forEach((option) => {
        option.querySelectorAll('[data-option]').forEach((optionEl) => {
          let label = optionEl.querySelector('[data-option-label]');
          label.classList.remove('option__label--disabled');
        });
      });
      return;
    }

    // Loop over option groups
    this.querySelectorAll('[data-option-group]').forEach((option) => {
      // Get index from option group (1, 2 or 3)
      const optionIndex = parseInt(option.dataset.optionGroup);

      // Create compare options from group, remove selected option based on index
      const compareOptions = [...this.options].filter((option, index) => index != optionIndex);

      // Loop over possible values for option group
      option.querySelectorAll('[data-option]').forEach((optionEl) => {
        let label = optionEl.querySelector('[data-option-label]'),
          input = optionEl.querySelector('[data-option-input]'),
          value = input.value;

        // Match option availability and check if the two current options are available for value
        let match = this.getVariantData().filter((variant) => {
          // Get available variants where the current option index is the option value
          if (variant.options[optionIndex] == value && variant.available) {
            // Create variant options, remove option based on option value
            const variantOptions = [...variant.options].filter(
              (option, index) => index != optionIndex
            );

            // Check if compare options is the same as variant options
            return variantOptions.every(
              (item, index) => item.toLowerCase() === compareOptions[index].toLowerCase()
            );
          }

          return false;
        });

        // Debug current index, current value, compare options and match
        // console.log(optionIndex, value, compareOptions, match);

        // Enable disable variant options
        label.classList.toggle('option__label--disabled', match.length == 0);
      });
    });
  }
}

if (!customElements.get('variant-radios')) {
  customElements.define('variant-radios', VariantRadios);
}

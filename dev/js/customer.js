import { Fancybox } from '@fancyapps/ui';

class CustomerAddresses extends HTMLElement {
  constructor() {
    super();
    this.elements = this.getElements();
    if (Object.keys(this.elements).length === 0) return;

    this.setupCountries();
    this.setupEventListeners();
    this.fancybox();
  }

  getElements() {
    const container = document.querySelector('[data-customer-addresses]');
    return container ? {
      container,
      addressContainer: container.querySelector('[data-address]'),
      toggleButtons: document.querySelectorAll('button[aria-expanded]'),
      cancelButtons: container.querySelectorAll('button[type="reset"]'),
      deleteButtons: container.querySelectorAll('button[data-confirm-message]'),
      countrySelects: container.querySelectorAll('[data-address-country-select]'),
    } : {};
  }

  setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew',
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`,
        });
      });
    }
  }

  setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', event => this.handleAddEditButtonClick(event));
    });
    this.elements.cancelButtons.forEach((element) => {
      element.addEventListener('click', event => this.handleCancelButtonClick(event));
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', event => this.handleDeleteButtonClick(event));
    });
  }

  toggleExpanded(target) {
    target.setAttribute('aria-expanded',(target.getAttribute('aria-expanded') === 'false').toString());
    document.querySelector(target.dataset.src).classList.remove('hidden');
  }

  handleAddEditButtonClick({ currentTarget }) {
    this.toggleExpanded(currentTarget);
    this.trigger = currentTarget;
  }

  handleCancelButtonClick({ currentTarget }) {
    if (currentTarget.closest('[data-address]')) {
      this.toggleExpanded(currentTarget.closest('[data-address]')?.querySelector('[aria-expanded]'));
    }
  }

  handleDeleteButtonClick({ currentTarget }) {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute('data-confirm-message'))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: {
          _method: 'delete',
        },
      });
    }
  }

  fancybox() {
    if (!Fancybox) return false;

    Fancybox.bind('[data-fancybox]', {
      trapFocus: false,
      placeFocusBack: false,
      autoFocus: false,
      dragToClose: false,
      animated: false,
      on: {
        done: (fancybox) => {
          trapFocus(fancybox.$container);
          // add the event listener for the 'cancel' button
          fancybox.$container.querySelector('button[type="reset"]').addEventListener('click', () => fancybox.close());
        },
        destroy: () => {
          removeTrapFocus(this.trigger);
        },
      },
    });
  }
}

if (!customElements.get('customer-addresses')) {
  customElements.define('customer-addresses', CustomerAddresses);
}
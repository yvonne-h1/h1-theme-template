if (!customElements.get('collection-filters-form')) {
  class CollectionFiltersForm extends HTMLElement {
    constructor() {
      super();
      this.filterData = [];
      this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
      this.debouncedOnSubmit = debounce((event) => {
        this.onSubmitHandler(event);
      }, 500);
      this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
      window.addEventListener('popstate', this.onHistoryChange.bind(this));
      this.displayFilters();
    }

    /**
     * onSubmitHandler
     * @param {Object} event
     */
    onSubmitHandler(event) {
      event.preventDefault();
      const formData = new FormData(event.target.closest('form'));
      let formFilterData = new URLSearchParams(formData);

      // check the currentUrl params
      const currentUrl = new URL(window.location.href);
      const currentUrlParams = new URLSearchParams(currentUrl.search);

      // Loop and watch for specific keys to add to the form filter data
      for (const [key, value] of currentUrlParams.entries()) {
        if (key == 'view') {
          formFilterData.set(key, value);
          break;
        }
      }

      // Get the complete search string
      const searchParams = formFilterData.toString();
      this.renderPage(searchParams, event);
    }

    /**
     * onActiveFilterClick
     * @param {Object} event
     */
    onActiveFilterClick(event) {
      event.preventDefault();
      this.toggleActiveFilters();
      this.renderPage(new URL(event.currentTarget.href).searchParams.toString());
    }

    /**
     * onHistoryChange
     * @param {Object} event
     */
    onHistoryChange(event) {
      const searchParams = event.state?.searchParams || '';
      this.renderPage(searchParams, null, false);
    }

    /**
     * toggleActiveFilters
     * @param {Boolean} disable
     */
    toggleActiveFilters(disable = true) {
      document.querySelectorAll('[data-filter-remove]').forEach((element) => {
        element.classList.toggle('disabled', disable);
      });
      this.displayFilters();
    }

    /**
     * renderPage
     * @param {String} searchParams
     * @param {Object} event
     * @param {Boolean} updateURLHash
     */
    renderPage(searchParams, event, updateURLHash = true) {
      const sections = this.getSections();

      this.toggleLoadingState();

      sections.forEach((section) => {
        const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
        const filterDataUrl = (element) => element.url === url;

        this.filterData.some(filterDataUrl)
          ? this.renderSectionFromCache(filterDataUrl, event)
          : this.renderSectionFromFetch(url, event);
      });

      if (updateURLHash) this.updateURLHash(searchParams);
    }

    /**
     * renderSectionFromFetch
     * @param {String} url
     * @param {Object} event
     */
    renderSectionFromFetch(url, event) {
      fetch(url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = responseText;
          this.filterData = [...this.filterData, { html, url }];
          this.renderFilters(html, event);
          this.renderProductGrid(html);
          this.toggleLoadingState();
        });
    }

    /**
     * renderSectionFromCache
     * @param {String} filterDataUrl
     * @param {Object} event
     */
    renderSectionFromCache(filterDataUrl, event) {
      const html = this.filterData.find(filterDataUrl).html;
      this.renderFilters(html, event);
      this.renderProductGrid(html);
      this.toggleLoadingState();
    }

    /**
     * renderProductGrid
     * @param {Node} html
     */
    renderProductGrid(html) {
      document.querySelector('[data-collection-product-grid]').innerHTML = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector('[data-collection-product-grid]').innerHTML;
    }

    toggleLoadingState() {
      document.querySelector('[data-collection-product-grid]').classList.toggle('loading');
      document.querySelector('[data-collection-filters-form]').classList.toggle('loading');
    }

    /**
     * renderFilters
     * @param {Node} html
     * @param {Object} event
     */
    renderFilters(html, event) {
      const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
      const filterOptionElements = parsedHTML.querySelectorAll(
        '[data-collection-filters-form] [data-filter-option]'
      );
      const matchesIndex = (element) =>
        element.dataset.index === event?.target.closest('[data-filter-option]')?.dataset.index;
      const filterOptionsToRender = Array.from(filterOptionElements).filter(
        (element) => !matchesIndex(element)
      );

      filterOptionsToRender.forEach((element) => {
        document.querySelector(
          `[data-filter-option][data-index="${element.dataset.index}"]`
        ).innerHTML = element.innerHTML;
      });

      this.renderActiveFilters(parsedHTML);
    }

    /**
     * renderActiveFilters
     * @param {*} html
     * @returns
     */
    renderActiveFilters(html) {
      // Select filter active group
      const activeFilterOptions = html.querySelector('[data-filter-active-options]');
      // Hide it
      activeFilterOptions.parentNode.classList.add('hidden');
      // Check if it here
      if (!activeFilterOptions) return;
      // Replace old with new active filters
      document.querySelector('[data-filter-active-options]').innerHTML =
        activeFilterOptions.innerHTML;
      // Show it again
      activeFilterOptions.parentNode.classList.remove('hidden');
      //
      this.displayFilters();
      this.toggleActiveFilters(false);
    }

    /**
     * displayFilters
     */
    displayFilters() {
      this.updateTotalActiveFilterOptionsCount();

      // check all filters and hide the ones with no options
      const filterOptions = document.querySelectorAll('[data-filter-option-list]');
      filterOptions.forEach((filterOption) =>
        filterOption.children.length === 0
          ? filterOption.closest('[data-filter-option]').classList.add('hidden')
          : filterOption.closest('[data-filter-option]').classList.remove('hidden')
      );

      // Reinit collapsibles
      this.reInitCollapsibles();
    }

    /**
     * reInitCollapsibles
     */
    reInitCollapsibles() {
      const collapsibles = this.closest('collapsible-element');
      collapsibles.construct();
    }

    updateTotalActiveFilterOptionsCount() {
      const activeFiltersElement = document.querySelector('[data-filter-active-options]');
      const activeFilters = document.querySelector('[data-filter-active-options-list]').children;
      const filterTotalWrapper = document.querySelector('[data-filter-total-active-options]');
      const filterResetButton = this.querySelector('[data-filter-reset]');

      // if there are active filters, remove the class so it displays and update the total in the filter button
      if (activeFilters.length > 0) {
        activeFiltersElement.classList.remove('hidden');
        filterTotalWrapper.innerHTML = '&nbsp;- ' + activeFilters.length;
        // Update show / hide state clear all button
        filterResetButton.classList.remove('hidden');
      }
      // else add the class to hide and clear the button
      else {
        filterTotalWrapper.innerHTML = '';
        activeFiltersElement.classList.add('hidden');
        // Update show / hide state clear all button
        filterResetButton.classList.add('hidden');
      }
    }

    /**
     * updateURLHash
     * @param {String} searchParams
     */
    updateURLHash(searchParams) {
      history.pushState(
        { searchParams },
        '',
        `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`
      );
    }

    /**
     * getSections
     * @returns Array
     */
    getSections() {
      return [
        {
          id: 'main-collection',
          section: document.getElementById('main-collection').dataset.id,
        },
      ];
    }
  }
  customElements.define('collection-filters-form', CollectionFiltersForm);
}

if (!customElements.get('price-range')) {
  class PriceRange extends HTMLElement {
    constructor() {
      super();
      this.querySelectorAll('input').forEach((element) =>
        element.addEventListener('change', this.onRangeChange.bind(this))
      );

      this.setMinAndMaxValues();
    }

    onRangeChange(event) {
      this.adjustToValidValues(event.currentTarget);
      this.setMinAndMaxValues();
    }

    setMinAndMaxValues() {
      const inputs = this.querySelectorAll('input');
      const minInput = inputs[0];
      const maxInput = inputs[1];
      if (maxInput.value) minInput.setAttribute('max', maxInput.value);
      if (minInput.value) maxInput.setAttribute('min', minInput.value);
      if (minInput.value === '') maxInput.setAttribute('min', 0);
      if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
    }

    adjustToValidValues(input) {
      const value = Number(input.value);
      const min = Number(input.getAttribute('min'));
      const max = Number(input.getAttribute('max'));

      if (value < min) input.value = min;
      if (value > max) input.value = max;
    }
  }
  customElements.define('price-range', PriceRange);
}

if (!customElements.get('filter-remove')) {
  class OptionRemove extends HTMLElement {
    constructor() {
      super();

      this.querySelector('a').addEventListener('click', (event) => {
        event.preventDefault();
        const form =
          this.closest('collection-filters-form') ||
          document.querySelector('collection-filters-form');
        form.onActiveFilterClick(event);
      });
    }
  }
  customElements.define('filter-remove', OptionRemove);
}

if (!customElements.get('collection-switch')) {
  class CollectionSwitch extends HTMLElement {
    constructor() {
      super();
      this.CollectionFiltersForm = document.querySelector('collection-filters-form');
      this.buttons = this.querySelectorAll('[data-collection-view]');
      this.buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          this.handleButton(button);
        });
      });
    }
    handleButton(button) {
      // Get full current url
      const url = new URL(window.location);
      let params = new URLSearchParams(url.search);
      // Delete view first by default
      params.delete('view');
      const view = button.dataset.collectionView;
      // Update view param when not empty
      if (view != '') {
        params.set('view', view);
      }

      // Render the page again with method from collection filters form component
      this.CollectionFiltersForm.renderPage(params.toString());

      // Reset UI state classes on buttons
      this.buttons.forEach((button) => {
        button.classList.remove('collection-layout__button--active');
        button.classList.remove('opacity-100');
        button.classList.add('opacity-25');
      });
      // Set active state on button
      button.classList.add('collection-layout__button--active');
      button.classList.remove('opacity-25');
      button.classList.add('opacity-100');
    }
  }
  customElements.define('collection-switch', CollectionSwitch);
}

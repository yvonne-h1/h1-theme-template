class FiltersForm extends HTMLElement {

  constructor() {
    super();
    this.ww = window.innerWidth;
    this.filterData = [];
    this.productGridView = document.querySelector('product-grid-view');
    this.clearAllButton = this.querySelector('[data-clear-all]');
    this.vatToggle = document.querySelector('vat-toggle');

    // Get the template - Collection or Search
    this.currentTemplate = 'collection';
    this.productGrid = document.querySelector('[data-collection-product-grid]');
    if ((document.body.classList.contains('template-search'))) {
      this.currentTemplate = 'search';
      this.productGrid = document.getElementById('SearchProductGrid');
    }

    this.loader = document.querySelector('.filters-and-results-wrapper').querySelector('[data-loader]');
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);
    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));

    // remove the 'show filters' class from the body when we go from large to small screen
    this.debouncedOnResize = debounce(() => {
      const windowWidth = window.innerWidth;

      // check if there's an actual change in window width, because the resize is triggered on mobile when the viewport changes with the header
      if (windowWidth === this.ww) return;

      this.ww = windowWidth;
      if (this.ww < 768) document.body.classList.remove(window.drawerToggleClasses.filters);
    }, 100);
    window.addEventListener('resize', this.debouncedOnResize.bind(this));

    window.addEventListener('popstate', this.onHistoryChange.bind(this));

    this.displayFilters();
  }

  /**
   * onSubmitHandler
   * @param {Object} event
   */
  onSubmitHandler(event) {
    event.preventDefault();
    let type = 'filter';
    if (event.target.id === 'sort-options') {
      type = 'sort';
    }

    const formData = new FormData(event.target.closest('form'));
    let searchParams = new URLSearchParams(formData);

    // Handle submit in the Collection page
    if (this.currentTemplate == 'collection') {
      const sortOption = new URLSearchParams(document.location.search).get('sort_by');
      const sortOptionString = `sort_by=${sortOption}`;
      if (type === 'sort') {
        searchParams = searchParams.toString();
        let filterOptions = document.location.search;

        // If there's already a sort option available, remove it from the options
        if (sortOption) {
          filterOptions = filterOptions.split(sortOptionString)[1].replaceAll('?','');
        }

        // remove the first '&'
        if (filterOptions.charAt(0) === '&') {
          filterOptions = filterOptions.slice(1);
        }

        // if the filter options are not empty after we filtered out the sort option, then add it to the new sort option
        if (filterOptions !== '') {
          searchParams = `${searchParams}&${filterOptions}`;
        }
      }
      // type is 'filter'
      else {
        // Filter the form parameters for empty values
        for (const [key, value] of new URLSearchParams(formData).entries()) {
          if (value === '') {
            searchParams.delete(key);
          }
        }
        searchParams = searchParams.toString();

        // if there is a sort option, add it to the filters
        if (sortOption) {
          searchParams = (searchParams !== '') ? `${sortOptionString}&${searchParams}` : sortOptionString;
        }
      }
      this.renderPage(searchParams, event);
    }
    // Handle submit in the Search page
    else {
      const currentParams = new URLSearchParams(document.location.search);

      // type is 'sort'
      if (type === 'sort') {
        if (currentParams.has('sort_by')) {
          currentParams.delete('sort_by');
        }
        if (currentParams !== '') {
          searchParams = (searchParams !== '') ? `${searchParams}&${currentParams}` : currentParams;
        }
      }
      // type is 'filter'
      else if (type === 'filter') {
        // Filter the form parameters for empty values
        for (const [key, value] of new URLSearchParams(formData).entries()) {
          if (value === '') {
            searchParams.delete(key);
          }
        }

        // reset the sort by option
        if (currentParams.has('sort_by') && type !== 'sort') {
          searchParams.append('sort_by', currentParams.get('sort_by'));
        }
        // set back all the pre-existent parameters (searched query, searched type & options)
        const preExistentSearchParams = ['q','type','options[prefix]'];
        preExistentSearchParams.forEach((param) => {
          if (currentParams.has(param)) {
            searchParams.append(param, currentParams.get(param));
          }
        });
      }

      this.renderPage(searchParams.toString(), event);
    }

    // Scroll to page top
    window.scrollTo({ top: this.productGrid.offsetParent.offsetTop - 84,
      behavior: 'smooth' });
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

    let sectionName = 'theme-collection-filters-content';

    // show the loader and add opacity to element based on view
    this.loader.classList.remove('hidden');
    if (window.innerWidth <= 768) {
      this.style.opacity = .3;
    }
    else {
      this.productGrid.style.opacity = .3;
    }

    // do fetch
    const url = `${window.location.pathname}?section_id=${sectionName}&${searchParams}`;
    const filterDataUrl = element => element.url === url;

    this.filterData.some(filterDataUrl) ?
      this.renderSectionFromCache(filterDataUrl, event, searchParams) :
      this.renderSectionFromFetch(url, event, searchParams);

    if (updateURLHash) this.updateURLHash(searchParams);
  }

  /**
   * renderSectionFromFetch
   * @param {String} url
   * @param {Object} event
   * @param {String} searchParams
   */
  renderSectionFromFetch(url, event, searchParams) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        this.filterData = [...this.filterData, { html,
          url } ];
        this.renderFilters(html, event);
        this.renderProductGrid(html, event, searchParams);
      })
      .then(() => {
        this.loadMore = document.querySelector('load-more');
        this.loadMore?.initLoadMoreButtons();
      });
  }

  /**
   * renderSectionFromCache
   * @param {String} filterDataUrl
   * @param {Object} event
   * @param {String} searchParams
   */
  renderSectionFromCache(filterDataUrl, event, searchParams) {
    const html = this.filterData.find(filterDataUrl).html;
    this.renderFilters(html, event);
    this.renderProductGrid(html, event, searchParams);
  }

  /**
   * renderProductGrid
   * @param {Node} html
   * @param {Object} event
   */
  renderProductGrid(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    this.productGrid.innerHTML = parsedHTML.getElementById('products').innerHTML;

    // update result size, only on filter, not on sorting
    if (event?.target.id !== 'sort-options') {
      const results = parsedHTML.getElementById('products').dataset.resultsSize;
      if (this.querySelector('[data-filter-results-count]')) {
        this.querySelector('[data-filter-results-count]').textContent = results;
      }
    }

    // update the text
    const totalProducts = parsedHTML.querySelector('[data-collection-totals-text]').innerHTML;
    document.querySelectorAll('[data-totals-text]').forEach(elem => elem.innerHTML = totalProducts);

    // update the classes based on the chosen collection view (grid or list)
    this.productGridView.init();

  }

  /**
     * renderFilters
     * @param {Node} html
     * @param {Object} event
     */
  renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const filterOptionElements = parsedHTML.querySelectorAll(
      '[data-collection-filters-form] [data-filter-option]',
    );
    const matchesIndex = element => element.dataset.index === event?.target.closest('[data-filter-option]')?.dataset.index;
    const filterOptionsToRender = Array.from(filterOptionElements).filter(element => !matchesIndex(element));

    filterOptionsToRender.forEach((element) => {
      document.querySelector(
        `[data-filter-option][data-index="${element.dataset.index}"]`,
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
    document.querySelector('[data-filter-active-options]').innerHTML = activeFilterOptions.innerHTML;
    // Show it again
    activeFilterOptions.parentNode.classList.remove('hidden');
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
    filterOptions.forEach(filterOption =>
      filterOption.children.length === 0
        ? filterOption.closest('[data-filter-option]').classList.add('hidden')
        : filterOption.closest('[data-filter-option]').classList.remove('hidden'),
    );

    // Re-init collapsibles
    this.reInitCollapsibles();
  }

  /**
     * reInitCollapsibles
     */
  reInitCollapsibles() {
    const collapsibles = this.closest('collapsible-component');
    collapsibles?.init();
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
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }
}

if (!customElements.get('filters-form')) {
  customElements.define('filters-form', FiltersForm);
}

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

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

if (!customElements.get('price-range')) {
  customElements.define('price-range', PriceRange);
}

class OptionRemove extends HTMLElement {
  constructor() {
    super();
    this.clearAllButton = this.querySelector('[data-clear-all]');

    this.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();
      const form = this.closest('filters-form') || document.querySelector('filters-form');
      form.onActiveFilterClick(event);

      // if 'clear all' is selected, reset the sort by select and uncheck the availability filter
      if (event.target === this.clearAllButton) {
        document.getElementById('sort-options').value = 'manual';
        if (document.querySelector('[name="filter.v.availability"]')) {
          document.querySelector('[name="filter.v.availability"]').checked = false;
        }
        // hide the button
        this.clearAllButton.classList.add('hidden');
      }
    });
  }
}

if (!customElements.get('filter-remove')) {
  customElements.define('filter-remove', OptionRemove);
}
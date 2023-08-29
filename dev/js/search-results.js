class SearchResults extends HTMLElement {
  constructor() {
    super();

    this.filterData = [];
    this.grid = this.querySelector('[data-search-results-wrapper]');
    this.loader = this.querySelector('[data-loader]');

    this.searchTypes = document.querySelector('search-types');

    // if the page is loaded with queries, the search type is likely empty, so render them
    if (this.searchTypes.innerHTML === '') {
      this.renderSearchTypes(document.location.search, null, true);
    }

    this.initSort();
  }

  /**
   * Bind the event listener
   */
  initSort() {
    const sortSelect = document.querySelector('[data-search-sorting]');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (event) => {
      event.preventDefault();

      // render the new ordered content
      this.sortProductResults(event);
    });
  }

  /**
   * Bind the event listener
   */
  initSearchTypes(type = null, init = true) {
    console.trace('initSearchTypes', type, init);

    this.searchTypeLinks = this.searchTypes.querySelectorAll('[data-search-type-link]');
    const activeButtonClasses = ['button--primary', 'pointer-events-none'];
    const defaultButtonClass = 'button--outline';

    if (init) {
      this.searchTypeLinks.forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault();

          // remove the active class
          const activeLink = Array.from(this.searchTypeLinks).filter(link => link.classList.contains('button--primary'))[0];

          activeLink?.classList.remove(...activeButtonClasses);
          activeLink?.classList.add(defaultButtonClass);

          // add the active class
          event.target.classList.add(...activeButtonClasses);
          event.target.classList.remove(defaultButtonClass);

          // load the content
          this.loadResultsForType(event);
        });
      });
    }

    if (type) {
      // toggle the class to highlight the product link
      const activeLink = Array.from(this.searchTypeLinks).filter(link => link.classList.contains('button--primary'))[0];
      activeLink?.classList.remove(...activeButtonClasses);
      activeLink?.classList.add(defaultButtonClass);

      document.querySelector(`[data-search-type-link="${type}"]`).classList.add(...activeButtonClasses);
      document.querySelector(`[data-search-type-link="${type}"]`).classList.remove(defaultButtonClass);
    }
  }

  /**
   * sortProductResults
   * @param {Object} event
   */
  sortProductResults(event) {
    event.preventDefault();

    // show the loader
    this.loader.classList.remove('hidden');

    const newSorting = event.target.value;
    let searchString = document.location.search;
    let searchParams = new URLSearchParams(searchString);

    const sortOption = searchParams.get('sort_by');
    const type = searchParams.get('type');
    const page = searchParams.get('page');
    const sortOptionString = `sort_by=${newSorting}`;

    // If there's already pagination active, remove it from the string
    if (page) {
      searchParams.delete('page');
    }

    // If there's already a sort option available, remove it from the string
    if (sortOption) {
      searchParams.delete('sort_by');
    }

    // Stringify the queries and replace the question marks
    searchString = searchParams.toString();
    searchString = searchString.replaceAll('?','');

    // make sure to only render products when the sort is used
    if (!type) {
      searchString = `${searchString}&type=product`;
    }

    // remove the first '&'
    if (searchString.charAt(0) === '&') {
      searchString = searchString.slice(1);
    }

    // if the filter options are not empty after we filter out the sort option, then add it to the new sort option
    searchParams = `${(searchString) ? `${searchString}&${sortOptionString}` : `${sortOptionString}`}`;

    // Render the page with the new params
    this.renderPage(searchParams, true);
  }

  loadResultsForType(event) {
    const params = event.target.dataset.searchParams;
    this.renderPage(params, false);
  }

  /**
   * onHistoryChange
   * @param {Object} event
   */
  onHistoryChange(event) {
    const searchParams = event.state?.searchParams || '';
    this.renderPage(searchParams);
  }

  /**
   * renderSearchTypes
   * @param {String} searchParams
   */
  renderSearchTypes(searchParams, type, init = false) {
    console.log('renderSearchTypes', searchParams, init);

    if (init) {
      searchParams = new URLSearchParams(searchParams);
      type = searchParams.get('type');
      if (type) {
        searchParams.delete('type');
      }
    }

    // do fetch
    const url = `${window.location.pathname}?${searchParams}&section_id=search-types`;

    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
        this.searchTypes.innerHTML = parsedHTML.querySelector('.shopify-section').innerHTML;

        this.initSearchTypes(type, init);
      });
  }

  /**
   * renderPage
   * @param {String} searchParams
   * @param {Boolean} updateURLHash
   */
  renderPage(searchParams, updateURLHash = true, type = null) {
    console.log('renderPage', searchParams, updateURLHash, type);

    // do fetch
    const url = `${window.location.pathname}?${searchParams}&section_id=search-results`;

    const filterDataUrl = element => element.url === url;

    this.filterData.some(filterDataUrl) ?
      this.renderSectionFromCache(filterDataUrl, searchParams) :
      this.renderSectionFromFetch(url, searchParams);

    if (updateURLHash) this.updateURLHash(searchParams);

    if (type) {
      const searchParamsWithoutType = searchParams.replace(`&type=${type}`,'');

      // Render the search types without the type params
      this.renderSearchTypes(searchParamsWithoutType, type);
    }
  }

  /**
   * renderSectionFromFetch
   * @param {String} url
   * @param {String} searchParams
   */
  renderSectionFromFetch(url, searchParams) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        this.filterData = [...this.filterData, {
          html,
          url,
        } ];
        setTimeout(() => {
          this.renderResultsGrid(html, searchParams);
        }, 50);
      });
  }

  /**
   * renderSectionFromCache
   * @param {String} filterDataUrl
   * @param {Object} event
   * @param {String} searchParams
   */
  renderSectionFromCache(filterDataUrl, searchParams) {
    const html = this.filterData.find(filterDataUrl).html;

    this.renderResultsGrid(html, searchParams);
  }

  /**
   * renderResultsGrid
   * @param {Node} html
   * @param {Object} event
   * @param {String} searchParams
   */
  renderResultsGrid(html) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    this.grid.innerHTML = parsedHTML.querySelector('#results').innerHTML;
    document.querySelector('#result-count').innerHTML = parsedHTML.querySelector('#result-count').innerHTML;

    // re-add the sort event listener
    this.initSort();

    // hide the loader
    this.loader.classList.add('hidden');
  }

  /**
   * updateURLHash
   * @param {String} searchParams
   */
  updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }
}
if (!customElements.get('search-results')) {
  customElements.define('search-results', SearchResults);
}
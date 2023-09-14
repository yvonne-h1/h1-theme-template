class SearchResults extends HTMLElement {
  constructor() {
    super();

    this.filterData = [];
    this.grid = this.querySelector('#search-results');
    this.loader = this.querySelector('[data-loader]');

    this.searchTypes = document.getElementById('search-types');

    // if the page is loaded with queries, the search type is likely empty, so render them
    if (this.searchTypes) {
      if (this.searchTypes.innerHTML === '') {
        this.renderSearchTypes(document.location.search, null, true);
      }
      else {
        this.initSearchTypes();
      }
    }

    this.initSort();

    window.addEventListener('popstate', this.onHistoryChange.bind(this));
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
  initSearchTypes(type = null) {
    this.searchTypeLinks = this.searchTypes.querySelectorAll('[data-search-type-link]');

    this.searchTypeLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();

        this.toggleActiveTypeClass(event.target);

        // load the content
        this.loadResultsForType(event);
      });
    });

    // toggle the class to highlight the product link
    if (type) this.toggleActiveTypeClass(document.querySelector(`[data-search-type-link="${type}"]`));
  }

  toggleActiveTypeClass(element) {
    const activeButtonClasses = ['button--primary', 'pointer-events-none'];
    const defaultButtonClass = 'button--outline';

    this.activeLink = Array.from(this.searchTypeLinks).filter(link => link.classList.contains('button--primary'))[0];

    // remove the active class
    this.activeLink?.classList.remove(...activeButtonClasses);
    this.activeLink?.classList.add(defaultButtonClass);

    // toggle the class to highlight the product link
    element.classList.add(...activeButtonClasses);
    element.classList.remove(defaultButtonClass);
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

    // Delete the type so we can update all other type links as well
    if (type) {
      searchParams.delete('type');
    }

    // Stringify the queries and replace the question marks
    searchString = searchParams.toString();
    searchString = searchString.replaceAll('?','');

    // remove the first '&'
    if (searchString.charAt(0) === '&') {
      searchString = searchString.slice(1);
    }

    // Append the sort option string without the type so we can add the type dynamically for all the other links
    searchString = `${searchString}&${sortOptionString}`;

    // if the filter options are not empty after we filter out the sort option, then add it to the new sort option
    searchParams = `${searchString}&type=product`;

    // Render the page with the new params
    this.renderPage(searchParams, true, 'product');

    // update the other links so they use the correct sorting
    this.searchTypeLinks.forEach((link) => {
      const type = link.dataset.searchTypeLink;
      link.dataset.searchParams = `${searchString}&type=${type}`;
    });
  }

  /**
   * renderSearchTypes
   * Will execute on page load when there are search params available
   * @param {String} searchParams
   */
  renderSearchTypes(searchParams, type, init = false) {
    // when this this the initialization of the search types, make sure to remove the type
    if (init) {
      searchParams = new URLSearchParams(searchParams);
      type = searchParams.get('type');
      if (type) searchParams.delete('type');
    }

    // do fetch
    const url = `${window.location.pathname}?${searchParams}&section_id=theme-search-types`;

    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
        this.searchTypes.innerHTML = parsedHTML.querySelector('#search-types').innerHTML;

        this.initSearchTypes(type);
      });
  }

  /**
   * renderPage: check if the page was already rendered and either do a new fetch or load from cache
   * @param {String} searchParams
   * @param {Boolean} updateURLHash
   */
  renderPage(searchParams, updateURLHash = true, type = null) {
    const url = `${window.location.pathname}?${searchParams}&section_id=theme-search-results`;

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
   * renderSectionFromFetch - new fetch of the results
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
   * renderSectionFromCache - render from cache
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

  loadResultsForType(event) {
    const params = event.target.dataset.searchParams;
    this.renderPage(params, true);
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
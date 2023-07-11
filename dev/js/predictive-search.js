if (!customElements.get('predictive-search')) {
  /**
   * PredictiveSearch
   * @description Uses the Shopify predictive search api for rendering search results.
   * @link https://shopify.dev/api/ajax/reference/predictive-search
   */
  class PredictiveSearch extends HTMLElement {
    constructor() {
      super();

      // Options
      this.options = {
        hiddenClass: 'hidden',
      };

      // Get options from element data and combine with this.options
      if (this?.dataset?.options) {
        const dataOptions = JSON.parse(this.dataset.options);
        this.options = {
          ...this.options,
          ...dataOptions,
        };
      }

      this.init();
    }

    /**
     * init
     * @description Select elements and add events.
     */
    init() {
      this.input = this.querySelector('[data-predicative-search="input"]');
      this.reset = this.querySelector('[data-predicative-search="reset"]');
      this.predictiveSearchResults = this.querySelector('[data-predicative-search="results"]');
      this.predictiveSearchResources =
        this.predictiveSearchResults.getAttribute('data-resources-types') || 'product';
      this.predictiveSearchMaxSize =
        this.predictiveSearchResults.getAttribute('data-max-results') || 4;

      this.input.addEventListener(
        'input',
        debounce((event) => {
          this.onChange(event);
        }, 100).bind(this)
      );

      this.handleInputState();

      // Handle reset click
      this.reset.addEventListener('click', () => {
        this.clearInput();
        this.handleInputState();
      });

      // Handle typing
      this.input.addEventListener('keyup', () => {
        this.handleInputState();
      });
    }

    /**
     * onChange
     * @description Checks the input value and will call the fetch data function
     * @returns {Void}
     */
    onChange() {
      const searchTerm = this.input.value.trim();
      if (!searchTerm.length) {
        this.close();
        return;
      }
      this.getSearchResults(searchTerm);
    }

    /**
     * getSearchResults
     * @description Fetch data from the predictive search api.
     * @param {String} searchTerm
     */
    getSearchResults(searchTerm) {
      fetch(
        `${routes.predictive_search_url}?q=${searchTerm}&resources[type]=${this.predictiveSearchResources}&resources[limit]=${this.predictiveSearchMaxSize}&section_id=predictive-search`
      )
        .then((response) => {
          if (!response.ok) {
            var error = new Error(response.status);
            this.close();
            throw error;
          }

          return response.text();
        })
        .then((text) => {
          const resultsMarkup = new DOMParser()
            .parseFromString(text, 'text/html')
            .querySelector('#shopify-section-predictive-search').innerHTML;
          this.predictiveSearchResults.innerHTML = resultsMarkup;
          this.open();
        })
        .catch((error) => {
          this.close();
          throw error;
        });
    }

    /**
     * open
     * @description Open the predictive search results.
     */
    open() {
      this.predictiveSearchResults.style.display = 'block';
    }

    /**
     * close
     * @description Close the predictive search results.
     */
    close() {
      this.predictiveSearchResults.style.display = 'none';
    }

    /**
     * handleInputState
     * @description Checks if the input has a value and toggles the input reset button.
     */
    handleInputState() {
      const state = this.input.value.length > 0 ? true : false;
      if (state) {
        this.reset.classList.remove(this.options.hiddenClass);
      } else {
        this.reset.classList.add(this.options.hiddenClass);
        this.close();
      }
      return state;
    }

    /**
     * clearInput
     * @description Clears the input.
     */
    clearInput() {
      this.input.value = '';
      this.input.focus();
    }
  }

  window.PredictiveSearch = PredictiveSearch;

  customElements.define('predictive-search', PredictiveSearch);
}

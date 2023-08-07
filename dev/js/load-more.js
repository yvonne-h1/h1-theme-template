// Used in the Collection, Search and Blog templates
if (!customElements.get('load-more')) {
  class LoadMore extends HTMLElement {
    constructor() {
      super();

      // Get the template - Collection, Search or Blog
      this.currentTemplate = 'collection';
      this.windowTemplate = window.collection;
      this.ajaxSectionToLoad = 'collection-filters-content';
      this.updateContent = true;

      if (document.body.classList.contains('template-search')) {
        this.currentTemplate = 'search';
        this.windowTemplate = window.search;
        this.ajaxSectionToLoad = 'search-filters-content';
      }

      this.currentPageValue = +this.querySelector('[data-current-page]').value;
      this.totalPagesValue = +this.querySelector('[data-total-pages]').value;
      this.totalItemsValue = +this.querySelector('[data-total-items]').value;
      this.totalItemsOnLastPageValue = +this.querySelector('[data-items-on-last-page]').value;

      this.loadedPages = [];
      if (this.loadedPages.indexOf(this.currentPageValue) === -1) {
        this.loadedPages.push(this.currentPageValue);
      }

      this.initLoadMoreButtons();
    }

    /**
     * initLoadMoreButtons
     * @description Create the load more/prev buttons. Is also called again after fetch is done
     * @param {Boolean} updateProgress
     */
    initLoadMoreButtons(updateProgress = false) {
      // hide the buttons based on the page displayed
      this.totalPagesValue === this.currentPageValue &&
      this.querySelector('[data-load-trigger="next"]') != null
        ? this.querySelector('[data-load-trigger="next"]').classList.add('hidden')
        : null;

      this.currentPageValue === 1 && this.querySelector('[data-load-trigger="prev"]') != null
        ? this.querySelector('[data-load-trigger="prev"]').classList.add('hidden')
        : null;

      this.loadTrigger = this.querySelectorAll('[data-load-trigger]');
      this.loadTrigger.forEach((trigger) =>
        trigger.addEventListener('click', this.loadItems.bind(this)),
      );

      // 'Showing x products of xx products' text
      if (updateProgress) {
        let currentItems = +this.querySelector('[data-progress-current]').innerHTML;

        // if we're on the last page, get the max items on the last page, since this could be any value
        if (this.loadedPages.length === this.windowTemplate.totalPages) {
          currentItems =
            (this.loadedPages.length - 1) * this.windowTemplate.itemsPerPage +
            this.totalItemsOnLastPageValue;
        }
        // else if the last page is loaded
        else if (this.currentPageValue === this.totalPagesValue) {
          currentItems = currentItems + this.totalItemsOnLastPageValue;
        }
        // else display the x products per page
        else {
          currentItems = currentItems + this.windowTemplate.itemsPerPage;
        }

        // update the elements on the page with the values
        document
          .querySelectorAll('[data-progress-current]')
          .forEach((el) => (el.innerHTML = currentItems));
      }
    }

    /**
     * loadItems
     * @description Gets the url to fetch and toggles the load items/loading text
     * @param {Object} event
     */
    loadItems(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const linkElement = event.target.closest('a');
      const direction = linkElement.dataset.loadTrigger;
      linkElement.querySelector('[data-load-text]').classList.add('hidden');
      linkElement.querySelector('[data-loader]').classList.remove('hidden');

      const url = `${linkElement.href}&section_id=${this.ajaxSectionToLoad}`;
      this.renderElementsFromFetch(url, linkElement.href, direction);
    }

    /**
     * renderElementsFromFetch
     * @description Renders the products/articles based on the fetch url data.
     * @param {String} url
     * @param {String} page
     * @param {String} direction
     */
    renderElementsFromFetch(url, page, direction) {
      fetch(url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          let wrapperID = '#products';

          if (!html.querySelector(`${wrapperID}`)) return;

          let elementsWrapper = document.querySelector('#CollectionProductGrid');
          let wrapperIDSelector = '[data-products-wrapper]';
          if (this.currentTemplate === 'search') {
            elementsWrapper = document.querySelector('#SearchProductGrid');
          }

          // update the wrapper with the new elements (products/articles)
          const newContent = html.querySelector(`${wrapperID} ${wrapperIDSelector}`).querySelectorAll('li');

          // depending on the direction of the click, append or prepend the products/articles and update the pagination
          if (direction == 'next') {
            newContent.forEach((element, index) => {
              // append the new items and focus the first added item
              elementsWrapper.querySelector(`${wrapperIDSelector}`).append(element);
              if (index === 0) {
                element.querySelector('.product-card__sr-link').focus();
              }
            });

            // update the pagination
            const paginationNextHtml = html.querySelector('[data-pagination-next]').innerHTML;
            elementsWrapper.querySelector('[data-pagination-next]').innerHTML = paginationNextHtml;
          }
          else {
            newContent.forEach((element, index) => {
              // append the new items and focus the first added item
              elementsWrapper.querySelector(`${wrapperIDSelector}`).prepend(element);
              if (index === newContent.length - 1) {
                element.querySelector('.product-card__sr-link').focus();
              }
            });
            // update the pagination
            const paginationPrevHtml = html.querySelector('[data-pagination-prev]').innerHTML;
            elementsWrapper.querySelector('[data-pagination-prev]').innerHTML = paginationPrevHtml;
          }

          // update the variables because the returned amount of products will likely have different pagination values
          this.currentPageValue = +html.querySelector('[data-current-page]').value;
          this.totalPagesValue = +html.querySelector('[data-total-pages]').value;
          this.totalItemsValue = +html.querySelector('[data-total-items]').value;
          this.totalItemsOnLastPageValue = +html.querySelector('[data-items-on-last-page]').value;

          // update the array of loaded pages
          if (this.loadedPages.indexOf(this.currentPageValue) === -1) {
            this.loadedPages.push(this.currentPageValue);
          }

          // reload the function since variables might have been changed
          this.initLoadMoreButtons(true);

          // update url
          this.updateURLHash(page);

          // update the hidden input with the new value
          this.querySelector('[data-current-page]').value = page.split('page=')[1];

          // trigger a window event that we use in the set-creator.js
          window.dispatchEvent(
            new CustomEvent('load-more', {
              bubbles: true,
            }),
          );
        });
    }

    /**
     * updateURLHash
     * @param {String} url
     */
    updateURLHash(url) {
      history.pushState('', '', url);
    }
  }

  window.LoadMore = LoadMore;

  customElements.define('load-more', LoadMore);
}

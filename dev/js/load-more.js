// Used in the Collection, Search and Blog templates
if (!customElements.get('load-more')) {
  class LoadMore extends HTMLElement {
    constructor() {
      super();

      // Get the template - Collection, Search or Blog
      this.currentTemplate = 'collection';
      this.windowTemplate = window.collection;
      this.ajaxSectionToLoad = 'theme-collection-filters-content';

      if ((document.body.classList.contains('template-blog'))) {
        this.currentTemplate = 'blog';
        this.windowTemplate = window.blog;
        this.ajaxSectionToLoad = 'theme-blog-content';
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
      this.querySelector('[data-load-trigger="next"]')
        ? this.querySelector('[data-load-trigger="next"]').classList.add('hidden')
        : null;

      this.currentPageValue === 1 && this.querySelector('[data-load-trigger="prev"]')
        ? this.querySelector('[data-load-trigger="prev"]').classList.add('hidden')
        : null;

      this.loadTrigger = this.querySelectorAll('[data-load-trigger]');
      this.loadTrigger.forEach(trigger =>
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
        document.querySelectorAll('[data-progress-current]').forEach(el => (el.innerHTML = currentItems));
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
      this.renderElementsFromFetch(url, linkElement.href, direction, event);
    }

    /**
     * renderElementsFromFetch
     * @description Renders the products/articles based on the fetch url data.
     * @param {String} url
     * @param {String} page
     * @param {String} direction
     */
    renderElementsFromFetch(url, page, direction, event) {
      fetch(url)
        .then(response => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');

          let wrapperID = '#products';
          if (this.currentTemplate == 'blog') wrapperID = '#articles';

          if (!html.querySelector(`${wrapperID}`)) return;

          let elementsWrapper = document.querySelector('#CollectionProductGrid');
          let wrapperIDSelector = '[data-products-wrapper]';
          if (this.currentTemplate === 'blog') {
            elementsWrapper = document.querySelector('#BlogArticlesGrid');
            wrapperIDSelector = '[data-articles-wrapper]';
          }

          // update the wrapper with the new elements (products/articles)
          const newContent = Array.from(html.querySelector(`${wrapperID} ${wrapperIDSelector}`).querySelectorAll('li'));

          // depending on the direction of the click, append or prepend the products/articles and update the pagination
          if (direction === 'next') {
            newContent.forEach((element, index) => {
              // append the new items and focus the first added item.
              // check for the event.pointerType. It's empty when keyboard was used, so then focus the element.
              elementsWrapper.querySelector(`${wrapperIDSelector}`).append(element);

              // for product cards, focus the screen reader link
              if (index === 0 && event.pointerType === '') {
                if (this.currentTemplate === 'collection') {
                  element.querySelector('.product-card__sr-link')?.focus();
                }
                else if (this.currentTemplate === 'blog') {
                  element.querySelector('footer .button')?.focus();
                }
              }
            });

            // update the pagination
            const paginationNextHtml = html.querySelector('[data-pagination-next]');
            if (paginationNextHtml.innerHTML === '') {
              elementsWrapper.querySelector('[data-pagination-next]').parentElement.classList.add('hidden');
            }
            else {
              elementsWrapper.querySelector('[data-pagination-next]').innerHTML = paginationNextHtml.innerHTML;
            }
          }
          else {
            // reverse the order of items so they are placed in order
            newContent.reverse();

            newContent.forEach((element, index) => {
              // append the new items and focus the first added item.
              // Check for the event.pointerType. It's empty when keyboard was used, so then focus the element.
              elementsWrapper.querySelector(`${wrapperIDSelector}`).prepend(element);
              if (index === newContent.length - 1 && event.pointerType === '') {
                if (this.currentTemplate === 'collection') {
                  element.querySelector('.product-card__sr-link')?.focus();
                }
                else if (this.currentTemplate === 'blog') {
                  element.querySelector('footer .button')?.focus();
                }
              }
            });
            // update the pagination
            const paginationPrevHtml = html.querySelector('[data-pagination-prev]');
            if (paginationPrevHtml) elementsWrapper.querySelector('[data-pagination-prev]').innerHTML = paginationPrevHtml.innerHTML;
          }

          // update the variables because the returned amount of products will likely have different pagination values
          this.currentPageValue = +html.querySelector('[data-current-page]').value;
          this.totalPagesValue = +html.querySelector('[data-total-pages]').value;
          this.totalItemsValue = +html.querySelector('[data-total-items]').value;
          this.totalItemsOnLastPageValue = +html.querySelector('[data-items-on-last-page]').value;

          // update the array of loaded pages
          if (this.loadedPages.indexOf(this.currentPageValue) === -1) this.loadedPages.push(this.currentPageValue);

          // reload the function since variables might have been changed
          this.initLoadMoreButtons(this.currentTemplate === 'collection');

          // update url
          this.updateURLHash(page);

          // update the hidden input with the new value
          this.querySelector('[data-current-page]').value = page.split('page=')[1];

          // trigger a window event that we use in the set-creator.js
          window.dispatchEvent(new CustomEvent('load-more', {
            bubbles: true,
          }));
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

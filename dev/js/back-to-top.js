if (!customElements.get('back-to-top')) {
  class BackToTop extends HTMLElement {
    constructor() {
      super();
      this.button = this.querySelector('button');
      this.button.addEventListener('click', () => window.scroll({ top: 0, behavior: 'smooth' }));
    }
  }

  window.BackToTop = BackToTop;

  customElements.define('back-to-top', BackToTop);
}

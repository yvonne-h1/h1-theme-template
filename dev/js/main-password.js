if (!customElements.get('main-password')) {
  class MainPassword extends HTMLElement {
    constructor() {
      super();
      this.init();
    }
    init() {
      this.dialog = this.querySelector('[data-dialog]');
      this.dialogOpenButton = this.querySelector('[data-dialog-open]');
      this.dialogCloseButton = this.querySelector('[data-dialog-close]');
      this.dialogOpenButton.addEventListener('click', () => {
        this.dialog.showModal();
      });
      this.dialogCloseButton.addEventListener('click', () => {
        this.dialog.close();
      });
    }
  }
  window.MainPassword = MainPassword;
  customElements.define('main-password', MainPassword);
}

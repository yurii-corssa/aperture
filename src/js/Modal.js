export class Modal {
  constructor(selectors, classes) {
    this.selectors = {
      MODALS_CONTAINER: "[data-modals-container]",
      MODAL: "[data-modal-name]",
      MODAL_WINDOW: "[data-modal-window]",
      CLOSE_BUTTON: "[data-modal-close]",
      ...selectors,
    };
    this.classes = {
      NO_SCROLL: "no-scroll",
      ...classes,
    };

    this.elements = {};
    this.elements.modalsContainer = document.querySelector(this.selectors.MODALS_CONTAINER);
    this.elements.modal = this.elements.modalsContainer.querySelector(this.selectors.MODAL);
    this.elements.modalWindow = this.elements.modal.querySelector(this.selectors.MODAL_WINDOW);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  handleClick = (e) => {
    const isModalWindow = this.elements.modalWindow.contains(e.target);
    const isCloseButton = e.target.closest(this.selectors.CLOSE_BUTTON);

    if (!isModalWindow || isCloseButton) {
      this.closeModal();
    }
  };

  handleKeyDown = (e) => {
    if (e.key === "Escape") {
      this.closeModal();
    }
  };

  openModal() {
    document.body.classList.add(this.classes.NO_SCROLL);

    this.elements.modal.showModal();

    setTimeout(() => {
      document.addEventListener("click", this.handleClick);
      window.addEventListener("keydown", this.handleKeyDown);
    }, 0);
  }

  closeModal() {
    document.body.classList.remove(this.classes.NO_SCROLL);

    this.elements.modal.close();

    document.removeEventListener("click", this.handleClick);
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}

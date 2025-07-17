import { removeAllInert, removeInert, setInert, setInertOutside } from "./utils";

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
      IS_VISIBLE: "is-visible",
      IS_HIDDEN: "is-hidden",
      NO_SCROLL: "no-scroll",
      ...classes,
    };

    this.elements = {};
    this.elements.modalsContainer = document.querySelector(this.selectors.MODALS_CONTAINER);
    this.elements.modal = this.elements.modalsContainer.querySelector(this.selectors.MODAL);
    this.elements.modalWindow = this.elements.modal.querySelector(this.selectors.MODAL_WINDOW);
    this.elements.trigger = null;
    this.elements.modal.classList.add(this.classes.IS_HIDDEN);

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
    this.elements.trigger = document.activeElement;

    removeInert(this.elements.modalsContainer);
    setInertOutside(this.elements.modalsContainer);

    document.body.classList.add(this.classes.NO_SCROLL);
    this.elements.modal.classList.replace(this.classes.IS_HIDDEN, this.classes.IS_VISIBLE);
    this.elements.modal.setAttribute("aria-hidden", "false");
    this.elements.modal.setAttribute("aria-modal", "true");

    setTimeout(() => {
      document.addEventListener("click", this.handleClick);
      window.addEventListener("keydown", this.handleKeyDown);
    }, 0);
  }

  closeModal() {
    removeAllInert();
    setInert(this.elements.modalsContainer);

    if (this.elements.trigger) this.elements.trigger.focus();
    else document.body.focus();

    document.body.classList.remove(this.classes.NO_SCROLL);
    this.elements.modal.classList.replace(this.classes.IS_VISIBLE, this.classes.IS_HIDDEN);
    this.elements.modal.setAttribute("aria-hidden", "true");
    this.elements.modal.setAttribute("aria-modal", "false");

    document.removeEventListener("click", this.handleClick);
    window.removeEventListener("keydown", this.handleKeyDown);
  }
}

import { Modal } from "./Modal";

export class GearModal extends Modal {
  constructor() {
    super({
      MODAL: "[data-modal-name='gear']",
      OPEN_BUTTON: "[data-modal-open='gear']",
    });

    this.elements.openButton = document.querySelector(this.selectors.OPEN_BUTTON);
  }

  openModal() {
    super.openModal();
    this.elements.openButton.removeEventListener("click", this.openModal);
  }

  closeModal() {
    super.closeModal();
    this.elements.openButton.addEventListener("click", this.openModal);
  }

  init() {
    this.elements.openButton.addEventListener("click", this.openModal);
  }
}

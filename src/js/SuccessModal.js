import { Modal } from "./Modal";

export class SuccessModal extends Modal {
  constructor() {
    super({
      MODAL: "[data-modal-name='success']",
      TITLE: "[data-success-title]",
      TEXT: "[data-success-text]",
    });

    this.elements.title = this.elements.modal.querySelector(this.selectors.TITLE);
    this.elements.text = this.elements.modal.querySelector(this.selectors.TEXT);
  }

  openModal({ title, text }) {
    super.openModal();
    this.elements.title.textContent = title;
    this.elements.text.textContent = text;
  }
}

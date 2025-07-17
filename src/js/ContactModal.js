import { ContactForm } from "./ContactForm";
import { Modal } from "./Modal";
import { SuccessModal } from "./SuccessModal";

export class ContactModal extends Modal {
  constructor() {
    super({
      MODAL: "[data-modal-name='contact']",
      OPEN_BUTTON: "[data-modal-open='contact']",
      CLOSE_BUTTON: "[data-modal-close]",
    });

    this.elements.openButton = document.querySelector(this.selectors.OPEN_BUTTON);

    this.contactForm = new ContactForm(this.submitForm);
    this.successModal = new SuccessModal();
  }

  submitForm = (formEntries) => {
    const successMessage = {
      title: `Thank you, ${formEntries.name}!`,
      text: `Your message has been successfully sent. We will contact you at ${formEntries.email} soon!`,
    };

    this.closeModal();
    this.successModal.openModal(successMessage);
  };

  handleIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.elements.openButton.addEventListener("click", this.openModal);
      } else {
        this.elements.openButton.removeEventListener("click", this.openModal);
      }
    });
  };

  openModal() {
    // e.stopPropagation();
    super.openModal();
    this.elements.openButton.removeEventListener("click", this.openModal);
    this.contactForm.init();
  }

  closeModal() {
    super.closeModal();
    this.elements.openButton.addEventListener("click", this.openModal);
    this.contactForm.destroy();
  }

  init() {
    this.intersectObserver = new IntersectionObserver(this.handleIntersect);
    this.intersectObserver.observe(this.elements.openButton);
  }
}

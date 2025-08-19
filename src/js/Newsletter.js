import { SuccessModal } from "./SuccessModal";

export class Newsletter {
  constructor() {
    this.selectors = {
      FORM: "[data-newsletter-form]",
    };
    this.elements = {};
    this.elements.form = document.querySelector(this.selectors.FORM);

    this.successModal = new SuccessModal();
  }

  submitForm = (formEntries) => {
    const successMessage = {
      title: "Thank you for subscribing!",
      text: `You have successfully subscribed with the email: ${formEntries.email}.`,
    };

    this.successModal.openModal(successMessage);
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(this.elements.form);
    const formEntries = Object.fromEntries(formData.entries());
    this.submitForm(formEntries);
    this.elements.form.reset();
  };

  handleIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.elements.form.addEventListener("submit", this.handleSubmit);
      } else {
        this.elements.form.removeEventListener("submit", this.handleSubmit);
      }
    });
  };

  init() {
    this.intersectObserver = new IntersectionObserver(this.handleIntersect);
    this.intersectObserver.observe(this.elements.form);
  }
}

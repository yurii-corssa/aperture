export class ContactForm {
  constructor(onSubmit) {
    this.selectors = {
      FORM: "[data-contact-form]",
    };

    this.formElement = document.querySelector(this.selectors.FORM);
    this.onSubmit = onSubmit;
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formEntries = Object.fromEntries(formData.entries());

    this.onSubmit(formEntries);
    this.formElement.reset();
  };

  init() {
    this.formElement.addEventListener("submit", this.handleSubmit);
  }

  destroy() {
    this.formElement.removeEventListener("submit", this.handleSubmit);
    this.formElement.reset();
  }
}

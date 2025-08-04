import { Modal } from "./Modal";
import { Slider } from "./Slider";
import { gallerySliderConfig } from "./config.js";

export class GalleryModal extends Modal {
  constructor({ key = "gallery" }) {
    super({
      MODAL: `[data-modal-name='${key}']`,
      OPEN_BUTTON: `[data-modal-open='${key}']`,
      CLOSE_BUTTON: "[data-modal-close]",
    });

    this.sliderConfig = { ...gallerySliderConfig, key };

    this.elements.openButton = document.querySelector(this.selectors.OPEN_BUTTON);

    this.gallerySlider = new Slider(this.sliderConfig);
  }

  openModal() {
    super.openModal();
    this.elements.openButton.removeEventListener("click", this.openModal);

    this.gallerySlider.init();
  }

  closeModal() {
    super.closeModal();
    this.elements.openButton.addEventListener("click", this.openModal);
    this.gallerySlider.destroy();
  }

  handleIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        this.elements.openButton.addEventListener("click", this.openModal);
      } else {
        this.elements.openButton.removeEventListener("click", this.openModal);
      }
    });
  };

  init() {
    this.intersectObserver = new IntersectionObserver(this.handleIntersect);
    this.intersectObserver.observe(this.elements.openButton);
  }
}

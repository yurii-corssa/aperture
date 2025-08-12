import { Modal } from "./Modal";

export class GearModal extends Modal {
  constructor() {
    super({
      MODAL: "[data-modal-name='gear']",
      GEAR_MAP: "[data-gear-map]",
      OPEN_BUTTON: "[data-modal-open='gear']",
    });

    this.elements.openButton = document.querySelector(this.selectors.OPEN_BUTTON);
    this.elements.gearMap = this.elements.modal.querySelector(this.selectors.GEAR_MAP);
  }

  animateHorizontalScroll = (targetLeft) => {
    const { gearMap } = this.elements;

    const startLeft = gearMap.scrollLeft;
    const change = targetLeft - startLeft;

    if (change === 0) return;

    const startTime = performance.now();

    const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 1000, 1);
      const eased = easeInOutCubic(progress);

      gearMap.scrollLeft = startLeft + change * eased;

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  openModal() {
    const { gearMap, openButton } = this.elements;

    super.openModal();
    openButton.removeEventListener("click", this.openModal);

    setTimeout(() => {
      const availableScrollableWidth = gearMap.scrollWidth - gearMap.clientWidth;

      if (availableScrollableWidth < 2) return;

      const targetLeft = Math.round(availableScrollableWidth / 2);

      this.animateHorizontalScroll(targetLeft);
    }, 250);
  }

  closeModal() {
    const { openButton } = this.elements;

    super.closeModal();
    openButton.addEventListener("click", this.openModal);

    this.animateHorizontalScroll(0);
  }

  init() {
    this.elements.openButton.addEventListener("click", this.openModal);
  }
}

import { MobileMenu } from "./MobileMenu";

export class Header {
  selectors = {
    HEADER: "[data-header]",
  };
  classes = {
    IS_VISIBLE: "is-visible",
    IS_HIDDEN: "is-hidden",
  };
  defaultConfig = {
    visibilityThreshold: 200,
    mobileMenu: {
      enabled: true,
      config: {
        breakpoint: 768,
        type: "slide", // or "dropdown"
        position: "right", // or "left"
      },
    },
  };
  constructor(initialConfig = {}) {
    this.config = { ...this.defaultConfig, ...initialConfig };

    this.elements = {};
    this.elements.header = document.querySelector(this.selectors.HEADER);

    this.headerIsHidden = false;
    this.lastPosition = 0;

    if (this.config.mobileMenu.enabled) {
      this.mobileMenu = new MobileMenu(this.config.mobileMenu.config);
    }
  }

  toggleHeaderVisibility = (headerShouldBeHidden) => {
    if (headerShouldBeHidden === this.headerIsHidden) return;

    this.elements.header.classList.toggle(this.classes.IS_HIDDEN, headerShouldBeHidden);

    this.headerIsHidden = headerShouldBeHidden;
  };

  handleScroll = () => {
    const currentPosition = window.scrollY;
    const threshold = this.config.visibilityThreshold;
    const shouldBeHidden = currentPosition > threshold && currentPosition > this.lastPosition;

    this.toggleHeaderVisibility(shouldBeHidden);

    this.lastPosition = currentPosition;
  };

  init() {
    if (this.mobileMenu) this.mobileMenu.init();
    window.addEventListener("scroll", this.handleScroll);
  }
}

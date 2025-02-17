import { toRem } from "./utils";

export class Header {
  menuTypes = {
    SLIDE: "slide",
    DROPDOWN: "dropdown",
  };

  menuPosition = {
    LEFT: "left",
    RIGHT: "right",
  };

  selectors = {
    HEADER: "[data-header]",
    MOBILE_MENU: "[data-mobile-menu]",
    BURGER_BUTTON: "[data-burger-menu-button]",
    BACKDROP: "[data-backdrop]",
  };

  classes = {
    IS_VISIBLE: "is-visible",
    IS_HIDDEN: "is-hidden",
    IS_OPEN: "is-open",
    NO_SCROLL: "no-scroll",
    menuType: "",
    menuPosition: "",
  };

  defaultConfig = {
    visibilityThreshold: 200,
    menuBreakpoint: 768,
    menuType: this.menuTypes.SLIDE,
    menuPosition: this.menuPosition.RIGHT,
  };

  constructor(initialConfig = {}) {
    this.config = { ...this.defaultConfig, ...initialConfig };

    this.headerEl = document.querySelector(this.selectors.HEADER);
    this.menuEl = this.headerEl.querySelector(this.selectors.MOBILE_MENU);
    this.burgerButtonEl = this.headerEl.querySelector(this.selectors.BURGER_BUTTON);
    this.backdropEl = document.querySelector(this.selectors.BACKDROP);

    this.headerIsHidden = false;
    this.lastPosition = 0;
    this.menuIsActive = true;
    this.menuIsOpen = false;

    this.init();
  }

  handleClickOutside = (e) => {
    if (!this.headerEl.contains(e.target) && !this.burgerButtonEl.contains(e.target)) {
      this.closeMenu();
    }
  };

  openMenu = () => {
    this.menuEl.classList.add(this.classes.IS_OPEN);
    this.backdropEl.classList.add(this.classes.IS_VISIBLE);
    document.body.classList.add(this.classes.NO_SCROLL);
    this.burgerButtonEl.setAttribute("aria-expanded", "true");
    this.menuEl.setAttribute("aria-hidden", "false");

    this.menuIsOpen = true;

    window.addEventListener("click", this.handleClickOutside);
  };

  closeMenu = () => {
    this.menuEl.classList.remove(this.classes.IS_OPEN);
    this.backdropEl.classList.remove(this.classes.IS_VISIBLE);
    document.body.classList.remove(this.classes.NO_SCROLL);
    this.burgerButtonEl.setAttribute("aria-expanded", "false");
    this.menuEl.setAttribute("aria-hidden", "true");

    this.menuIsOpen = false;

    window.removeEventListener("click", this.handleClickOutside);
  };

  toggleMenuOpen = () => {
    const menuShouldBeOpen = !this.menuIsOpen;

    if (menuShouldBeOpen) this.openMenu();
    else this.closeMenu();
  };

  handleMenuState = (shouldBeActive) => {
    const headerHeight = this.headerEl.offsetHeight;
    document.documentElement.style.setProperty("--header-height", `${toRem(headerHeight)}rem`);

    if (shouldBeActive) {
      this.burgerButtonEl.addEventListener("click", this.toggleMenuOpen);
      this.headerEl.classList.add(this.config.menuType);

      if (this.config.menuType === this.menuTypes.SLIDE) {
        this.headerEl.classList.add(this.config.menuPosition);
      }
    } else {
      this.burgerButtonEl.removeEventListener("click", this.toggleMenuOpen);
      delete this.headerEl.classList.remove(this.config.menuType);
      delete this.headerEl.classList.remove(this.config.menuPosition);

      if (this.menuIsOpen) this.closeMenu();
    }
  };

  toggleHeaderVisibility = (headerShouldBeHidden) => {
    if (headerShouldBeHidden === this.headerIsHidden) return;

    this.headerEl.classList.toggle(this.classes.IS_HIDDEN, headerShouldBeHidden);

    this.headerIsHidden = headerShouldBeHidden;
  };

  handleScroll = () => {
    const currentPosition = window.scrollY;
    const threshold = this.config.visibilityThreshold;
    const shouldBeHidden = currentPosition > threshold && currentPosition > this.lastPosition;

    this.toggleHeaderVisibility(shouldBeHidden);

    this.lastPosition = currentPosition;
  };

  init = () => {
    const mediaQuery = window.matchMedia(`(width < ${toRem(this.config.menuBreakpoint)}rem)`);

    this.handleMenuState(mediaQuery.matches);

    mediaQuery.addEventListener("change", (e) => this.handleMenuState(e.matches));
    window.addEventListener("scroll", this.handleScroll);
  };
}

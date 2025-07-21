import { removeAllInert, removeInert, setInert, setInertOutside, toRem } from "./utils";

export class MobileMenu {
  types = {
    SLIDE: "slide",
    DROPDOWN: "dropdown",
  };
  positions = {
    LEFT: "left",
    RIGHT: "right",
  };
  selectors = {
    MENU: "[data-mobile-menu]",
    MENU_ITEM: "[data-mobile-menu-item]",
    MENU_TOGGLE: "[data-mobile-menu-toggle]",
  };
  classes = {
    IS_VISIBLE: "is-visible",
    IS_HIDDEN: "is-hidden",
    NO_SCROLL: "no-scroll",
  };
  defaultConfig = {
    breakpoint: 768,
    type: this.types.SLIDE,
    position: this.positions.RIGHT,
  };

  constructor(initialConfig = {}) {
    this.config = { ...this.defaultConfig, ...initialConfig };

    this.elements = {};
    this.elements.menu = document.querySelector(this.selectors.MENU);
    this.elements.menuToggle = document.querySelector(this.selectors.MENU_TOGGLE);
    this.elements.trigger = null;
    this.elements.menu.classList.add(this.classes.IS_HIDDEN);

    this.menuIsActive = false;
    this.menuIsOpen = false;

    this.closeMenu = this.closeMenu.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  handleClick = (e) => {
    const isMenuToggle = e.target.closest(this.selectors.MENU_TOGGLE) !== null;

    if (isMenuToggle) {
      setTimeout(() => this.toggleMenu(), 0);
      return;
    }
    const isMenuItem = e.target.closest(this.selectors.MENU_ITEM);
    const isOutsideMenu = !this.elements.menu.contains(e.target);

    if (isOutsideMenu || isMenuItem) {
      this.closeMenu();
    }
  };

  handleKeyDown = (e) => {
    if (e.key === "Escape") this.closeMenu();
  };

  enableMenu = () => {
    this.menuIsActive = true;

    setInert(this.elements.menu);

    this.elements.menuToggle.addEventListener("click", this.handleClick);
    this.elements.menu.dataset.menuType = this.config.type;

    if (this.config.type === this.types.SLIDE) {
      this.elements.menu.dataset.menuPosition = this.config.position;
    }
  };

  disableMenu = () => {
    this.menuIsActive = false;

    if (this.menuIsOpen) {
      this.closeMenu();
      document.removeEventListener("click", this.handleClick);
    } else {
      removeInert(this.elements.menu);
      this.elements.menuToggle.removeEventListener("click", this.handleClick);
    }
  };

  handleMenuState = (shouldBeActive) => {
    if (shouldBeActive === this.menuIsActive) return;

    if (shouldBeActive) {
      this.enableMenu();
    } else {
      this.disableMenu();
    }
  };

  openMenu() {
    this.menuIsOpen = true;

    removeInert(this.elements.menu);
    setInertOutside(this.elements.menu);

    document.body.classList.add(this.classes.NO_SCROLL);
    this.elements.menu.classList.replace(this.classes.IS_HIDDEN, this.classes.IS_VISIBLE);
    this.elements.menuToggle.setAttribute("aria-expanded", "true");
    this.elements.menu.setAttribute("aria-hidden", "false");

    this.elements.menuToggle.removeEventListener("click", this.handleClick);
    document.addEventListener("click", this.handleClick);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  closeMenu() {
    this.menuIsOpen = false;

    removeAllInert();
    if (this.menuIsActive) {
      setInert(this.elements.menu);
      this.elements.menuToggle.focus();
    } else {
      //   document.body.focus();
    }

    document.body.classList.remove(this.classes.NO_SCROLL);
    this.elements.menu.classList.replace(this.classes.IS_VISIBLE, this.classes.IS_HIDDEN);
    this.elements.menuToggle.setAttribute("aria-expanded", "false");
    this.elements.menu.setAttribute("aria-hidden", "true");

    document.removeEventListener("click", this.handleClick);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.elements.menuToggle.addEventListener("click", this.handleClick);
  }

  toggleMenu() {
    if (!this.menuIsOpen) {
      this.openMenu();
    } else {
      this.closeMenu();
    }
  }

  init() {
    const mediaQuery = window.matchMedia(`(width < ${toRem(this.config.breakpoint)}rem)`);
    this.handleMenuState(mediaQuery.matches);
    mediaQuery.addEventListener("change", (e) => this.handleMenuState(e.matches));
  }
}

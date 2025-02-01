import { toRem } from "js/utils";

class Slider {
  defaultConfig = {
    autoplay: false,
    interval: 3000,
    delay: 300,
    slidesToShow: 1,
    listGap: 0,
    slideMinWidth: 128,
  };

  intersectionConfig = {
    root: null,
    rootMargin: "0%",
    threshold: 0,
  };

  constructor(sliderElement, sliderKey, initialConfig) {
    this.sliderKey = sliderKey;
    this.dataAttributesMap = this.#createDataAttributesMap();
    this.elementSelectorsMap = this.#createElementSelectorsMap();

    this.sliderElement = sliderElement;
    this.listElement = this.sliderElement.querySelector(this.elementSelectorsMap.list);
    this.itemElements = this.listElement?.children;
    this.prevBtnElement = this.sliderElement.querySelector(this.elementSelectorsMap.prevBtn);
    this.nextBtnElement = this.sliderElement.querySelector(this.elementSelectorsMap.nextBtn);

    this.config = this.#setupConfig(initialConfig);

    if (!this.#validateSliderElements()) return;

    this.totalSlides = this.itemElements.length;
    this.activeItem = this.itemElements[0];
    this.prevItem = this.itemElements[this.totalSlides - 1];
    this.nextItem = this.activeItem.nextElementSibling;
    this.navBtnsExist = this.prevBtnElement && this.nextBtnElement;
    this.navigationIsDisabled = false;
    this.autoplayIntervalId = null;

    this.resizeObserver = new ResizeObserver(this.#onResize);
    this.intersectObserver = new IntersectionObserver(this.#onIntersect, this.intersectionConfig);

    this.intersectObserver.observe(this.sliderElement);
  }

  #createDataAttributesMap = () => {
    const createAttributeString = (attr) => `data-${this.sliderKey}-${attr}`;

    return {
      autoplay: createAttributeString("autoplay"),
      interval: createAttributeString("interval"),
      slidesToShow: createAttributeString("slides-to-show"),
      loop: createAttributeString("loop"),
      listGap: createAttributeString("list-gap"),
      slideMinWidth: createAttributeString("slide-min-width"),
      activeItem: createAttributeString("active-item"),
      prevItem: createAttributeString("prev-item"),
      nextItem: createAttributeString("next-item"),
    };
  };

  #createElementSelectorsMap = () => {
    const createSelectorString = (selector) => `[data-${this.sliderKey}-${selector}]`;

    return {
      list: createSelectorString("list"),
      prevBtn: createSelectorString("prev-btn"),
      nextBtn: createSelectorString("next-btn"),
      activeItem: createSelectorString("active-item"),
      prevItem: createSelectorString("prev-item"),
      nextItem: createSelectorString("next-item"),
    };
  };

  #parseAttributeValue = (key, value) => {
    const parseBoolean = (value) => {
      if (value === "true" || value === "false") {
        return value === "true";
      }
      console.warn(`Slider "${this.sliderKey}": invalid boolean value for "${key}": ${value}`);
      return null;
    };

    const parseNumber = (value) => {
      const numericValue = Number(value);
      if (isNaN(numericValue)) {
        console.warn(`Value for ${key} is not a number: ${value}`);
        return null;
      }
      if (numericValue < 1) {
        console.warn(`Slider "${this.sliderKey}": invalid number value for "${key}": ${value}`);
        return null;
      }
      return numericValue;
    };

    switch (typeof this.defaultConfig[key]) {
      case "boolean":
        return parseBoolean(value);
      case "number":
        return parseNumber(value);
      default:
        return value;
    }
  };

  #applyStyles = () => {
    const { listGap, slidesToShow } = this.config;

    this.sliderElement.style.setProperty("--slider-list-gap", `${toRem(listGap)}rem`);
    this.sliderElement.style.setProperty("--slider-slides-to-show", slidesToShow);
  };

  #setupConfig = (initialConfig) => {
    const config = {
      ...this.defaultConfig,
      ...initialConfig,
    };

    Object.entries(this.dataAttributesMap)
      .filter(([_, attribute]) => this.sliderElement.hasAttribute(attribute))
      .forEach(([key, attribute]) => {
        const dataValue = this.sliderElement.getAttribute(attribute);
        const parsedValue = this.#parseAttributeValue(key, dataValue);

        config[key] = parsedValue;
      });

    const get = (target, prop) => {
      return target[prop];
    };

    const set = (target, prop, value) => {
      if (target[prop] === value) return true;

      target[prop] = value;
      this.#applyStyles();

      return true;
    };

    return new Proxy(config, { get, set });
  };

  #validateSliderElements = () => {
    if (!this.listElement) {
      console.error(`Slider "${this.sliderKey}": list element not found.`);
      return false;
    }
    if (!this.itemElements || !this.itemElements.length) {
      console.warn(`Slider "${this.sliderKey}": no items found in the list.`);
      return false;
    }

    return true;
  };

  #calculateVisibleSlides = () => {
    const { listGap, slideMinWidth } = this.config;
    const currentListWidth = this.listElement.offsetWidth;
    const slidesCount = Math.floor((currentListWidth + listGap) / (slideMinWidth + listGap));

    this.config.slidesToShow = Math.min(this.totalSlides, Math.max(1, slidesCount));
  };

  #setupNavigation = () => {
    const shouldDisableNavigation = this.totalSlides <= this.config.slidesToShow;
    const navigationStateChanged = shouldDisableNavigation !== this.navigationIsDisabled;

    this.navigationIsDisabled = shouldDisableNavigation;

    if (navigationStateChanged) {
      if (this.navBtnsExist) {
        this.prevBtnElement.disabled = shouldDisableNavigation;
        this.nextBtnElement.disabled = shouldDisableNavigation;
      }
    }

    if (shouldDisableNavigation) this.stopAutoplay();
    else this.startAutoplay();
  };

  #onResize = () => {
    this.#calculateVisibleSlides();
    this.#setupNavigation();
  };

  #onIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (this.navBtnsExist) {
          this.prevBtnElement.addEventListener("click", this.moveToLeft);
          this.nextBtnElement.addEventListener("click", this.moveToRight);
        }

        this.resizeObserver.observe(this.sliderElement);
      } else {
        if (this.navBtnsExist) {
          this.prevBtnElement.removeEventListener("click", this.moveToLeft);
          this.nextBtnElement.removeEventListener("click", this.moveToRight);
        }

        this.stopAutoplay();
        this.resizeObserver.unobserve(this.sliderElement);
      }
    });
  };

  moveToLeft = () => {
    const activeItem = this.activeItem;
    const prevItem = this.prevItem;
    const newPrevItem = prevItem.previousElementSibling;

    prevItem.classList.add("is-entering");
    this.listElement.insertBefore(prevItem, activeItem);

    requestAnimationFrame(() => prevItem.classList.remove("is-entering"));

    this.activeItem = prevItem;
    this.prevItem = newPrevItem;
    this.nextItem = activeItem;
  };

  moveToRight = () => {
    const activeItem = this.activeItem;
    const nextItem = this.nextItem;
    const clonedItem = activeItem.cloneNode(true);

    activeItem.classList.add("is-leaving");
    this.listElement.appendChild(clonedItem);

    const onTransitionEnd = () => {
      activeItem.removeEventListener("transitionend", onTransitionEnd);
      activeItem.remove();
    };

    activeItem.addEventListener("transitionend", onTransitionEnd);

    this.activeItem = nextItem;
    this.prevItem = clonedItem;
    this.nextItem = nextItem.nextElementSibling;
  };

  stopAutoplay = () => {
    if (this.autoplayIntervalId) {
      clearInterval(this.autoplayIntervalId);
      clearTimeout(this.autoplayDelayId);
      this.autoplayDelayId = null;
      this.autoplayIntervalId = null;
      this.sliderElement.removeEventListener("mouseenter", this.pauseAutoplay);
      this.sliderElement.removeEventListener("mouseleave", this.startAutoplay);
    }
  };

  pauseAutoplay = () => {
    if (this.autoplayIntervalId) {
      clearTimeout(this.autoplayDelayId);
      clearInterval(this.autoplayIntervalId);
      this.autoplayDelayId = null;
      this.autoplayIntervalId = null;
      this.sliderElement.removeEventListener("mouseenter", this.pauseAutoplay);
      this.sliderElement.addEventListener("mouseleave", this.startAutoplay);
    }
  };

  startAutoplay = () => {
    const isNotRunning = !this.autoplayIntervalId && !this.autoplayDelayId;

    if (this.config.autoplay && !this.navigationIsDisabled && isNotRunning) {
      const { interval, delay } = this.config;

      this.autoplayDelayId = setTimeout(() => {
        this.moveToRight();
        this.autoplayIntervalId = setInterval(() => {
          this.moveToRight();
        }, interval);
      }, delay);

      this.sliderElement.removeEventListener("mouseleave", this.startAutoplay);
      this.sliderElement.addEventListener("mouseenter", this.pauseAutoplay);
    }
  };
}

export class SliderGroup {
  constructor(sliderKey = "slider", initialConfig = {}) {
    this.sliderKey = sliderKey;
    this.config = initialConfig;
    this.sliderElements = document.querySelectorAll(`[data-${this.sliderKey}]`);

    if (!this.sliderElements.length) {
      console.warn(`No slider elements found for selector: [data-${this.sliderKey}]`);
      return;
    }

    this.sliderElements.forEach((sliderElement) => {
      new Slider(sliderElement, this.sliderKey, this.config);
    });
  }
}

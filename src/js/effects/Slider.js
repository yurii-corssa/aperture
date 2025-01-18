class Slider {
  defaultConfig = {
    autoplay: false,
    interval: 3000,
    slidesToShow: 1,
    loop: true,
  };

  constructor(sliderElement, sliderKey, initialConfig) {
    this.sliderKey = sliderKey;
    this.dataAttributesMap = this.createDataAttributesMap();
    this.elementSelectorsMap = this.createElementSelectorsMap();

    this.sliderElement = sliderElement;
    this.listElement = this.sliderElement.querySelector(this.elementSelectorsMap.list);
    this.itemElements = this.listElement?.children;
    this.prevBtn = this.sliderElement.querySelector(this.elementSelectorsMap.prevBtn);
    this.nextBtn = this.sliderElement.querySelector(this.elementSelectorsMap.nextBtn);

    if (!this.validateSliderElements()) return;

    this.config = this.setupConfig(initialConfig);

    this.activeItem = this.itemElements[0];
    this.prevItem = this.itemElements[this.itemElements.length - 1];
    this.nextItem = this.activeItem.nextElementSibling;

    this.updateSliderStyles();
    this.bindEvents();
  }

  createDataAttributesMap() {
    const createAttributeString = (attr) => `data-${this.sliderKey}-${attr}`;

    return {
      autoplay: createAttributeString("autoplay"),
      interval: createAttributeString("interval"),
      slidesToShow: createAttributeString("slides-to-show"),
      loop: createAttributeString("loop"),
      activeItem: createAttributeString("active-item"),
      prevItem: createAttributeString("prev-item"),
      nextItem: createAttributeString("next-item"),
    };
  }

  createElementSelectorsMap() {
    const createSelectorString = (selector) => `[data-${this.sliderKey}-${selector}]`;

    return {
      list: createSelectorString("list"),
      prevBtn: createSelectorString("prev-btn"),
      nextBtn: createSelectorString("next-btn"),
      activeItem: createSelectorString("active-item"),
      prevItem: createSelectorString("prev-item"),
      nextItem: createSelectorString("next-item"),
    };
  }

  parseAttributeValue(key, value) {
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

    switch (key) {
      case "autoplay":
      case "loop":
        return parseBoolean(value);
      case "interval":
      case "slidesToShow":
        return parseNumber(value);
      default:
        return value;
    }
  }

  setupConfig(initialConfig) {
    const config = {
      ...this.defaultConfig,
      ...initialConfig,
    };

    Object.entries(this.dataAttributesMap)
      .filter(([_, attribute]) => this.sliderElement.hasAttribute(attribute))
      .forEach(([key, attribute]) => {
        const dataValue = this.sliderElement.getAttribute(attribute);
        const parsedValue = this.parseAttributeValue(key, dataValue);

        config[key] = parsedValue;
      });

    return new Proxy(config, {
      get: (target, prop) => target[prop],
      set: (target, prop, value) => {
        target[prop] = value;
        this.updateSliderStyles();
        return true;
      },
    });
  }

  onClickPrevBtn = () => {
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

  onClickNextBtn = () => {
    const activeItem = this.activeItem;
    const nextItem = this.nextItem;

    const onTransitionEnd = () => {
      activeItem.removeEventListener("transitionend", onTransitionEnd);
      activeItem.classList.remove("is-leaving");
      this.listElement.appendChild(activeItem);
    };

    requestAnimationFrame(() => activeItem.classList.add("is-leaving"));

    activeItem.addEventListener("transitionend", onTransitionEnd);

    this.activeItem = nextItem;
    this.prevItem = activeItem;
    this.nextItem = nextItem.nextElementSibling;
  };

  bindEvents() {
    if (this.prevBtn && this.nextBtn) {
      this.prevBtn.addEventListener("click", this.onClickPrevBtn);
      this.nextBtn.addEventListener("click", this.onClickNextBtn);
    }
  }

  validateSliderElements() {
    if (!this.listElement) {
      console.warn(`Slider "${this.sliderKey}": list element not found.`);
      return false;
    }
    if (!this.itemElements || !this.itemElements.length) {
      console.warn(`Slider "${this.sliderKey}": no items found in the list.`);
      return false;
    }
    return true;
  }

  updateSliderStyles() {
    this.itemWidthPercent = 100 / this.config.slidesToShow;
    this.sliderElement.style.setProperty("--slider-item-width", `${this.itemWidthPercent}%`);
  }
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

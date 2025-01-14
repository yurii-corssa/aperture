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

    if (!this.listElement) {
      console.warn(`Slider "${this.sliderKey}": list element not found.`);
      return;
    }
    if (!this.itemElements || !this.itemElements.length) {
      console.warn(`Slider "${this.sliderKey}": no items found in the list.`);
      return;
    }

    this.currentConfig = {
      ...this.defaultConfig,
      ...initialConfig,
      ...this.getDataConfig(),
    };

    this.itemWidthPercent = 100 / this.currentConfig.slidesToShow;
    this.sliderElement.style.setProperty("--slider-item-width", `${this.itemWidthPercent}%`);

    this.activeItem = this.itemElements[0];
    this.prevItem = this.itemElements[this.itemElements.length - 1];
    this.nextItem = this.activeItem.nextElementSibling;

    this.activeItem.setAttribute(this.dataAttributesMap.activeItem, "");
    this.prevItem.setAttribute(this.dataAttributesMap.prevItem, "");
    this.nextItem.setAttribute(this.dataAttributesMap.nextItem, "");

    this.bindEvents();
  }

  createDataAttributesMap() {
    return {
      autoplay: `data-${this.sliderKey}-autoplay`,
      interval: `data-${this.sliderKey}-interval`,
      slidesToShow: `data-${this.sliderKey}-slides-to-show`,
      loop: `data-${this.sliderKey}-loop`,
      activeItem: `data-${this.sliderKey}-active-item`,
      prevItem: `data-${this.sliderKey}-prev-item`,
      nextItem: `data-${this.sliderKey}-next-item`,
    };
  }

  createElementSelectorsMap() {
    return {
      list: `[data-${this.sliderKey}-list]`,
      prevBtn: `[data-${this.sliderKey}-prev-btn]`,
      nextBtn: `[data-${this.sliderKey}-next-btn]`,
      activeItem: `[data-${this.sliderKey}-active-item]`,
      prevItem: `[data-${this.sliderKey}-prev-item]`,
      nextItem: `[data-${this.sliderKey}-next-item]`,
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

  getDataConfig() {
    const dataConfig = {};

    Object.entries(this.dataAttributesMap).forEach(([key, attribute]) => {
      const dataValue = this.sliderElement.getAttribute(attribute);

      if (dataValue !== null) {
        const parsedValue = this.parseAttributeValue(key, dataValue);

        if (parsedValue !== null) {
          dataConfig[key] = parsedValue;
        }
      }
    });

    return dataConfig;
  }

  onClickPrevBtn = () => {
    const activeItem = this.listElement.querySelector(this.elementSelectorsMap.activeItem);
    const prevItem = this.listElement.querySelector(this.elementSelectorsMap.prevItem);
    const nextItem = this.listElement.querySelector(this.elementSelectorsMap.nextItem);

    const newActiveItem = prevItem;
    const newPrevItem = prevItem.previousElementSibling;
    const newNextItem = activeItem;

    this.listElement.insertBefore(prevItem, activeItem);

    // this.prevItem.style.marginLeft = `-${this.itemWidthPercent}%`;
    // setTimeout(() => {
    //   this.prevItem.style.marginLeft = null;
    // }, 1);

    activeItem.removeAttribute(this.dataAttributesMap.activeItem);
    prevItem.removeAttribute(this.dataAttributesMap.prevItem);
    nextItem.removeAttribute(this.dataAttributesMap.nextItem);

    newActiveItem.setAttribute(this.dataAttributesMap.activeItem, "");
    newPrevItem.setAttribute(this.dataAttributesMap.prevItem, "");
    newNextItem.setAttribute(this.dataAttributesMap.nextItem, "");
  };
  onClickNextBtn = () => {
    const activeItem = this.listElement.querySelector(this.elementSelectorsMap.activeItem);
    const prevItem = this.listElement.querySelector(this.elementSelectorsMap.prevItem);
    const nextItem = this.listElement.querySelector(this.elementSelectorsMap.nextItem);

    const newActiveItem = nextItem;
    const newPrevItem = activeItem;
    const newNextItem = nextItem.nextElementSibling;

    this.listElement.appendChild(activeItem);

    // this.prevItem.style.marginLeft = `-${this.itemWidthPercent}%`;
    // setTimeout(() => {
    //   this.prevItem.style.marginLeft = null;
    // }, 1);

    activeItem.removeAttribute(this.dataAttributesMap.activeItem);
    prevItem.removeAttribute(this.dataAttributesMap.prevItem);
    nextItem.removeAttribute(this.dataAttributesMap.nextItem);

    newActiveItem.setAttribute(this.dataAttributesMap.activeItem, "");
    newPrevItem.setAttribute(this.dataAttributesMap.prevItem, "");
    newNextItem.setAttribute(this.dataAttributesMap.nextItem, "");
  };

  bindEvents() {
    if (this.prevBtn && this.nextBtn) {
      this.prevBtn.addEventListener("click", this.onClickPrevBtn);
      this.nextBtn.addEventListener("click", this.onClickNextBtn);
    }
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

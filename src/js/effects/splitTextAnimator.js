import { toKebabCase } from "js/helpers";
import { createObserver, traverseTextNodes } from "js/utils";

const defaultSettings = {
  selector: "split-text",
  splitType: "word",
  delay: 500,
  duration: 600,
  transitionTimingFunction: "ease-out",
};

const onEnter = (element) => {
  element.classList.add("visible");
};

const onLeave = (element) => {
  element.classList.remove("visible");
};

const observer = createObserver(onEnter, onLeave, { rootMargin: "-20% 0% -10% 0%" });

const processText = (textEl, config) => {
  const text = textEl.textContent.trim();
  const separator = config.splitType === "letter" ? "" : " ";

  if (text.length) {
    const textWrapper = document.createElement("span");
    textWrapper.classList.add(config.selector);
    textWrapper.style.cssText = `--${config.selector}-duration: ${config.duration}ms; --${config.selector}-timing-func: ${config.transitionTimingFunction};`;

    text.split(separator).forEach((textItem, itemIndex, itemsArr) => {
      if (textItem.trim().length) {
        const itemDelay = (config.delay / itemsArr.length) * itemIndex;

        const itemWrapper = document.createElement("span");
        itemWrapper.classList.add(`${config.selector}__item`);
        itemWrapper.style.setProperty(`--${config.selector}-delay`, `${itemDelay}ms`);
        itemWrapper.textContent = textItem;

        observer.observe(itemWrapper);

        textWrapper.appendChild(itemWrapper);
      }

      const isNotLastItem = separator === " " && itemIndex < itemsArr.length - 1;
      const isEmptyItem = !textItem.trim().length;

      if (isNotLastItem || isEmptyItem) {
        const spaceWrapper = document.createElement("span");
        spaceWrapper.textContent = " ";
        spaceWrapper.classList.add(`${config.selector}__space`);

        textWrapper.appendChild(spaceWrapper);
      }
    });

    textEl.parentNode.replaceChild(textWrapper, textEl);
  }
};

const getDataConfig = (element, config) => {
  const elementConfig = { ...config };

  const splitType = element.getAttribute(`data-${config.selector}`);

  if (splitType) {
    if (!["word", "letter"].includes(splitType)) {
      console.warn(`Invalid splitType: "${splitType}". Allowed values are "word" or "letter".`);
    } else {
      elementConfig.splitType = splitType;
    }
  }

  for (const attribute in config) {
    const dataValue = element.getAttribute(`data-${config.selector}-${toKebabCase(attribute)}`);

    if (!dataValue) continue;

    if (typeof config[attribute] === "number") {
      const numericValue = Number(dataValue);

      if (isNaN(numericValue)) {
        console.warn(`Attribute "${attribute}" should be a number.`);
        continue;
      }

      elementConfig[attribute] = numericValue;
    } else {
      elementConfig[attribute] = dataValue;
    }
  }

  return elementConfig;
};

export const splitTextAnimator = (initialSettings = {}) => {
  const config = { ...defaultSettings, ...initialSettings };

  const elements = document.querySelectorAll(`[data-${config.selector}]`);

  if (elements.length) {
    elements.forEach((el) => {
      const elConfig = getDataConfig(el, config);

      traverseTextNodes(el, processText, elConfig);
    });
  }
};

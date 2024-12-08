import { createObserver } from "js/utils";

const defaultSettings = {
  selector: "prlx",
  smooth: 8,
  coefficient: 15,
  duration: 100,
  position: "center",
};

const calculateOffset = (element, config) => {
  const topToWindow = element.getBoundingClientRect().top;
  const heightElement = element.offsetHeight;
  const heightWindow = window.innerHeight;

  const elementPosition = {
    top: topToWindow - heightWindow,
    bottom: topToWindow + heightElement,
  };

  if (elementPosition.top < 30 && elementPosition.bottom > -30) {
    switch (config.position) {
      case "top":
        return -1 * topToWindow;
      case "center":
        return heightWindow / 2 - (topToWindow + heightElement / 2);
      case "bottom":
        return heightWindow - (topToWindow + heightElement);
      default:
        return 0;
    }
  }
  return 0;
};

const calculateValue = (element, currentValue, config) => {
  const offset = calculateOffset(element, config);

  return currentValue + (offset - currentValue) / config.smooth;
};

const applyParallax = (elements, value, config) => {
  elements.forEach((element) => {
    const { coefficient } = getDataConfig(element, { coefficient: config.coefficient });

    element.style.transform = `translate3D(0, ${-1 * (value / coefficient).toFixed(2)}px,0)`;
  });
};

const getDataConfig = (element, config) => {
  const elementConfig = { ...config };

  for (const attribute in config) {
    const dataValue = element.getAttribute(`data-${config.selector}-${attribute}`);

    if (!dataValue) continue;

    if (typeof config[attribute] === "number") {
      const numericValue = Number(dataValue);

      if (isNaN(numericValue)) {
        console.warn(`Attribute "${attribute}" should be a number.`);
        continue;
      }

      elementConfig[attribute] = numericValue;
    } else {
      if (attribute === "position" && !["top", "center", "bottom"].includes(dataValue)) {
        console.warn(`Attribute "${attribute}" should be one of "top", "center", or "bottom".`);
        continue;
      }

      elementConfig[attribute] = dataValue;
    }
  }

  return elementConfig;
};

export const parallax = (initialSettings = {}) => {
  const config = { ...defaultSettings, ...initialSettings };

  const elements = [...document.querySelectorAll(`[data-${config.selector}-parent]`)];

  if (elements.length) {
    elements.forEach((parent) => {
      const parentConfig = getDataConfig(parent, config);

      const elements = parent.querySelectorAll(`[data-${config.selector}]`);

      let animationID;
      let value = 0;

      const animationFrame = () => {
        value = calculateValue(parent, value, parentConfig);

        applyParallax(elements, value, parentConfig);
        animationID = window.requestAnimationFrame(animationFrame);
      };

      const onEnter = (el) => {
        animationID = window.requestAnimationFrame(animationFrame);
      };

      const onLeave = (el) => {
        window.cancelAnimationFrame(animationID);
      };

      const observer = createObserver(onEnter, onLeave);
      observer.observe(parent);
    });
  }
};

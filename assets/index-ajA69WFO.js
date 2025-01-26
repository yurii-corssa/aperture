var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var _createDataAttributesMap, _createElementSelectorsMap, _parseAttributeValue, _applyStyles, _setupConfig, _validateSliderElements, _calculateVisibleSlides, _setupResizeObserver, _setupIntersectionObserver;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const defaultOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0
};
const createObserver = (onEnterCallback, onLeaveCallback, options = {}) => {
  const observerOptions = { ...defaultOptions, ...options };
  const observer2 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (onEnterCallback) {
          onEnterCallback(entry.target);
        }
      } else {
        if (onLeaveCallback) {
          onLeaveCallback(entry.target);
        }
      }
    });
  }, observerOptions);
  return observer2;
};
const traverseTextNodes = (node, callback, ...args) => {
  const queue = [node];
  while (queue.length) {
    const currentNode = queue.shift();
    if (currentNode.nodeType === Node.TEXT_NODE) {
      callback(currentNode, ...args);
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      queue.unshift(...currentNode.childNodes);
    }
  }
};
const toRem = (value, base = 16) => {
  if (typeof value !== "number" || typeof base !== "number") {
    console.warn("Both value and base must be numbers");
    return;
  }
  return Number((value / base).toFixed(4));
};
const onEnter$1 = (element) => {
  element.classList.add("animate");
};
const onLeave$1 = (element) => {
  element.classList.remove("animate");
};
const observer$1 = createObserver(onEnter$1, onLeave$1, { rootMargin: "-10% 0%", threshold: 0.9 });
const splitToChars = (wordText, startIndex = 0) => {
  let charsCount = startIndex;
  const newCharsArr = wordText.split("").map((char) => {
    const newCharElement = document.createElement("span");
    newCharElement.classList.add("fluid-text__char");
    newCharElement.dataset.fluidChar = char;
    newCharElement.style.setProperty("--char-index", charsCount);
    newCharElement.textContent = char;
    charsCount += 1;
    return newCharElement;
  });
  return { newCharsArr, charsCount };
};
const splitToWords = (text, startIndexWord = 0, startIndexChar = 0) => {
  let wordTotal = startIndexWord;
  let charTotal = startIndexChar;
  const newWordsArr = text.split(" ").filter((word) => word.length).flatMap((word, indexWord, wordsArr) => {
    const { newCharsArr, charsCount } = splitToChars(word, charTotal);
    charTotal += charsCount;
    const newWordElement = document.createElement("span");
    newWordElement.classList.add("fluid-text__word");
    newWordElement.dataset.fluidWord = word;
    newWordElement.style.setProperty("--word-index", wordTotal);
    newWordElement.append(...newCharsArr);
    const newSpaceElement = document.createElement("span");
    newSpaceElement.classList.add("fluid-text__whitespace");
    newSpaceElement.textContent = " ";
    wordTotal += 1;
    if (indexWord === wordsArr.length - 1) return newWordElement;
    else return [newWordElement, newSpaceElement];
  });
  return { newWordsArr, wordTotal, charTotal };
};
const processText$1 = (textEl) => {
  const text = textEl.textContent.trim();
  if (text.length) {
    const { newWordsArr, wordTotal, charTotal } = splitToWords(text);
    const newTextElement = document.createElement("span");
    newTextElement.classList.add("fluid-text__words");
    newTextElement.style.setProperty("--word-total", wordTotal);
    newTextElement.style.setProperty("--char-total", charTotal);
    newTextElement.append(...newWordsArr);
    textEl.parentNode.replaceChild(newTextElement, textEl);
  }
};
const fluidText = () => {
  const textBlocks = document.querySelectorAll("[data-fluid-text]");
  textBlocks.forEach((textBlock) => {
    const innerTextElements = [...textBlock.children];
    innerTextElements.forEach((textElement) => {
      traverseTextNodes(textElement, processText$1);
    });
    textBlock.classList.add("fluid-text");
    observer$1.observe(textBlock);
  });
};
const defaultSettings$1 = {
  selector: "prlx",
  smooth: 8,
  coefficient: 15,
  duration: 100,
  position: "center"
};
const calculateOffset = (element, config) => {
  const topToWindow = element.getBoundingClientRect().top;
  const heightElement = element.offsetHeight;
  const heightWindow = window.innerHeight;
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
};
const calculateValue = (element, currentValue, config) => {
  const offset = calculateOffset(element, config);
  return currentValue + (offset - currentValue) / config.smooth;
};
const applyParallax = (elements, value, config) => {
  elements.forEach((element) => {
    const { coefficient } = getDataConfig$1(element, { coefficient: config.coefficient });
    element.style.transform = `translate3D(0, ${-1 * (value / coefficient).toFixed(2)}px,0)`;
  });
};
const getDataConfig$1 = (element, config) => {
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
const parallax = (initialSettings = {}) => {
  const config = { ...defaultSettings$1, ...initialSettings };
  const elements = [...document.querySelectorAll(`[data-${config.selector}-parent]`)];
  if (elements.length) {
    elements.forEach((parent) => {
      const parentConfig = getDataConfig$1(parent, config);
      const elements2 = parent.querySelectorAll(`[data-${config.selector}]`);
      let animationID = null;
      let value = 0;
      value = calculateValue(parent, value, parentConfig);
      applyParallax(elements2, value, parentConfig);
      const animationFrame = () => {
        value = calculateValue(parent, value, parentConfig);
        applyParallax(elements2, value, parentConfig);
        animationID = window.requestAnimationFrame(animationFrame);
      };
      const onEnter2 = () => {
        animationFrame();
      };
      const onLeave2 = () => {
        window.cancelAnimationFrame(animationID);
      };
      const observer2 = createObserver(onEnter2, onLeave2, { rootMargin: "20% 0%" });
      observer2.observe(parent);
    });
  }
};
class Slider {
  constructor(sliderElement, sliderKey, initialConfig) {
    __publicField(this, "defaultConfig", {
      autoplay: false,
      interval: 3e3,
      slidesToShow: 1,
      listGap: 0,
      slideMinWidth: 128
    });
    __privateAdd(this, _createDataAttributesMap, () => {
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
        nextItem: createAttributeString("next-item")
      };
    });
    __privateAdd(this, _createElementSelectorsMap, () => {
      const createSelectorString = (selector) => `[data-${this.sliderKey}-${selector}]`;
      return {
        list: createSelectorString("list"),
        prevBtn: createSelectorString("prev-btn"),
        nextBtn: createSelectorString("next-btn"),
        activeItem: createSelectorString("active-item"),
        prevItem: createSelectorString("prev-item"),
        nextItem: createSelectorString("next-item")
      };
    });
    __privateAdd(this, _parseAttributeValue, (key, value) => {
      const parseBoolean = (value2) => {
        if (value2 === "true" || value2 === "false") {
          return value2 === "true";
        }
        console.warn(`Slider "${this.sliderKey}": invalid boolean value for "${key}": ${value2}`);
        return null;
      };
      const parseNumber = (value2) => {
        const numericValue = Number(value2);
        if (isNaN(numericValue)) {
          console.warn(`Value for ${key} is not a number: ${value2}`);
          return null;
        }
        if (numericValue < 1) {
          console.warn(`Slider "${this.sliderKey}": invalid number value for "${key}": ${value2}`);
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
    });
    __privateAdd(this, _applyStyles, () => {
      const { listGap, slidesToShow } = this.config;
      const totalSlides = this.itemElements.length;
      this.sliderElement.style.setProperty("--slider-list-gap", `${toRem(listGap)}rem`);
      this.sliderElement.style.setProperty("--slider-slides-to-show", slidesToShow);
      const disableButtons = totalSlides <= slidesToShow;
      if (this.prevBtn) this.prevBtn.disabled = disableButtons;
      if (this.nextBtn) this.nextBtn.disabled = disableButtons;
    });
    __privateAdd(this, _setupConfig, (initialConfig) => {
      const config = {
        ...this.defaultConfig,
        ...initialConfig
      };
      Object.entries(this.dataAttributesMap).filter(([_, attribute]) => this.sliderElement.hasAttribute(attribute)).forEach(([key, attribute]) => {
        const dataValue = this.sliderElement.getAttribute(attribute);
        const parsedValue = __privateGet(this, _parseAttributeValue).call(this, key, dataValue);
        config[key] = parsedValue;
      });
      const get = (target, prop) => {
        return target[prop];
      };
      const set = (target, prop, value) => {
        if (target[prop] === value) return true;
        target[prop] = value;
        __privateGet(this, _applyStyles).call(this);
        return true;
      };
      return new Proxy(config, { get, set });
    });
    __privateAdd(this, _validateSliderElements, () => {
      if (!this.listElement) {
        console.warn(`Slider "${this.sliderKey}": list element not found.`);
        return false;
      }
      if (!this.itemElements || !this.itemElements.length) {
        console.warn(`Slider "${this.sliderKey}": no items found in the list.`);
        return false;
      }
      if (this.itemElements.length < 2) {
        console.warn(`Slider "${this.sliderKey}": less than two items in the list.`);
        return false;
      }
      return true;
    });
    __privateAdd(this, _calculateVisibleSlides, () => {
      const { listGap, slideMinWidth } = this.config;
      const currentListWidth = this.listElement.offsetWidth;
      const totalSlides = this.itemElements.length;
      const slidesCount = Math.floor((currentListWidth + listGap) / (slideMinWidth + listGap));
      this.config.slidesToShow = Math.min(totalSlides, Math.max(1, slidesCount));
    });
    __privateAdd(this, _setupResizeObserver, () => {
      const resizeObserver = new ResizeObserver(__privateGet(this, _calculateVisibleSlides));
      resizeObserver.observe(this.listElement);
    });
    __privateAdd(this, _setupIntersectionObserver, () => {
      const onEnter2 = () => {
        if (this.prevBtn) this.prevBtn.addEventListener("click", this.moveToLeft);
        if (this.nextBtn) this.nextBtn.addEventListener("click", this.moveToRight);
        if (this.config.autoplay) this.startAutoplay();
      };
      const onLeave2 = () => {
        clearInterval(this.autoplayInterval);
        this.sliderElement.removeEventListener("mouseenter", this.stopAutoplay);
        this.sliderElement.removeEventListener("mouseleave", this.startAutoplay);
      };
      const observer2 = createObserver(onEnter2, onLeave2);
      observer2.observe(this.sliderElement);
    });
    __publicField(this, "moveToLeft", () => {
      const activeItem = this.activeItem;
      const prevItem = this.prevItem;
      const newPrevItem = prevItem.previousElementSibling;
      prevItem.classList.add("is-entering");
      this.listElement.insertBefore(prevItem, activeItem);
      requestAnimationFrame(() => prevItem.classList.remove("is-entering"));
      this.activeItem = prevItem;
      this.prevItem = newPrevItem;
      this.nextItem = activeItem;
    });
    __publicField(this, "moveToRight", () => {
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
    });
    __publicField(this, "stopAutoplay", () => {
      clearInterval(this.autoplayInterval);
      this.sliderElement.removeEventListener("mouseenter", this.stopAutoplay);
      this.sliderElement.addEventListener("mouseleave", this.startAutoplay);
    });
    __publicField(this, "startAutoplay", () => {
      const { interval } = this.config;
      this.autoplayInterval = setInterval(() => {
        this.moveToRight();
      }, interval);
      this.sliderElement.removeEventListener("mouseleave", this.startAutoplay);
      this.sliderElement.addEventListener("mouseenter", this.stopAutoplay);
    });
    var _a;
    this.sliderKey = sliderKey;
    this.dataAttributesMap = __privateGet(this, _createDataAttributesMap).call(this);
    this.elementSelectorsMap = __privateGet(this, _createElementSelectorsMap).call(this);
    this.sliderElement = sliderElement;
    this.listElement = this.sliderElement.querySelector(this.elementSelectorsMap.list);
    this.itemElements = (_a = this.listElement) == null ? void 0 : _a.children;
    this.prevBtn = this.sliderElement.querySelector(this.elementSelectorsMap.prevBtn);
    this.nextBtn = this.sliderElement.querySelector(this.elementSelectorsMap.nextBtn);
    if (!__privateGet(this, _validateSliderElements).call(this)) return;
    this.config = __privateGet(this, _setupConfig).call(this, initialConfig);
    this.activeItem = this.itemElements[0];
    this.prevItem = this.itemElements[this.itemElements.length - 1];
    this.nextItem = this.activeItem.nextElementSibling;
    __privateGet(this, _applyStyles).call(this);
    __privateGet(this, _setupIntersectionObserver).call(this);
    __privateGet(this, _setupResizeObserver).call(this);
  }
}
_createDataAttributesMap = new WeakMap();
_createElementSelectorsMap = new WeakMap();
_parseAttributeValue = new WeakMap();
_applyStyles = new WeakMap();
_setupConfig = new WeakMap();
_validateSliderElements = new WeakMap();
_calculateVisibleSlides = new WeakMap();
_setupResizeObserver = new WeakMap();
_setupIntersectionObserver = new WeakMap();
class SliderGroup {
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
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};
const throttle = (func, delay) => {
  let isThrottled = false;
  return (...args) => {
    if (isThrottled) return;
    func(...args);
    isThrottled = true;
    setTimeout(() => isThrottled = false, delay);
  };
};
const toKebabCase = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const onEnter = (element) => {
  element.classList.add("visible");
};
const onLeave = (element) => {
  element.classList.remove("visible");
};
const watcher = (options = {}) => {
  const elements = document.querySelectorAll("[data-watch]");
  const observer2 = createObserver(onEnter, onLeave, options);
  elements.forEach((element) => {
    observer2.observe(element);
  });
};
const defaultSettings = {
  selector: "split-text",
  splitType: "word",
  delay: 500,
  duration: 600,
  transitionTimingFunction: "ease-out"
};
const observer = createObserver(onEnter, onLeave, { rootMargin: "-10% 0%" });
const processText = (textEl, config) => {
  const text = textEl.textContent.trim();
  const separator = config.splitType === "letter" ? "" : " ";
  if (text.length) {
    const textWrapper = document.createElement("span");
    textWrapper.classList.add(config.selector);
    textWrapper.style.cssText = `--${config.selector}-duration: ${config.duration}ms; --${config.selector}-timing-func: ${config.transitionTimingFunction};`;
    text.split(separator).forEach((textItem, itemIndex, itemsArr) => {
      if (textItem.trim().length) {
        const itemDelay = config.delay / itemsArr.length * itemIndex;
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
const splitTextAnimator = (initialSettings = {}) => {
  const config = { ...defaultSettings, ...initialSettings };
  const elements = document.querySelectorAll(`[data-${config.selector}]`);
  if (elements.length) {
    elements.forEach((el) => {
      const elConfig = getDataConfig(el, config);
      traverseTextNodes(el, processText, elConfig);
    });
  }
};
const trackScrollPosition = (targetElement = document.documentElement, variableName = "--scroll-position") => {
  targetElement.style.setProperty(variableName, window.scrollY);
  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY;
    targetElement.style.setProperty(variableName, scrollPosition);
  });
};
const effects = {
  parallax,
  splitTextAnimator,
  fluidText,
  trackScrollPosition,
  watcher,
  SliderGroup
};
const burgerBtn = document.querySelector(".burger-btn-js");
const menu = document.querySelector(".menu-js");
const closeMenu = () => {
  menu.classList.remove("is-open");
  burgerBtn.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-hidden", "true");
  window.removeEventListener("click", handleClickOutside);
};
const openMenu = () => {
  menu.classList.add("is-open");
  burgerBtn.setAttribute("aria-expanded", "true");
  menu.setAttribute("aria-hidden", "false");
  window.addEventListener("click", handleClickOutside);
};
const handleMenu = () => {
  const isOpen = menu.classList.contains("is-open");
  if (isOpen) closeMenu();
  else openMenu();
};
const handleClickOutside = (e) => {
  if (!menu.contains(e.target) && !burgerBtn.contains(e.target)) {
    closeMenu();
  }
};
const menuInit = () => {
  if (!burgerBtn && !menu) return;
  if (!window.matchMedia("(width < 768px)").matches) {
    burgerBtn.removeEventListener("click", handleMenu);
    window.removeEventListener("click", handleClickOutside);
    closeMenu();
    return;
  }
  burgerBtn.addEventListener("click", handleMenu);
};
menuInit();
window.addEventListener("resize", debounce(menuInit, 200));
const visibilityThreshold = 100;
const header = document.querySelector("header");
let lastPosition = 0;
let isVisible = false;
const setHeaderVisibility = (shouldBeVisible) => {
  if (shouldBeVisible === isVisible) return;
  if (shouldBeVisible) {
    header.classList.remove("hidden");
  } else {
    header.classList.add("hidden");
    closeMenu();
  }
  isVisible = shouldBeVisible;
};
const trottledSetHeaderVisibility = throttle(setHeaderVisibility, 200);
const handleScroll = () => {
  const currentPosition = window.scrollY;
  if (currentPosition > visibilityThreshold && lastPosition) {
    trottledSetHeaderVisibility(currentPosition < lastPosition);
  } else if (!isVisible) {
    setHeaderVisibility(true);
  }
  lastPosition = currentPosition;
};
setHeaderVisibility(true);
window.addEventListener("scroll", handleScroll);
effects.parallax();
effects.watcher({ rootMargin: "-10% 0%" });
effects.splitTextAnimator({ selector: "blur-out-text" });
new effects.SliderGroup("logos-slider");

var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var _defaultConfig, _intersectionConfig, _createDataAttributesMap, _createElementSelectorsMap, _parseAttributeValue, _applyStyles, _setupConfig, _validateSliderElements, _calculateVisibleSlides, _setupNavigation, _onResize, _onTouchStart, _onTouchMove, _onTouchEnd, _onWheel, _enableInteractions, _disableInteractions, _onIntersect;
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
  watcher
};
class Header {
  constructor(initialConfig = {}) {
    __publicField(this, "menuTypes", {
      SLIDE: "slide",
      DROPDOWN: "dropdown"
    });
    __publicField(this, "menuPosition", {
      LEFT: "left",
      RIGHT: "right"
    });
    __publicField(this, "selectors", {
      HEADER: "[data-header]",
      MOBILE_MENU: "[data-mobile-menu]",
      BURGER_BUTTON: "[data-burger-menu-button]",
      BACKDROP: "[data-backdrop]"
    });
    __publicField(this, "classes", {
      IS_VISIBLE: "is-visible",
      IS_HIDDEN: "is-hidden",
      IS_OPEN: "is-open",
      NO_SCROLL: "no-scroll"
    });
    __publicField(this, "defaultConfig", {
      visibilityThreshold: 200,
      menuBreakpoint: 768,
      menuType: this.menuTypes.SLIDE,
      menuPosition: this.menuPosition.RIGHT
    });
    __publicField(this, "handleClickOutside", (e) => {
      if (!this.headerEl.contains(e.target) && !this.burgerButtonEl.contains(e.target)) {
        this.closeMenu();
      }
    });
    __publicField(this, "openMenu", () => {
      this.menuEl.classList.add(this.classes.IS_OPEN);
      this.backdropEl.classList.add(this.classes.IS_VISIBLE);
      document.body.classList.add(this.classes.NO_SCROLL);
      this.burgerButtonEl.setAttribute("aria-expanded", "true");
      this.menuEl.setAttribute("aria-hidden", "false");
      this.menuIsOpen = true;
      window.addEventListener("click", this.handleClickOutside);
    });
    __publicField(this, "closeMenu", () => {
      this.menuEl.classList.remove(this.classes.IS_OPEN);
      this.backdropEl.classList.remove(this.classes.IS_VISIBLE);
      document.body.classList.remove(this.classes.NO_SCROLL);
      this.burgerButtonEl.setAttribute("aria-expanded", "false");
      this.menuEl.setAttribute("aria-hidden", "true");
      this.menuIsOpen = false;
      window.removeEventListener("click", this.handleClickOutside);
    });
    __publicField(this, "toggleMenuOpen", () => {
      const menuShouldBeOpen = !this.menuIsOpen;
      if (menuShouldBeOpen) this.openMenu();
      else this.closeMenu();
    });
    __publicField(this, "handleMenuState", (shouldBeActive) => {
      const headerHeight = this.headerEl.offsetHeight;
      document.documentElement.style.setProperty("--header-height", `${toRem(headerHeight)}rem`);
      if (shouldBeActive) {
        this.burgerButtonEl.addEventListener("click", this.toggleMenuOpen);
        this.menuEl.classList.add(this.config.menuType);
        if (this.config.menuType === this.menuTypes.SLIDE) {
          this.menuEl.classList.add(this.config.menuPosition);
        }
      } else {
        this.burgerButtonEl.removeEventListener("click", this.toggleMenuOpen);
        delete this.menuEl.classList.remove(this.config.menuType);
        delete this.menuEl.classList.remove(this.config.menuPosition);
        if (this.menuIsOpen) this.closeMenu();
      }
    });
    __publicField(this, "toggleHeaderVisibility", (headerShouldBeHidden) => {
      if (headerShouldBeHidden === this.headerIsHidden) return;
      this.headerEl.classList.toggle(this.classes.IS_HIDDEN, headerShouldBeHidden);
      this.headerIsHidden = headerShouldBeHidden;
    });
    __publicField(this, "handleScroll", () => {
      const currentPosition = window.scrollY;
      const threshold = this.config.visibilityThreshold;
      const shouldBeHidden = currentPosition > threshold && currentPosition > this.lastPosition;
      this.toggleHeaderVisibility(shouldBeHidden);
      this.lastPosition = currentPosition;
    });
    __publicField(this, "init", () => {
      const mediaQuery = window.matchMedia(`(width < ${toRem(this.config.menuBreakpoint)}rem)`);
      this.handleMenuState(mediaQuery.matches);
      mediaQuery.addEventListener("change", (e) => this.handleMenuState(e.matches));
      window.addEventListener("scroll", this.handleScroll);
    });
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
}
class Slider {
  constructor(sliderElement, sliderKey, initialConfig) {
    __privateAdd(this, _defaultConfig, {
      autoplay: false,
      interval: 3e3,
      delay: 300,
      slidesToShow: 1,
      listGap: 0,
      slideMinWidth: 128
    });
    __privateAdd(this, _intersectionConfig, {
      root: null,
      rootMargin: "0%",
      threshold: 0
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
      switch (typeof __privateGet(this, _defaultConfig)[key]) {
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
      this.sliderElement.style.setProperty("--slider-list-gap", `${toRem(listGap)}rem`);
      this.sliderElement.style.setProperty("--slider-slides-to-show", slidesToShow);
    });
    __privateAdd(this, _setupConfig, (initialConfig) => {
      const config = {
        ...__privateGet(this, _defaultConfig),
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
        console.error(`Slider "${this.sliderKey}": list element not found.`);
        return false;
      }
      if (!this.itemElements || !this.itemElements.length) {
        console.warn(`Slider "${this.sliderKey}": no items found in the list.`);
        return false;
      }
      return true;
    });
    __privateAdd(this, _calculateVisibleSlides, () => {
      const { listGap, slideMinWidth } = this.config;
      const currentListWidth = this.listElement.offsetWidth;
      const slidesCount = Math.floor((currentListWidth + listGap) / (slideMinWidth + listGap));
      this.config.slidesToShow = Math.min(this.totalSlides, Math.max(1, slidesCount));
    });
    __privateAdd(this, _setupNavigation, () => {
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
    });
    __privateAdd(this, _onResize, () => {
      __privateGet(this, _calculateVisibleSlides).call(this);
      __privateGet(this, _setupNavigation).call(this);
    });
    __privateAdd(this, _onTouchStart, (e) => {
      if (this.navigationIsDisabled) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchTimeoutId = setTimeout(() => __privateGet(this, _onTouchEnd).call(this), 3e3);
      this.pauseAutoplay();
    });
    __privateAdd(this, _onTouchMove, (e) => {
      if (this.navigationIsDisabled) return;
      const swipeThreshold = 35;
      const touchDelta = e.changedTouches[0].clientX - this.touchStartX;
      if (Math.abs(touchDelta) < swipeThreshold) return;
      this.touchStartX = e.changedTouches[0].clientX;
      if (touchDelta > 0) this.moveToLeft();
      if (touchDelta < 0) this.moveToRight();
    });
    __privateAdd(this, _onTouchEnd, () => {
      if (this.navigationIsDisabled) return;
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
      this.touchStartX = null;
      this.startAutoplay();
    });
    __privateAdd(this, _onWheel, (e) => {
      if (this.navigationIsDisabled) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < 5) return;
      if (e.deltaY > 1) this.moveToRight();
      if (e.deltaY < -1) this.moveToLeft();
    });
    __privateAdd(this, _enableInteractions, () => {
      if (this.navBtnsExist) {
        this.prevBtnElement.addEventListener("click", this.moveToLeft);
        this.nextBtnElement.addEventListener("click", this.moveToRight);
      }
      if (this.isTouchDevice) {
        this.sliderElement.addEventListener("touchstart", __privateGet(this, _onTouchStart), { passive: true });
        this.sliderElement.addEventListener("touchmove", __privateGet(this, _onTouchMove), { passive: true });
        this.sliderElement.addEventListener("touchend", __privateGet(this, _onTouchEnd), { passive: true });
      }
      this.sliderElement.addEventListener("wheel", __privateGet(this, _onWheel), { passive: false });
      this.resizeObserver.observe(this.sliderElement);
    });
    __privateAdd(this, _disableInteractions, () => {
      if (this.navBtnsExist) {
        this.prevBtnElement.removeEventListener("click", this.moveToLeft);
        this.nextBtnElement.removeEventListener("click", this.moveToRight);
      }
      if (this.isTouchDevice) {
        this.sliderElement.removeEventListener("touchstart", __privateGet(this, _onTouchStart));
        this.sliderElement.removeEventListener("touchmove", __privateGet(this, _onTouchMove));
        this.sliderElement.removeEventListener("touchend", __privateGet(this, _onTouchEnd));
      }
      this.sliderElement.removeEventListener("wheel", __privateGet(this, _onWheel));
      this.stopAutoplay();
      this.resizeObserver.unobserve(this.sliderElement);
    });
    __privateAdd(this, _onIntersect, (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) __privateGet(this, _enableInteractions).call(this);
        else __privateGet(this, _disableInteractions).call(this);
      });
    });
    __publicField(this, "moveToLeft", throttle(() => {
      const activeItem = this.activeItem;
      const prevItem = this.prevItem;
      const newPrevItem = prevItem.previousElementSibling;
      prevItem.classList.add("is-entering");
      this.listElement.insertBefore(prevItem, activeItem);
      requestAnimationFrame(() => prevItem.classList.remove("is-entering"));
      this.activeItem = prevItem;
      this.prevItem = newPrevItem;
      this.nextItem = activeItem;
    }, 100));
    __publicField(this, "moveToRight", throttle(() => {
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
    }, 100));
    __publicField(this, "stopAutoplay", () => {
      if (this.autoplayDelayId || this.autoplayIntervalId) {
        clearTimeout(this.autoplayDelayId);
        clearInterval(this.autoplayIntervalId);
        this.autoplayDelayId = null;
        this.autoplayIntervalId = null;
        this.sliderElement.removeEventListener("mouseenter", this.pauseAutoplay);
        this.sliderElement.removeEventListener("mouseleave", this.startAutoplay);
      }
    });
    __publicField(this, "pauseAutoplay", () => {
      if (this.autoplayDelayId || this.autoplayIntervalId) {
        clearTimeout(this.autoplayDelayId);
        clearInterval(this.autoplayIntervalId);
        this.autoplayOnPause = true;
        this.autoplayDelayId = null;
        this.autoplayIntervalId = null;
        this.sliderElement.removeEventListener("mouseenter", this.pauseAutoplay);
        this.sliderElement.addEventListener("mouseleave", this.startAutoplay);
      }
    });
    __publicField(this, "startAutoplay", () => {
      const isNotRunning = !this.autoplayIntervalId && !this.autoplayDelayId;
      if (this.config.autoplay && !this.navigationIsDisabled && isNotRunning) {
        const { interval, delay } = this.config;
        const autoplayDelay = this.autoplayOnPause ? 0 : delay;
        this.autoplayDelayId = setTimeout(() => {
          if (!this.autoplayOnPause) this.moveToRight();
          this.autoplayIntervalId = setInterval(() => {
            this.moveToRight();
          }, interval);
          this.autoplayOnPause = false;
        }, autoplayDelay);
        this.sliderElement.removeEventListener("mouseleave", this.startAutoplay);
        this.sliderElement.addEventListener("mouseenter", this.pauseAutoplay);
      }
    });
    var _a;
    this.sliderKey = sliderKey;
    this.dataAttributesMap = __privateGet(this, _createDataAttributesMap).call(this);
    this.elementSelectorsMap = __privateGet(this, _createElementSelectorsMap).call(this);
    this.sliderElement = sliderElement;
    this.listElement = this.sliderElement.querySelector(this.elementSelectorsMap.list);
    this.itemElements = (_a = this.listElement) == null ? void 0 : _a.children;
    this.prevBtnElement = this.sliderElement.querySelector(this.elementSelectorsMap.prevBtn);
    this.nextBtnElement = this.sliderElement.querySelector(this.elementSelectorsMap.nextBtn);
    this.config = __privateGet(this, _setupConfig).call(this, initialConfig);
    if (!__privateGet(this, _validateSliderElements).call(this)) return;
    this.totalSlides = this.itemElements.length;
    this.activeItem = this.itemElements[0];
    this.prevItem = this.itemElements[this.totalSlides - 1];
    this.nextItem = this.activeItem.nextElementSibling;
    this.navBtnsExist = this.prevBtnElement && this.nextBtnElement;
    this.navigationIsDisabled = false;
    this.autoplayIntervalId = null;
    this.autoplayDelayId = null;
    this.autoplayOnPause = false;
    this.isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    this.resizeObserver = new ResizeObserver(__privateGet(this, _onResize));
    this.intersectObserver = new IntersectionObserver(__privateGet(this, _onIntersect), __privateGet(this, _intersectionConfig));
    this.intersectObserver.observe(this.sliderElement);
  }
}
_defaultConfig = new WeakMap();
_intersectionConfig = new WeakMap();
_createDataAttributesMap = new WeakMap();
_createElementSelectorsMap = new WeakMap();
_parseAttributeValue = new WeakMap();
_applyStyles = new WeakMap();
_setupConfig = new WeakMap();
_validateSliderElements = new WeakMap();
_calculateVisibleSlides = new WeakMap();
_setupNavigation = new WeakMap();
_onResize = new WeakMap();
_onTouchStart = new WeakMap();
_onTouchMove = new WeakMap();
_onTouchEnd = new WeakMap();
_onWheel = new WeakMap();
_enableInteractions = new WeakMap();
_disableInteractions = new WeakMap();
_onIntersect = new WeakMap();
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
effects.parallax();
effects.watcher({ rootMargin: "-10% 0%" });
effects.splitTextAnimator({ selector: "blur-out-text" });
new Header({ menuType: "dropdown", menuBreakpoint: 1024 });
new SliderGroup("logos-slider");

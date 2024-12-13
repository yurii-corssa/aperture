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
  const elementPosition = {
    top: topToWindow - heightWindow,
    bottom: topToWindow + heightElement
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
      let animationID;
      let value = 0;
      const animationFrame = () => {
        value = calculateValue(parent, value, parentConfig);
        applyParallax(elements2, value, parentConfig);
        animationID = window.requestAnimationFrame(animationFrame);
      };
      const onEnter2 = (el) => {
        animationID = window.requestAnimationFrame(animationFrame);
      };
      const onLeave2 = (el) => {
        window.cancelAnimationFrame(animationID);
      };
      const observer2 = createObserver(onEnter2, onLeave2);
      observer2.observe(parent);
    });
  }
};
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
const effects = { parallax, splitTextAnimator, fluidText, trackScrollPosition, watcher };
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
effects.watcher({ rootMargin: "-10% 0%" });
effects.splitTextAnimator({ selector: "blur-out-text" });

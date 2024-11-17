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
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};
const burgerBtn = document.querySelector(".burger-btn-js");
const menu = document.querySelector(".menu-js");
const toggleMenu = () => {
  if (!burgerBtn && !menu) return;
  const isOpen = menu.classList.toggle("is-open");
  burgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
};
const closeMenu = (e) => {
  if (!burgerBtn && !menu) return;
  if (!menu.contains(e.target) && !burgerBtn.contains(e.target)) {
    menu.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  }
};
const handleMenu = () => {
  if (!burgerBtn && !menu) return;
  burgerBtn.removeEventListener("click", toggleMenu);
  document.removeEventListener("click", closeMenu);
  if (window.matchMedia("(width < 768px)").matches) {
    burgerBtn.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    burgerBtn.addEventListener("click", toggleMenu);
    document.addEventListener("click", closeMenu);
  } else {
    menu.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "false");
  }
};
handleMenu();
window.addEventListener("resize", debounce(handleMenu, 200));
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
const processNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    if (text.length > 0) {
      const { newWordsArr, wordTotal, charTotal } = splitToWords(text);
      const newTextElement = document.createElement("span");
      newTextElement.classList.add("fluid-text__words");
      newTextElement.style.setProperty("--word-total", wordTotal);
      newTextElement.style.setProperty("--char-total", charTotal);
      newTextElement.append(...newWordsArr);
      node.parentNode.replaceChild(newTextElement, node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const childNodes = [...node.childNodes];
    childNodes.forEach((childNode) => processNode(childNode));
  }
};
const fluidText = () => {
  const textBlocks = document.querySelectorAll("[data-fluid-text]");
  textBlocks.forEach((textBlock) => {
    const innerTextElements = [...textBlock.children];
    innerTextElements.forEach((textElement) => {
      processNode(textElement);
    });
    textBlock.classList.add("fluid-text");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(
        (entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          } else {
            entry.target.classList.remove("animate");
          }
        },
        {
          threshold: 0.9
        }
      );
    });
    observer.observe(textBlock);
  });
};
const observeElements = () => {
  const elements = document.querySelectorAll("[data-watch]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    {
      // rootMargin: "-20% 0px -20% 0px",
    }
  );
  elements.forEach((element) => {
    observer.observe(element);
  });
};
const parallax = () => {
  const elements = [...document.querySelectorAll("[data-prlx-parent]")];
  if (elements.length) {
    elements.forEach((parent) => {
      const elements2 = parent.querySelectorAll("[data-prlx]");
      let animationID;
      let value = 0;
      const animationFrame = () => {
        const topToWindow = parent.getBoundingClientRect().top;
        const heightParent = parent.offsetHeight;
        const heightWindow = window.innerHeight;
        const positionParent = {
          top: topToWindow - heightWindow,
          bottom: topToWindow + heightParent
        };
        let offset = 0;
        const centerPoint = parent.dataset.prlxCenter || "center";
        const smooth = parent.dataset.prlxSmooth ? Number(parent.dataset.prlxSmooth) : 15;
        if (positionParent.top < 30 && positionParent.bottom > -30) {
          switch (centerPoint) {
            case "top":
              offset = -1 * topToWindow;
              break;
            case "center":
              offset = heightWindow / 2 - (topToWindow + heightParent / 2);
              break;
            case "bottom":
              offset = heightWindow - (topToWindow + heightParent);
              break;
          }
        }
        value += (offset - value) / smooth;
        animationID = window.requestAnimationFrame(animationFrame);
        elements2.forEach((element, index) => {
          const coefficient = element.dataset.coefficient ? Number(element.dataset.coefficient) : 5;
          element.style.transition = `all 0.1s ${(elements2.length + index) * 10 / coefficient}ms`;
          element.style.transform = `translate3D(0, ${-1 * (value / coefficient).toFixed(2)}px,0)`;
        });
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animationID = window.requestAnimationFrame(animationFrame);
          } else {
            window.cancelAnimationFrame(animationID);
          }
        });
      });
      observer.observe(parent);
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
const utils = { fluidText, trackScrollPosition, observeElements, parallax };
utils.fluidText();
utils.trackScrollPosition();
utils.observeElements();
utils.parallax();

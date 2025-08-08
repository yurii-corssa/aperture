import { throttle } from "js/helpers";
import { toRem } from "js/utils";

export class Slider {
  #defaultConfig = {
    autoplay: {
      enabled: false,
      interval: 0,
      delay: 0,
    },
    listGap: 0,
    slideMinWidth: 400,
    slidesToShow: "auto", // "auto" or a number
    moveDuration: 800,
    intersection: {
      root: null,
      rootMargin: "0%",
      threshold: 0,
    },
  };

  constructor(initialConfig) {
    this.config = {
      ...this.#defaultConfig,
      ...initialConfig,
    };
    this.selectors = {
      SLIDER: `[data-slider='${this.config.key}']`,
      LIST: "[data-slider-list]",
      ITEM: "[data-slider-item]",
      PREV_BUTTON: '[data-slider-btn="prev"]',
      NEXT_BUTTON: '[data-slider-btn="next"]',
      ACTIVE_ITEM: '[data-slider-item="active"]',
      PREV_ITEM: '[data-slider-item="prev"]',
      NEXT_ITEM: '[data-slider-item="next"]',
    };
    this.classes = {
      IS_ENTERING: "is-entering",
      IS_LEAVING: "is-leaving",
      IS_LEAVING_FAST: "is-leaving--fast",
      IS_ACTIVE: "is-active",
    };

    this.elements = {};
    this.elements.slider = document.querySelector(this.selectors.SLIDER);

    this.elements.list = this.elements.slider.querySelector(this.selectors.LIST);
    this.elements.items = [...this.elements.slider.querySelectorAll(this.selectors.ITEM)];
    this.elements.prevBtn = this.elements.slider.querySelector(this.selectors.PREV_BUTTON);
    this.elements.nextBtn = this.elements.slider.querySelector(this.selectors.NEXT_BUTTON);

    if (!this.#validateSliderElements()) return;

    this.elements.firstItem = this.elements.items[0];
    this.elements.lastItem = this.elements.items[this.elements.items.length - 1];
    this.elements.secondItem = this.elements.items[0]?.nextElementSibling;

    this.elements.firstItem.classList.add(this.classes.IS_ACTIVE);

    this.state = new Proxy(
      {
        totalSlides: this.elements.items.length,
        slidesToShow: 0,
        navBtnsExist: this.elements.prevBtn && this.elements.nextBtn,
        navigationIsDisabled: false,
        autoplayIntervalId: null,
        autoplayDelayId: null,
        autoplayOnPause: false,
        isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      },
      {
        get: (target, prop) => {
          return target[prop];
        },
        set: (target, prop, value) => {
          if (target[prop] === value) return true;
          target[prop] = value;
          this.#applyStyles();
          return true;
        },
      }
    );

    this.resizeObserver = new ResizeObserver(this.#onResize);
    this.intersectObserver = new IntersectionObserver(this.#onIntersect, this.config.intersection);
  }

  #applyStyles = () => {
    const { listGap, moveDuration } = this.config;
    const { slidesToShow } = this.state;
    const { slider } = this.elements;

    slider.style.setProperty("--slider-list-gap", `${toRem(listGap)}rem`);
    slider.style.setProperty("--slider-slides-to-show", slidesToShow);
    slider.style.setProperty("--move-duration", `${moveDuration}ms`);
  };

  #validateSliderElements = () => {
    const { list, items } = this.elements;

    if (!list) {
      console.error(`Slider "${this.config.key}": list element not found.`);
      return false;
    }
    if (!items || !items.length) {
      console.warn(`Slider "${this.config.key}": no items found in the list.`);
      return false;
    }

    return true;
  };

  #calculateVisibleSlides = () => {
    const { listGap, slideMinWidth, slidesToShow } = this.config;
    const { totalSlides } = this.state;
    const { list } = this.elements;

    if (slidesToShow === "auto") {
      const currentListWidth = list.offsetWidth;
      const slidesCount = Math.floor((currentListWidth + listGap) / (slideMinWidth + listGap));
      this.state.slidesToShow = Math.min(totalSlides, Math.max(1, slidesCount));
    } else {
      this.state.slidesToShow = Math.min(totalSlides, Number(slidesToShow));
    }
  };

  #setupNavigation = () => {
    const { totalSlides, slidesToShow, navigationIsDisabled, navBtnsExist } = this.state;
    const { prevBtn, nextBtn } = this.elements;

    const shouldDisableNavigation = totalSlides <= slidesToShow;
    const navigationStateChanged = shouldDisableNavigation !== navigationIsDisabled;

    this.state.navigationIsDisabled = shouldDisableNavigation;

    if (navigationStateChanged) {
      if (navBtnsExist) {
        prevBtn.disabled = shouldDisableNavigation;
        nextBtn.disabled = shouldDisableNavigation;
      }
    }

    if (shouldDisableNavigation) this.stopAutoplay();
    else this.startAutoplay();
  };

  #onResize = () => {
    this.#calculateVisibleSlides();
    this.#setupNavigation();
  };

  #onTouchStart = (e) => {
    if (this.state.navigationIsDisabled) return;

    this.state.touchStartX = e.touches[0].clientX;
    this.state.touchTimeoutId = setTimeout(() => this.#onTouchEnd(), 3000);

    this.pauseAutoplay();
  };

  #onTouchMove = (e) => {
    const { navigationIsDisabled, touchStartX } = this.state;

    if (navigationIsDisabled) return;

    const swipeThreshold = 35;
    const touchDelta = e.changedTouches[0].clientX - touchStartX;

    if (Math.abs(touchDelta) < swipeThreshold) return;

    this.state.touchStartX = e.changedTouches[0].clientX;

    if (touchDelta > 0) this.moveToLeft();
    if (touchDelta < 0) this.moveToRight();
  };

  #onTouchEnd = () => {
    const { navigationIsDisabled, touchTimeout } = this.state;

    if (navigationIsDisabled) return;

    clearTimeout(touchTimeout);
    this.state.touchTimeout = null;
    this.state.touchStartX = null;

    this.startAutoplay();
  };

  #enableInteractions = () => {
    const { navBtnsExist, isTouchDevice } = this.state;
    const { prevBtn, nextBtn, slider } = this.elements;

    if (navBtnsExist) {
      prevBtn.addEventListener("click", this.moveToLeft);
      nextBtn.addEventListener("click", this.moveToRight);
    }

    if (isTouchDevice) {
      slider.addEventListener("touchstart", this.#onTouchStart, { passive: true });
      slider.addEventListener("touchmove", this.#onTouchMove, { passive: true });
      slider.addEventListener("touchend", this.#onTouchEnd, { passive: true });
    }

    this.resizeObserver.observe(slider);
  };

  #disableInteractions = () => {
    const { navBtnsExist, isTouchDevice } = this.state;
    const { prevBtn, nextBtn, slider } = this.elements;

    if (navBtnsExist) {
      prevBtn.removeEventListener("click", this.moveToLeft);
      nextBtn.removeEventListener("click", this.moveToRight);
    }

    if (isTouchDevice) {
      slider.removeEventListener("touchstart", this.#onTouchStart);
      slider.removeEventListener("touchmove", this.#onTouchMove);
      slider.removeEventListener("touchend", this.#onTouchEnd);
    }

    this.stopAutoplay();
    this.resizeObserver.unobserve(slider);
  };

  #onIntersect = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) this.#enableInteractions();
      else this.#disableInteractions();
    });
  };

  moveToLeft = throttle(() => {
    const { firstItem, lastItem, list } = this.elements;
    const secondToLastItem = lastItem.previousElementSibling;

    firstItem.classList.remove(this.classes.IS_ACTIVE);
    lastItem.classList.add(this.classes.IS_ENTERING);
    list.insertBefore(lastItem, firstItem);

    requestAnimationFrame(() => {
      lastItem.classList.replace(this.classes.IS_ENTERING, this.classes.IS_ACTIVE);
    });

    this.elements.firstItem = lastItem;
    this.elements.lastItem = secondToLastItem;
    this.elements.secondItem = firstItem;
  }, 300);

  moveToRight = throttle(() => {
    const { firstItem, secondItem, lastItem, list } = this.elements;

    if (lastItem.classList.contains(this.classes.IS_LEAVING)) {
      lastItem.classList.add(this.classes.IS_LEAVING_FAST);
    }

    firstItem.classList.remove(this.classes.IS_ACTIVE);
    firstItem.classList.add(this.classes.IS_LEAVING);

    const onTransitionEnd = (e) => {
      if (e && e.propertyName !== "margin-left") return;

      list.appendChild(firstItem);

      firstItem.classList.remove(this.classes.IS_LEAVING, this.classes.IS_LEAVING_FAST);
      firstItem.removeEventListener("transitionend", onTransitionEnd);

      if (!secondItem.classList.contains(this.classes.IS_LEAVING)) {
        secondItem.classList.add(this.classes.IS_ACTIVE);
      }
    };

    firstItem.addEventListener("transitionend", onTransitionEnd);

    this.elements.firstItem = secondItem;
    this.elements.lastItem = firstItem;
    this.elements.secondItem = secondItem.nextElementSibling;
  }, 300);

  stopAutoplay = () => {
    const { autoplayDelayId, autoplayIntervalId } = this.state;
    const { slider } = this.elements;

    if (autoplayDelayId || autoplayIntervalId) {
      clearTimeout(autoplayDelayId);
      clearInterval(autoplayIntervalId);

      this.state.autoplayDelayId = null;
      this.state.autoplayIntervalId = null;

      slider.removeEventListener("mouseenter", this.pauseAutoplay);
      slider.removeEventListener("mouseleave", this.startAutoplay);
    }
  };

  pauseAutoplay = () => {
    const { autoplayDelayId, autoplayIntervalId } = this.state;
    const { slider } = this.elements;

    if (autoplayDelayId || autoplayIntervalId) {
      clearTimeout(autoplayDelayId);
      clearInterval(autoplayIntervalId);

      this.state.autoplayOnPause = true;
      this.state.autoplayDelayId = null;
      this.state.autoplayIntervalId = null;

      slider.removeEventListener("mouseenter", this.pauseAutoplay);
      slider.addEventListener("mouseleave", this.startAutoplay);
    }
  };

  startAutoplay = () => {
    const { enabled, interval, delay } = this.config.autoplay;
    const { slider } = this.elements;
    const { autoplayDelayId, autoplayIntervalId, navigationIsDisabled, autoplayOnPause } =
      this.state;

    const isNotRunning = !autoplayIntervalId && !autoplayDelayId;

    if (enabled && !navigationIsDisabled && isNotRunning) {
      const autoplayDelay = autoplayOnPause ? 0 : delay;

      this.state.autoplayDelayId = setTimeout(() => {
        if (!autoplayOnPause) this.moveToRight();

        this.state.autoplayIntervalId = setInterval(() => {
          this.moveToRight();
        }, interval);

        this.state.autoplayOnPause = false;
      }, autoplayDelay);

      slider.removeEventListener("mouseleave", this.startAutoplay);
      slider.addEventListener("mouseenter", this.pauseAutoplay);
    }
  };

  init() {
    this.intersectObserver.observe(this.elements.slider);
  }
  destroy() {
    this.intersectObserver.unobserve(this.elements.slider);
  }
}

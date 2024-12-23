import { throttle } from "./helpers";
import { closeMenu } from "./mobile-menu";

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

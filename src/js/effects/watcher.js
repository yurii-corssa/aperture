import { createObserver } from "js/utils";

export const onEnter = (element) => {
  element.classList.add("visible");
};

export const onLeave = (element) => {
  element.classList.remove("visible");
};

export const watcher = (options = {}) => {
  const elements = document.querySelectorAll("[data-watch]");

  const observer = createObserver(onEnter, onLeave, options);

  elements.forEach((element) => {
    observer.observe(element);
  });
};

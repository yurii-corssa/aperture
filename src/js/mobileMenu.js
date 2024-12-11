import { debounce } from "./helpers";

const burgerBtn = document.querySelector(".burger-btn-js");
const menu = document.querySelector(".menu-js");

export const closeMenu = () => {
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

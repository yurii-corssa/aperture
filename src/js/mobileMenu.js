import { debounce } from "./helpers/debounce";

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

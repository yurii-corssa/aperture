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
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
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
const main = "";
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
  if (!burgerBtn && !menu)
    return;
  const isOpen = menu.classList.toggle("is-open");
  burgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menu.setAttribute("aria-hidden", isOpen ? "false" : "true");
};
const closeMenu = (e) => {
  if (!burgerBtn && !menu)
    return;
  if (!menu.contains(e.target) && !burgerBtn.contains(e.target)) {
    menu.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  }
};
const handleMenu = () => {
  if (!burgerBtn && !menu)
    return;
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

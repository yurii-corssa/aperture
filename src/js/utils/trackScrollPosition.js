export const trackScrollPosition = (
  targetElement = document.documentElement,
  variableName = "--scroll-position"
) => {
  targetElement.style.setProperty(variableName, window.scrollY);
  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY;
    targetElement.style.setProperty(variableName, scrollPosition);
  });
};

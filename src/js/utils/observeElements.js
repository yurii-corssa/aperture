export const observeElements = () => {
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
      rootMargin: "-50% 0px -25% 0px",
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
};

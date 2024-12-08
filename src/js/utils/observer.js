const defaultOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0,
};

export const createObserver = (onEnterCallback, onLeaveCallback, options = {}) => {
  const observerOptions = { ...defaultOptions, ...options };

  const observer = new IntersectionObserver((entries) => {
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

  return observer;
};

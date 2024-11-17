export const parallax = () => {
  const elements = [...document.querySelectorAll("[data-prlx-parent]")];

  if (elements.length) {
    elements.forEach((parent) => {
      const elements = parent.querySelectorAll("[data-prlx]");

      let animationID;
      let value = 0;

      const animationFrame = () => {
        const topToWindow = parent.getBoundingClientRect().top;
        const heightParent = parent.offsetHeight;
        const heightWindow = window.innerHeight;

        const positionParent = {
          top: topToWindow - heightWindow,
          bottom: topToWindow + heightParent,
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

        elements.forEach((element, index) => {
          const coefficient = element.dataset.coefficient ? Number(element.dataset.coefficient) : 5;
          element.style.transition = `all 0.1s ${((elements.length + index) * 10) / coefficient}ms`;
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

export const headerConfig = {
  visibilityThreshold: 200,
  mobileMenu: {
    enabled: true,
    config: {
      type: "dropdown", // "dropdown" or "slide"
      // position: "right", // "left" or "right"
      breakpoint: 1024,
    },
  },
};

export const logosSliderConfig = {
  key: "logos",
  autoplay: {
    enabled: true,
    interval: 3000,
    delay: 300,
  },
  listGap: 109,
  slideMinWidth: 128,
};

export const gallerySliderConfig = {
  slidesToShow: 1,
};

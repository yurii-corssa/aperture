import "../scss/main.scss";
import { ContactModal } from "./ContactModal";
import effects from "./effects";
import { GalleryModal } from "./GalleryModal";
import { Header } from "./Header";
import { Newsletter } from "./Newsletter";
import { Slider } from "./Slider";
import { headerConfig, logosSliderConfig } from "./config.js";
import { GearModal } from "./GearModal";

effects.parallax();
effects.watcher({ rootMargin: "-10% 0%" });
effects.splitTextAnimator({ selector: "blur-out-text" });

const header = new Header(headerConfig);
const logosSlider = new Slider(logosSliderConfig);
const contactModal = new ContactModal();
const newsletter = new Newsletter();
const productPhotographyModal = new GalleryModal({ key: "product-gallery" });
const architecturePhotographyModal = new GalleryModal({ key: "architecture-gallery" });
const dronePhotographyModal = new GalleryModal({ key: "drone-gallery" });
const wildlifePhotographyModal = new GalleryModal({ key: "wildlife-gallery" });
const gearModal = new GearModal();

document.addEventListener("DOMContentLoaded", () => {
  header.init();
  contactModal.init();
  newsletter.init();
  logosSlider.init();
  productPhotographyModal.init();
  architecturePhotographyModal.init();
  dronePhotographyModal.init();
  wildlifePhotographyModal.init();
  gearModal.init();
});

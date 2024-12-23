import "../scss/main.scss";
import effects from "./effects";

import "./mobile-menu";
import "./header";

// effects.fluidText();

// effects.trackScrollPosition();

effects.parallax();

effects.watcher({ rootMargin: "-10% 0%" });

effects.splitTextAnimator({ selector: "blur-out-text" });

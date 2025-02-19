import "../scss/main.scss";
import effects from "./effects";
import { Header } from "./Header";
import { SliderGroup } from "./Slider";

effects.parallax();

effects.watcher({ rootMargin: "-10% 0%" });

effects.splitTextAnimator({ selector: "blur-out-text" });

// new Header({ menuType: "slide", menuPosition: "left", menuBreakpoint: 1024 });
// new Header({ menuType: "slide", menuPosition: "right", menuBreakpoint: 1024 });
new Header({ menuType: "dropdown", menuBreakpoint: 1024 });

new SliderGroup("logos-slider");

const isInteractiveElement = (element) => {
  const nonInteractiveTags = ["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"];
  return element.nodeType === Node.ELEMENT_NODE && !nonInteractiveTags.includes(element.tagName);
};

export const setInert = (element) => {
  element.setAttribute("inert", "");
};

export const removeInert = (element) => {
  element.removeAttribute("inert");
};

export const setInertOutside = (elementToExclude) => {
  const bodyChildren = [...document.body.children];

  bodyChildren.forEach((element) => {
    if (!isInteractiveElement(element)) return;
    if (element === elementToExclude || element.contains(elementToExclude)) return;
    setInert(element);
  });
};

export const removeAllInert = () => {
  const inertElements = document.querySelectorAll("[inert]");

  inertElements.forEach((element) => removeInert(element));
};

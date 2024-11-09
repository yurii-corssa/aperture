const splitToChars = (wordText, startIndex = 0) => {
  let charsCount = startIndex;

  const newCharsArr = wordText.split("").map((char) => {
    const newCharElement = document.createElement("span");
    newCharElement.classList.add("fluid-text__char");
    newCharElement.dataset.fluidChar = char;
    newCharElement.style.setProperty("--char-index", charsCount);
    newCharElement.textContent = char;

    charsCount += 1;

    return newCharElement;
  });

  return { newCharsArr, charsCount };
};

const splitToWords = (text, startIndexWord = 0, startIndexChar = 0) => {
  let wordTotal = startIndexWord;
  let charTotal = startIndexChar;

  const newWordsArr = text.split(" ").flatMap((word, indexWord, wordsArr) => {
    const { newCharsArr, charsCount } = splitToChars(word, charTotal);

    charTotal += charsCount;

    const newWordElement = document.createElement("span");
    newWordElement.classList.add("fluid-text__word");
    newWordElement.dataset.fluidWord = word;
    newWordElement.style.setProperty("--word-index", wordTotal);
    newWordElement.append(...newCharsArr);

    const newSpaceElement = document.createElement("span");
    newSpaceElement.classList.add("fluid-text__whitespace");
    newSpaceElement.textContent = " ";

    wordTotal += 1;

    if (indexWord === wordsArr.length - 1) return newWordElement;
    else return [newWordElement, newSpaceElement];
  });

  return { newWordsArr, wordTotal, charTotal };
};

const processNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();

    if (text.length > 0) {
      const { newWordsArr, wordTotal, charTotal } = splitToWords(text);

      const newTextElement = document.createElement("span");

      newTextElement.classList.add("fluid-text__words");
      newTextElement.style.setProperty("--word-total", wordTotal);
      newTextElement.style.setProperty("--char-total", charTotal);
      newTextElement.append(...newWordsArr);

      node.parentNode.replaceChild(newTextElement, node);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const childNodes = [...node.childNodes];
    childNodes.forEach((childNode) => processNode(childNode));
  }
};

export const fluidText = () => {
  const textBlocks = document.querySelectorAll("[data-fluid-text]");

  textBlocks.forEach((textBlock) => {
    const innerTextElements = [...textBlock.children];

    innerTextElements.forEach((textElement) => {
      processNode(textElement);
    });

    textBlock.classList.add("fluid-text");
  });
};

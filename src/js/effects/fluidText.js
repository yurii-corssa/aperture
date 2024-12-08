import { createObserver, traverseTextNodes } from "js/utils";

const onEnter = (element) => {
  element.classList.add("animate");
};

const onLeave = (element) => {
  element.classList.remove("animate");
};

const observer = createObserver(onEnter, onLeave, { rootMargin: "-10% 0%", threshold: 0.9 });

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

  const newWordsArr = text
    .split(" ")
    .filter((word) => word.length)
    .flatMap((word, indexWord, wordsArr) => {
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

const processText = (textEl) => {
  const text = textEl.textContent.trim();

  if (text.length) {
    const { newWordsArr, wordTotal, charTotal } = splitToWords(text);

    const newTextElement = document.createElement("span");

    newTextElement.classList.add("fluid-text__words");
    newTextElement.style.setProperty("--word-total", wordTotal);
    newTextElement.style.setProperty("--char-total", charTotal);
    newTextElement.append(...newWordsArr);

    textEl.parentNode.replaceChild(newTextElement, textEl);
  }
};

export const fluidText = () => {
  const textBlocks = document.querySelectorAll("[data-fluid-text]");

  textBlocks.forEach((textBlock) => {
    const innerTextElements = [...textBlock.children];

    innerTextElements.forEach((textElement) => {
      traverseTextNodes(textElement, processText);
    });

    textBlock.classList.add("fluid-text");

    observer.observe(textBlock);
  });
};

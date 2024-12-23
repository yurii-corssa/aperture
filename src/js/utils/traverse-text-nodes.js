export const traverseTextNodes = (node, callback, ...args) => {
  const queue = [node];

  while (queue.length) {
    const currentNode = queue.shift();

    if (currentNode.nodeType === Node.TEXT_NODE) {
      callback(currentNode, ...args);
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      queue.unshift(...currentNode.childNodes);
    }
  }
};

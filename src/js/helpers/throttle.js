export const throttle = (func, delay) => {
  let isThrottled = false;
  return (...args) => {
    if (isThrottled) return;
    func(...args);
    isThrottled = true;
    setTimeout(() => (isThrottled = false), delay);
  };
};

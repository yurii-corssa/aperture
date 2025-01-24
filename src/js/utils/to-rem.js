export const toRem = (value, base = 16) => {
  if (typeof value !== "number" || typeof base !== "number") {
    console.warn("Both value and base must be numbers");
    return;
  }
  return Number((value / base).toFixed(4));
};

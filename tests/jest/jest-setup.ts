import "@testing-library/jest-dom";

// jsdom does not implement scrollTo on elements; provide a no-op implementation.
if (typeof Element.prototype.scrollTo === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Element.prototype.scrollTo = function scrollToNoop() {};
}

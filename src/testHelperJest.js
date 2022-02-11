import "@testing-library/jest-dom/extend-expect";

const exposedProperties = ["window", "navigator", "document"];

global.window = window;
global.document = window.document;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === "undefined") {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global["navigator"] = {
  userAgent: "node.js",
};

export {};

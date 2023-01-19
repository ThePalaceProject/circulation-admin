import { JSDOM } from "jsdom";
import { configure } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

// Set up the DOM and global variables for tests.
// Point the url to localhost for localstorage.
const jsdom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
});
const { window } = jsdom;

global["jsdom"] = jsdom;
global["document"] = window.document;
global["window"] = window;
global["HTMLElement"] = window.HTMLElement;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

// Ignore imported stylesheets and images.
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
require.extensions[".scss"] = noop;
require.extensions[".svg"] = noop;

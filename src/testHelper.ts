import { jsdom } from "jsdom";
import { configure } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

/** Set up the DOM and global variables for tests. */
const doc = jsdom("<!doctype html><html><body></body></html>");
const win = doc.defaultView;

global["document"] = doc;
global["window"] = win;
global["HTMLElement"] = win.HTMLElement;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

// Ignore imported stylesheets.
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
require.extensions[".scss"] = noop;

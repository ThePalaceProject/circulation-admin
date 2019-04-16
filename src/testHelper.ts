import { jsdom } from "jsdom";
import {} from "chai";
import {} from "mocha";
import {} from "node";
/** Set up the DOM and global variables for tests. */
const doc = jsdom("<!doctype html><html><body></body></html>");
const win = doc.defaultView;

global["document"] = doc;
global["window"] = win;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

// Ignore imported stylesheets.
let noop = () => {};
require.extensions[".scss"] = noop;

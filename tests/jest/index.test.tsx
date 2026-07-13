import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router } from "react-router";

import SetupPage from "../../src/components/SetupPage";

// index.tsx does `export = CirculationAdmin`.
const CirculationAdmin = require("../../src/index");

/** Walk a React element tree for an element of the given type — the structural
 *  analog of enzyme's `wrapper.find(Type)`, used where the tree is the app root
 *  and there is no rendered DOM to query against. */
function containsType(node: any, type: React.ElementType): boolean {
  if (!node || typeof node !== "object") return false;
  if (Array.isArray(node)) return node.some((n) => containsType(n, type));
  if (node.type === type) return true;
  return containsType(node.props && node.props.children, type);
}

describe("CirculationAdmin", () => {
  let renderSpy: jest.SpyInstance;

  beforeEach(() => {
    // Capture what the bootstrap hands to ReactDOM.render without letting it
    // paint into the jsdom document. We assert on the captured element tree
    // (the structural analog of the original enzyme `wrapper.find(...)`); what
    // SetupPage and the routed pages render is covered by their own tests.
    renderSpy = jest
      .spyOn(ReactDOM, "render")
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the setup page when setting up", () => {
    new CirculationAdmin({ settingUp: true, csrfToken: "token" });

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(containsType(renderSpy.mock.calls[0][0], SetupPage)).toBe(true);
  });

  it("renders the router otherwise", () => {
    new CirculationAdmin({ csrfToken: "token" });

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(containsType(renderSpy.mock.calls[0][0], Router)).toBe(true);
  });
});

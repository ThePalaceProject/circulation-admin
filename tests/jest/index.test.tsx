import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter } from "react-router";

import SetupPage from "../../src/components/SetupPage";
import AppRoutes from "../../src/components/AppRoutes";
import LegacyRouterBridge from "../../src/components/LegacyRouterBridge";

// index.tsx does `export = CirculationAdmin`.
const CirculationAdmin = require("../../src/index");

/** Walk a React element tree for an element of the given type — the structural
 *  analog of enzyme's `wrapper.find(Type)`, used where the tree is the app root
 *  and there is no rendered DOM to query against. */
function containsType(node: any, type: React.ElementType): boolean {
  return findType(node, type) !== undefined;
}

/** Find the first element of the given type in a React element tree. */
function findType(node: any, type: React.ElementType): any {
  if (!node || typeof node !== "object") return undefined;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findType(child, type);
      if (found) return found;
    }
    return undefined;
  }
  if (node.type === type) return node;
  return findType(node.props && node.props.children, type);
}

describe("CirculationAdmin", () => {
  let renderSpy: jest.Mock;

  beforeEach(() => {
    // Capture what the bootstrap hands to the root's `render` without letting it
    // paint into the jsdom document. We assert on the captured element tree
    // (the structural analog of the original enzyme `wrapper.find(...)`); what
    // SetupPage and the routed pages render is covered by their own tests.
    renderSpy = jest.fn();
    jest
      .spyOn(ReactDOMClient, "createRoot")
      .mockReturnValue({ render: renderSpy, unmount: jest.fn() });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the setup page when setting up", () => {
    new CirculationAdmin({ settingUp: true, csrfToken: "token" });

    expect(ReactDOMClient.createRoot).toHaveBeenCalledWith(
      document.getElementById("opds-catalog")
    );
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(containsType(renderSpy.mock.calls[0][0], SetupPage)).toBe(true);
  });

  it("renders the router otherwise", () => {
    new CirculationAdmin({ csrfToken: "token" });

    expect(renderSpy).toHaveBeenCalledTimes(1);
    const router = findType(renderSpy.mock.calls[0][0], BrowserRouter);
    expect(router).toBeDefined();
    // Navigation updates at once, as react-router v3 did, not in a transition.
    expect(router.props.useTransitions).toBe(false);
    // The legacy `router` context and the routes are inside the router.
    const bridge = findType(router.props.children, LegacyRouterBridge);
    expect(bridge).toBeDefined();
    expect(containsType(bridge.props.children, AppRoutes)).toBe(true);
  });
});

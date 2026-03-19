/**
 * Helper: recursively search a React element tree for a component of a given type.
 */
function findInTree(element: any, targetType: any): boolean {
  if (!element || typeof element !== "object") return false;
  if (element.type === targetType) return true;

  const children = element.props?.children;
  if (!children) return false;

  if (Array.isArray(children)) {
    return children.some((child) => findInTree(child, targetType));
  }
  return findInTree(children, targetType);
}

import * as ReactDOM from "react-dom";
import SetupPage from "../../src/components/layout/SetupPage";
import { BrowserRouter } from "react-router-dom";

// Use jest.mock for react-dom so we can spy on render without triggering the DOM
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  render: jest.fn(),
}));

// Require index AFTER the mock is set up
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CirculationAdmin = require("../../src/index");

describe("CirculationAdmin", () => {
  const mockRender = ReactDOM.render as jest.Mock;

  afterEach(() => {
    mockRender.mockClear();
  });

  it("renders Setup page when settingUp is true", () => {
    new CirculationAdmin({ settingUp: true });

    expect(mockRender).toHaveBeenCalledTimes(1);

    const component = mockRender.mock.calls[0][0];
    expect(findInTree(component, SetupPage)).toBe(true);
  });

  it("renders BrowserRouter when not setting up", () => {
    new CirculationAdmin({});

    expect(mockRender).toHaveBeenCalledTimes(1);

    const component = mockRender.mock.calls[0][0];
    expect(findInTree(component, BrowserRouter)).toBe(true);
  });
});

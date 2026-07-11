import * as React from "react";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import * as fetchMock from "fetch-mock-jest";

import { renderWithProviders } from "../testUtils/withProviders";

// Header and Footer are page chrome; Header pulls in the react-router v3 context
// that renderWithProviders does not supply. Mock them to markers.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));
jest.mock("../../../src/components/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

// The real Lanes child (and its sidebar/editor) renders React Router `Link`s,
// which need router context renderWithProviders does not supply. Mock `Link` to
// a marker, matching Lane.test.tsx.
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props) => <div data-testid="Link">{props.children}</div>,
}));

import LanePage from "../../../src/components/LanePage";

describe("LanePage", () => {
  beforeAll(() => {
    Object.assign(fetchMock.config, { fetch, Headers, Request, Response });
  });

  beforeEach(() => {
    // Lanes fetches lanes and custom lists on mount; stub the network so no real
    // request is made.
    fetchMock.mock("*", { lanes: [], custom_lists: [] });
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it("shows lanes with info from params", async () => {
    const params = {
      library: "library",
      editOrCreate: "edit",
      identifier: "5",
    };

    const { container } = renderWithProviders(<LanePage params={params} />);

    // Header and Footer chrome are composed around the body.
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();

    // The real Lanes child renders its container...
    expect(container.querySelector("main.lanes-container")).toBeInTheDocument();
    // ...and, because editOrCreate is "edit", its lane editor panel.
    expect(container.querySelector(".lane-editor")).toBeInTheDocument();

    // While its on-mount fetches (lanes and custom lists) are in flight, Lanes
    // shows a loading indicator. Wait for it to clear so those fetches settle
    // and their state updates flush, instead of racing a fixed-length timer.
    await waitForElementToBeRemoved(() =>
      screen.queryByRole("dialog", { name: "Loading" })
    );
  });
});

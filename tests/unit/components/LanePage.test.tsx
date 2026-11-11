import * as React from "react";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../testUtils/withProviders";
import { setupMswServer } from "../testUtils/mswServer";

// Header and Footer are page chrome; Header reads the legacy `router` context
// and fetches on mount. Mock them to markers.
vi.mock("../../../src/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));
vi.mock("../../../src/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

// Render React Router's `Link` as a marker, so that the real Lanes child (and
// its sidebar and editor) can render without a router. To test real links,
// remove this mock and use the `route` option of `renderWithProviders`.
vi.mock("react-router", async () => ({
  ...(await vi.importActual<object>("react-router")),
  Link: (props) => <div data-testid="Link">{props.children}</div>,
}));

import LanePage from "../../../src/components/LanePage";

describe("LanePage", () => {
  // Lanes fetches lanes and custom lists on mount.
  setupMswServer(
    http.get("*/:library/admin/lanes", () => HttpResponse.json({ lanes: [] })),
    http.get("*/:library/admin/custom_lists", () =>
      HttpResponse.json({ custom_lists: [] })
    )
  );

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

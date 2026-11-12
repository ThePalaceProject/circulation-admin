import * as React from "react";
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../testUtils/withProviders";
import { setupMswServer } from "../testUtils/mswServer";
import * as navigate from "../../../src/utils/navigate";

// Header and Footer are page chrome; Header reads the legacy `router` context
// and fetches on mount. Mock them to markers.
// The Header marker shows the library that the page gives through the page
// context.
vi.mock("../../../src/components/Header", async () => {
  const { usePageLibrary } = await vi.importActual<
    typeof import("../../../src/context/pageContext")
  >("../../../src/context/pageContext");
  const HeaderMock = () => (
    <div data-testid="header" data-library={usePageLibrary()} />
  );
  return { default: HeaderMock };
});
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
  const { requests } = setupMswServer(
    http.get("*/:library/admin/lanes", () => HttpResponse.json({ lanes: [] })),
    http.get("*/:library/admin/custom_lists", () =>
      HttpResponse.json({ custom_lists: [] })
    ),
    http.post("*/:library/admin/lanes", () =>
      HttpResponse.text("77", { status: 201 })
    )
  );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows lanes with info from params", async () => {
    const params = {
      library: "library",
      editOrCreate: "edit",
      identifier: "5",
    };

    const { container } = renderWithProviders(<LanePage params={params} />);

    // Header and Footer chrome are composed around the body. The page gives
    // the header its library.
    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-library",
      "library"
    );
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

  it("sends the CSRF token from the app config when it saves a lane", async () => {
    // After a save, LaneEditor goes to the new lane's page, which jsdom cannot
    // do. The spy stops that and shows when the app has handled the response.
    const navigateTo = vi
      .spyOn(navigate, "navigateTo")
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    renderWithProviders(
      <LanePage params={{ library: "library", editOrCreate: "create" }} />,
      { appConfigSettings: { csrfToken: "token" } }
    );

    await user.type(
      await screen.findByRole("textbox", { name: /name for this lane/i }),
      "new lane"
    );
    await user.click(screen.getByRole("button", { name: /save lane/i }));

    await waitFor(() =>
      expect(navigateTo).toHaveBeenCalledWith(
        "/admin/web/lanes/library/edit/77"
      )
    );
    const posts = requests.filter((r) => r.method === "POST");
    expect(posts).toHaveLength(1);
    const post = posts[0];
    expect(post.headers.get("X-CSRF-Token")).toBe("token");
  });
});

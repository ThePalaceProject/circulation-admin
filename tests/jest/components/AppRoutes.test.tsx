import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, NavigateFunction, useNavigate } from "react-router";

import AppRoutes from "../../../src/components/AppRoutes";

// How many times each page mounted.
const mounts: Record<string, number> = {};

// Replace each page with a marker that shows which page rendered and the
// `params` and `location` props it got, and counts its mounts. This is a
// function declaration, not a `const`, because Jest runs the `jest.mock`
// calls first.
function mockPage(name: string) {
  const Page = ({ params, location }) => {
    React.useEffect(() => {
      mounts[name] = (mounts[name] ?? 0) + 1;
    }, []);
    return (
      <div data-testid="page">
        <span data-testid="name">{name}</span>
        <span data-testid="params">{JSON.stringify(params)}</span>
        <span data-testid="state">{JSON.stringify(location.state)}</span>
      </div>
    );
  };
  return { __esModule: true, default: Page };
}
jest.mock("../../../src/components/CatalogPage", () => mockPage("CatalogPage"));
jest.mock("../../../src/components/CustomListPage", () =>
  mockPage("CustomListPage")
);
jest.mock("../../../src/components/LanePage", () => mockPage("LanePage"));
jest.mock("../../../src/components/DashboardPage", () =>
  mockPage("DashboardPage")
);
jest.mock("../../../src/components/QuicksightDashboardPage", () =>
  mockPage("QuicksightDashboardPage")
);
jest.mock("../../../src/components/ConfigPage", () => mockPage("ConfigPage"));
jest.mock("../../../src/components/AccountPage", () => mockPage("AccountPage"));
jest.mock("../../../src/components/ManagePatrons", () =>
  mockPage("ManagePatrons")
);
jest.mock("../../../src/components/TroubleshootingPage", () =>
  mockPage("TroubleshootingPage")
);

// Hands the test a function to navigate with.
let navigate: NavigateFunction;
const Navigator = () => {
  navigate = useNavigate();
  return null;
};

const renderAt = (entry: string | { pathname: string; state: unknown }) =>
  render(
    <MemoryRouter initialEntries={[entry]} useTransitions={false}>
      <Navigator />
      <AppRoutes />
    </MemoryRouter>
  );

describe("AppRoutes", () => {
  // Restore spies even when a test fails before its last line.
  afterEach(() => jest.restoreAllMocks());

  // Each URL gives the same page and params that the react-router v3 routes
  // gave. Each param is decoded once, so an encoded "/" becomes "/" and an
  // encoded "%" stays encoded once. The one difference from v3 has its own
  // test below.
  it.each([
    ["/admin/web", "CatalogPage", {}],
    [
      "/admin/web/collection/nypl%2Fgroups%2F1",
      "CatalogPage",
      { collectionUrl: "nypl/groups/1" },
    ],
    [
      "/admin/web/collection/nypl%2Fgroups%2F1/book/nypl%2Fworks%2FAxis%2520360%2F42",
      "CatalogPage",
      { collectionUrl: "nypl/groups/1", bookUrl: "nypl/works/Axis%20360/42" },
    ],
    [
      "/admin/web/collection/nypl%2Fgroups%2F1/tab/details",
      "CatalogPage",
      { collectionUrl: "nypl/groups/1", tab: "details" },
    ],
    [
      "/admin/web/collection/nypl%2Fgroups%2F1/book/nypl%2Fworks%2F2/tab/history",
      "CatalogPage",
      {
        collectionUrl: "nypl/groups/1",
        bookUrl: "nypl/works/2",
        tab: "history",
      },
    ],
    [
      "/admin/web/book/nypl%2Fworks%2F2",
      "CatalogPage",
      { bookUrl: "nypl/works/2" },
    ],
    ["/admin/web/tab/details", "CatalogPage", { tab: "details" }],
    [
      "/admin/web/book/nypl%2Fworks%2F2/tab/classifications",
      "CatalogPage",
      { bookUrl: "nypl/works/2", tab: "classifications" },
    ],
    ["/admin/web/lists", "CustomListPage", {}],
    [
      "/admin/web/lists/nypl/edit/5",
      "CustomListPage",
      { library: "nypl", editOrCreate: "edit", identifier: "5" },
    ],
    ["/admin/web/lanes/nypl/", "LanePage", { library: "nypl" }],
    [
      "/admin/web/lanes/nypl/create",
      "LanePage",
      { library: "nypl", editOrCreate: "create" },
    ],
    ["/admin/web/dashboard", "DashboardPage", {}],
    ["/admin/web/dashboard/nypl", "DashboardPage", { library: "nypl" }],
    ["/admin/web/quicksight", "QuicksightDashboardPage", {}],
    ["/admin/web/config", "ConfigPage", {}],
    [
      "/admin/web/config/libraries/edit/3",
      "ConfigPage",
      { tab: "libraries", editOrCreate: "edit", identifier: "3" },
    ],
    ["/admin/web/account", "AccountPage", {}],
    ["/admin/web/patrons/nypl", "ManagePatrons", { library: "nypl" }],
    [
      "/admin/web/patrons/nypl/resetAdobeId",
      "ManagePatrons",
      { library: "nypl", tab: "resetAdobeId" },
    ],
    [
      "/admin/web/troubleshooting/diagnostics/opds",
      "TroubleshootingPage",
      { tab: "diagnostics", subtab: "opds" },
    ],
  ])("renders %s as %s", (url, page, params) => {
    renderAt(url);
    expect(screen.getByTestId("name")).toHaveTextContent(page);
    expect(JSON.parse(screen.getByTestId("params").textContent)).toEqual(
      params
    );
  });

  it("decodes an encoded slash inside a param twice, unlike v3", () => {
    // React Router 7 turns every "%2F" in a param into "/", even one that was
    // itself encoded ("%252F"). v3 gave "a/search/?q=AC%2FDC" here. A "/" in a
    // query string means the same to the server, so this does not change what
    // the catalog fetches.
    renderAt("/admin/web/collection/a%2Fsearch%2F%3Fq%3DAC%252FDC");
    expect(JSON.parse(screen.getByTestId("params").textContent)).toEqual({
      collectionUrl: "a/search/?q=AC/DC",
    });
  });

  it("keeps the catalog page mounted across its route forms", () => {
    // v3 had one route for every catalog URL, so the page stayed mounted as
    // the user moved from a collection to a book or a tab. A remount would
    // fetch its data again and lose its state.
    for (const name of Object.keys(mounts)) delete mounts[name];
    renderAt("/admin/web");
    for (const url of [
      "/admin/web/collection/c",
      "/admin/web/collection/c/book/b",
      "/admin/web/collection/c/book/b/tab/history",
      "/admin/web/book/b",
      "/admin/web/tab/details",
      "/admin/web",
    ]) {
      act(() => void navigate(url));
      expect(screen.getByTestId("name")).toHaveTextContent("CatalogPage");
    }
    expect(mounts).toEqual({ CatalogPage: 1 });

    // A different page does mount, as in v3.
    act(() => void navigate("/admin/web/config"));
    expect(mounts).toEqual({ CatalogPage: 1, ConfigPage: 1 });
  });

  it("passes the location state to the page", () => {
    renderAt({
      pathname: "/admin/web/lists/nypl/create",
      state: { bookTitle: "A Book" },
    });
    expect(screen.getByTestId("state")).toHaveTextContent(
      '{"bookTitle":"A Book"}'
    );
  });

  it("renders no page for an unknown path", () => {
    // React Router warns about a path that no route matches.
    jest.spyOn(console, "warn").mockImplementation(() => {});
    renderAt("/admin/web/patrons");
    expect(screen.queryByTestId("page")).not.toBeInTheDocument();
  });
});

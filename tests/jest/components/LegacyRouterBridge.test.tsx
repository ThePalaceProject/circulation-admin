import * as React from "react";
import * as PropTypes from "prop-types";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import PathForProvider from "@thepalaceproject/web-opds-client/lib/components/context/PathForContext";
import CatalogLink from "@thepalaceproject/web-opds-client/lib/components/CatalogLink";

import LegacyRouterBridge, {
  LegacyRouter,
} from "../../../src/components/LegacyRouterBridge";
import AppRoutes from "../../../src/components/AppRoutes";
import { renderWithProviders } from "../testUtils/withProviders";

// For the troubleshooting page test below: Header and Footer are page chrome,
// and each troubleshooting tab fetches on mount. The test is about the tab
// container's pushes, so mock them.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock("../../../src/components/Footer", () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock("../../../src/components/TroubleshootingCategoryPage", () => ({
  __esModule: true,
  default: () => <div />,
}));

const CurrentLocation = () => {
  const { pathname, search, state } = useLocation();
  return (
    <div data-testid="location">
      {`${pathname}${search} ${JSON.stringify(state)}`}
    </div>
  );
};

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(-1)}>
      Back
    </button>
  );
};

// Reads `router` from legacy context, as our class components do, and hands
// it to the test. Like Header, it also reads the current location while it
// renders.
let legacyRouter: LegacyRouter;
let pathSeenInRender: string;
class LegacyRouterReader extends React.Component<{ pushOnMount?: string }> {
  static contextTypes = { router: PropTypes.object.isRequired };
  context: { router: LegacyRouter };
  componentDidMount() {
    if (this.props.pushOnMount) {
      this.context.router.push(this.props.pushOnMount);
    }
  }
  render() {
    legacyRouter = this.context.router;
    pathSeenInRender = this.context.router.getCurrentLocation().pathname;
    return null;
  }
}

// Like the app, update on navigation at once instead of in a transition.
const renderBridge = (
  children?: React.ReactNode,
  history: string[] = ["/admin/web"],
  pushOnMount?: string
) =>
  render(
    <MemoryRouter
      initialEntries={history}
      initialIndex={history.length - 1}
      useTransitions={false}
    >
      <LegacyRouterBridge>
        <LegacyRouterReader pushOnMount={pushOnMount} />
        <CurrentLocation />
        <BackButton />
        {children}
      </LegacyRouterBridge>
    </MemoryRouter>
  );

describe("LegacyRouterBridge", () => {
  // React warns that the legacy context API is deprecated. That is expected
  // until nothing reads the legacy `router` context, so hide only those
  // warnings. Any other error, such as a failed context type check in the v3
  // `Link`, fails the test.
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    legacyRouter = undefined;
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    const unexpected = consoleError.mock.calls.filter(
      ([message]) =>
        !/uses the legacy (childContextTypes|contextTypes) API/.test(
          String(message)
        )
    );
    // Also restore any other spy, such as on `console.warn`, even if its test
    // failed before it restored the spy itself.
    jest.restoreAllMocks();
    expect(unexpected).toEqual([]);
  });

  it("navigates with `push` and a path", () => {
    renderBridge();
    act(() => legacyRouter.push("/admin/web/config/libraries"));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/admin/web/config/libraries"
    );
  });

  it("navigates with `push` and a location with state", () => {
    renderBridge();
    act(() =>
      legacyRouter.push({
        pathname: "/admin/web/lists/nypl/create",
        search: "?a=1",
        state: { bookTitle: "A Book" },
      })
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      '/admin/web/lists/nypl/create?a=1 {"bookTitle":"A Book"}'
    );
  });

  it("replaces the history entry when `push` goes to the current path", async () => {
    // As v3 did. Otherwise a click on the open tab adds an entry, and Back
    // then stays on the same page.
    const user = userEvent.setup();
    renderBridge(undefined, ["/admin/web/dashboard", "/admin/web/config"]);
    const before = legacyRouter.getCurrentLocation().key;
    act(() => legacyRouter.push("/admin/web/config"));
    // It did navigate: each navigation makes a location with a new key.
    expect(legacyRouter.getCurrentLocation().key).not.toBe(before);

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/admin/web/dashboard"
    );
  });

  it("does nothing on a push during the first mount, unlike v3", () => {
    // React Router 7 ignores the push from `componentDidMount`, and warns.
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    renderBridge(undefined, ["/admin/web"], "/admin/web/config");
    expect(screen.getByTestId("location")).toHaveTextContent("/admin/web null");
    expect(warn).toHaveBeenCalled();
  });

  it("adds a history entry when `push` goes to the current path with new state", async () => {
    // As v3 did: only the same path and the same state replace the entry.
    const user = userEvent.setup();
    renderBridge(undefined, ["/admin/web/dashboard", "/admin/web/config"]);
    act(() =>
      legacyRouter.push({
        pathname: "/admin/web/config",
        state: { bookTitle: "A Book" },
      })
    );
    expect(screen.getByTestId("location")).toHaveTextContent(
      '/admin/web/config {"bookTitle":"A Book"}'
    );

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/admin/web/config null"
    );
  });

  it("keeps one router object that reads the current location", () => {
    renderBridge();
    const router = legacyRouter;
    expect(router.getCurrentLocation().pathname).toBe("/admin/web");

    act(() => router.push("/admin/web/dashboard"));
    expect(legacyRouter).toBe(router);
    expect(router.getCurrentLocation().pathname).toBe("/admin/web/dashboard");
  });

  it("gives the new location to a component that reads it while it renders", () => {
    // Header calls `getCurrentLocation()` in `render`. If the bridge took the
    // location from an effect instead, Header would get the previous page.
    renderBridge();
    expect(pathSeenInRender).toBe("/admin/web");
    act(() => legacyRouter.push("/admin/web/dashboard"));
    expect(pathSeenInRender).toBe("/admin/web/dashboard");
  });

  it("makes paths into hrefs", () => {
    renderBridge();
    expect(legacyRouter.createHref("/admin/web/account")).toBe(
      "/admin/web/account"
    );
    expect(
      legacyRouter.createHref({
        pathname: "/admin/web/account",
        search: "?a=1",
        hash: "#top",
      })
    ).toBe("/admin/web/account?a=1#top");
  });

  it("drives web-opds-client's react-router v3 CatalogLink", async () => {
    const user = userEvent.setup();
    const pathFor = (collectionUrl: string) =>
      `/admin/web/collection/${encodeURIComponent(collectionUrl)}`;
    renderBridge(
      <PathForProvider pathFor={pathFor}>
        <CatalogLink collectionUrl="nypl/groups/1">Catalog</CatalogLink>
      </PathForProvider>
    );

    const link = screen.getByRole("link", { name: "Catalog" });
    expect(link).toHaveAttribute(
      "href",
      "/admin/web/collection/nypl%2Fgroups%2F1"
    );
    await user.click(link);
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/admin/web/collection/nypl%2Fgroups%2F1"
    );
  });

  it("works with the troubleshooting tabs, which also push during a render", async () => {
    // TroubleshootingTabContainer pushes when a tab is clicked, and again from
    // UNSAFE_componentWillReceiveProps when the page passes it the new tab.
    // By then the bridge has rendered the first push. v3 gave this history.
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <AppRoutes />
        <CurrentLocation />
        <BackButton />
      </>,
      { route: "/admin/web/troubleshooting/diagnostics/coverage_provider" }
    );

    await user.click(screen.getByRole("link", { name: "Self-tests" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/admin/web/troubleshooting/self-tests/collections"
    );
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/admin/web/troubleshooting/self-tests/coverage_provider"
    );
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/admin/web/troubleshooting/diagnostics/coverage_provider"
    );
  });
});

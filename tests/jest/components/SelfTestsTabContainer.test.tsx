import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import buildStore from "../../../src/store";

// Each active tab renders the connected SelfTestsCategory, which fetches on mount
// and recurses into the self-tests machinery. This container's behavior is which
// slice of the store each category gets and under what type/link name, so mock it
// to a marker echoing those. `data-items` names the slice's contents so passing
// the wrong category's items — or the whole items object — is visible.
jest.mock("../../../src/components/SelfTestsCategory", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="self-tests-category"
      data-type={props.type}
      data-link-name={props.linkName}
      data-items={
        Array.isArray(props.items)
          ? props.items.map((item: any) => item.name).join(",")
          : `not-an-array:${typeof props.items}`
      }
    />
  ),
}));

import { SelfTestsTabContainer } from "../../../src/components/SelfTestsTabContainer";

// SelfTestsTabContainer reads `router` and `pathFor` from legacy react-router
// context via static contextTypes (handleSelect calls router.push). Supply them
// through a tiny legacy-context provider.
class LegacyContextProvider extends React.Component<{
  router: { push: jest.Mock };
  pathFor: jest.Mock;
  children: React.ReactNode;
}> {
  static childContextTypes = {
    router: PropTypes.object,
    pathFor: PropTypes.func,
  };
  getChildContext() {
    return { router: this.props.router, pathFor: this.props.pathFor };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

describe("SelfTestsTabContainer", () => {
  let goToTab: jest.Mock;
  let fetchItems: jest.Mock;
  let router: { push: jest.Mock };
  let pathFor: jest.Mock;
  let store;

  const collections = [
    {
      id: 1,
      name: "collection 1",
      protocol: "protocol",
      self_test_results: {
        duration: 1.75,
        start: "2018-08-07T19:34:54Z",
        end: "2018-08-07T19:34:55Z",
        results: [
          {
            duration: 0.000119,
            end: "2018-08-07T19:34:54Z",
            exception: null,
            name: "Initial setup.",
            result: null,
            start: "2018-08-07T19:34:54Z",
            success: true,
          },
        ],
      },
    },
  ];

  beforeEach(() => {
    store = buildStore();
    goToTab = jest.fn();
    fetchItems = jest.fn();
    router = { push: jest.fn() };
    pathFor = jest.fn();
  });

  const element = (overrides = {}) => {
    const props = {
      store,
      goToTab,
      fetchItems,
      tab: "collections",
      items: { protocols: [], collections },
      ...overrides,
    };
    return (
      <LegacyContextProvider router={router} pathFor={pathFor}>
        <SelfTestsTabContainer {...props} />
      </LegacyContextProvider>
    );
  };

  const renderContainer = (overrides = {}) => render(element(overrides));

  it("renders a tab container", () => {
    const { container } = renderContainer();
    expect(container.firstChild).toHaveClass("tab-container");
  });

  it("renders tabs and defaults to showing the Collections tab", () => {
    const { container } = renderContainer();
    const tabs = container.querySelectorAll("ul.nav-tabs li");
    expect(tabs).toHaveLength(3);

    expect(tabs[0]).toHaveTextContent("Collections");
    expect(tabs[0]).toHaveClass("active");

    expect(tabs[1]).toHaveTextContent("Patron Authentication");
    expect(tabs[1]).not.toHaveClass("active");

    expect(tabs[2]).toHaveTextContent("Metadata Services");
    expect(tabs[2]).not.toHaveClass("active");
  });

  it("renders tab content", () => {
    const { container } = renderContainer();

    // Only the collections data is present, so its category renders; the other
    // two tabs fall back to a loading indicator.
    const markers = screen.getAllByTestId("self-tests-category");
    expect(markers).toHaveLength(1);
    expect(markers[0]).toHaveAttribute("data-type", "collection");
    expect(markers[0]).toHaveAttribute("data-link-name", "collections");
    expect(markers[0]).toHaveAttribute("data-items", "collection 1");

    expect(container.querySelectorAll(".loading")).toHaveLength(2);
  });

  it("calls fetchItems on mount", () => {
    renderContainer();
    expect(fetchItems).toHaveBeenCalled();
  });

  it("shows an error message", () => {
    const { container, rerender } = renderContainer();
    expect(container.querySelectorAll(".alert-danger")).toHaveLength(0);

    rerender(
      element({
        fetchError: { status: 401, response: "error fetching diagnostics" },
      })
    );

    expect(container.querySelectorAll(".alert-danger")).toHaveLength(3);
  });

  it("calls goToTab and pushes to the router when a tab is clicked", async () => {
    renderContainer();

    await userEvent.click(
      screen.getByRole("link", { name: "Patron Authentication" })
    );

    expect(goToTab).toHaveBeenCalledTimes(1);
    expect(goToTab).toHaveBeenCalledWith("patronAuthServices");
    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith(
        "/admin/web/troubleshooting/self-tests/patronAuthServices"
      )
    );
  });

  it("switches tabs when the tab prop changes", () => {
    const { container, rerender } = renderContainer();
    let tabs = container.querySelectorAll("ul.nav-tabs li");
    expect(tabs[0]).toHaveClass("active");
    expect(tabs[1]).not.toHaveClass("active");

    rerender(element({ tab: "patronAuthServices" }));

    tabs = container.querySelectorAll("ul.nav-tabs li");
    expect(tabs[0]).not.toHaveClass("active");
    expect(tabs[1]).toHaveClass("active");
  });

  it("derives the store key, type, and link name for each category", () => {
    // A category only renders once its store key holds items, so populate all
    // three with distinctly named items: the key each category is looked up
    // under is then observable in the items its marker receives.
    renderContainer({
      items: {
        collections: [{ id: 1, name: "a collection" }],
        patron_auth_services: [{ id: 2, name: "a patron auth service" }],
        metadata_services: [{ id: 3, name: "a metadata service" }],
      },
    });

    const markers = screen.getAllByTestId("self-tests-category");
    expect(markers).toHaveLength(3);

    expect(markers[0]).toHaveAttribute("data-type", "collection");
    expect(markers[0]).toHaveAttribute("data-link-name", "collections");
    expect(markers[0]).toHaveAttribute("data-items", "a collection");

    expect(markers[1]).toHaveAttribute("data-type", "patron_auth_service");
    expect(markers[1]).toHaveAttribute("data-link-name", "patronAuth");
    expect(markers[1]).toHaveAttribute("data-items", "a patron auth service");

    expect(markers[2]).toHaveAttribute("data-type", "metadata_service");
    expect(markers[2]).toHaveAttribute("data-link-name", "metadata");
    expect(markers[2]).toHaveAttribute("data-items", "a metadata service");
  });
});

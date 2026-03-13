import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen, fireEvent } from "@testing-library/react";

import buildStore from "../../../src/store";
import { SelfTestsTabContainer } from "../../../src/components/config/SelfTestsTabContainer";

// Mock SelfTestsCategory to avoid rendering the full self-tests tree.
jest.mock("../../../src/components/config/SelfTestsCategory", () => {
  return function SelfTestsCategoryMock(props: { type: string; items: any }) {
    return (
      <div
        data-testid="self-tests-category"
        data-type={props.type}
        data-item-count={props.items?.length ?? 0}
      />
    );
  };
});

// ─── Fixtures ──────────────────────────────────────────────────────────────────

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

// SelfTestsTabContainer reads `router` and `pathFor` from React legacy context.
function createLegacyWrapper(pushMock = jest.fn()) {
  const router = { push: pushMock };

  class LegacyCtxProvider extends React.Component<{
    children?: React.ReactNode;
  }> {
    getChildContext() {
      return { router, pathFor: jest.fn() };
    }
    static childContextTypes = {
      router: PropTypes.object,
      pathFor: PropTypes.func,
    };
    render() {
      return <>{this.props.children}</>;
    }
  }

  return { LegacyCtxProvider, pushMock };
}

function renderContainer(
  overrides: Partial<React.ComponentProps<typeof SelfTestsTabContainer>> = {},
  pushMock = jest.fn()
) {
  const store = buildStore();
  const { LegacyCtxProvider } = createLegacyWrapper(pushMock);
  const defaults = {
    store,
    goToTab: jest.fn(),
    fetchItems: jest.fn(),
    tab: "collections" as string,
    items: { collections, protocols: [] } as any,
    isLoaded: true,
  };

  return render(
    <LegacyCtxProvider>
      <SelfTestsTabContainer {...defaults} {...overrides} />
    </LegacyCtxProvider>
  );
}

describe("SelfTestsTabContainer", () => {
  // ─── Structure ───────────────────────────────────────────────────────────────

  it("renders .tab-container", () => {
    renderContainer();
    expect(document.querySelector(".tab-container")).toBeInTheDocument();
  });

  // ─── Tabs ─────────────────────────────────────────────────────────────────────

  it("renders three tabs: Collections, Patron Authentication, Metadata Services", () => {
    renderContainer();
    const tabLinks = screen.getAllByRole("link").map((a) => a.textContent);
    expect(tabLinks).toContain("Collections");
    expect(tabLinks).toContain("Patron Authentication");
    expect(tabLinks).toContain("Metadata Services");
  });

  it("marks the Collections tab as active by default", () => {
    renderContainer();
    const navItems = document
      .querySelector("ul.nav-tabs")
      .querySelectorAll("li");
    expect(navItems[0].className).toBe("active"); // Collections
    expect(navItems[1].className).toBe("");
    expect(navItems[2].className).toBe("");
  });

  it("marks Patron Authentication as active when tab='patronAuthServices'", () => {
    renderContainer({ tab: "patronAuthServices" });
    const navItems = document
      .querySelector("ul.nav-tabs")
      .querySelectorAll("li");
    expect(navItems[0].className).toBe("");
    expect(navItems[1].className).toBe("active");
  });

  // ─── Tab content ─────────────────────────────────────────────────────────────

  it("renders SelfTestsCategory for the collections tab when items are loaded", () => {
    renderContainer();
    expect(screen.getAllByTestId("self-tests-category").length).toBeGreaterThan(
      0
    );
  });

  it("renders LoadingIndicator when isLoaded=false and no fetchError", () => {
    renderContainer({ isLoaded: false, items: undefined });
    // LoadingIndicator renders with class "loading"
    expect(document.querySelector(".loading")).toBeInTheDocument();
  });

  it("renders error messages when fetchError is provided", () => {
    renderContainer({
      fetchError: { status: 401, response: "error fetching", url: "" },
      items: undefined,
    });
    // ErrorMessage renders Alert elements — at least one per visible tab
    expect(document.querySelectorAll(".alert").length).toBeGreaterThanOrEqual(
      1
    );
  });

  // ─── fetchItems on mount ──────────────────────────────────────────────────────

  it("calls fetchItems on mount", () => {
    const fetchItems = jest.fn();
    renderContainer({ fetchItems });
    expect(fetchItems).toHaveBeenCalledTimes(1);
  });

  // ─── Tab navigation ───────────────────────────────────────────────────────────

  it("calls goToTab when a tab link is clicked", () => {
    const goToTab = jest.fn();
    renderContainer({ goToTab });

    const patronAuthLink = screen
      .getAllByRole("link")
      .find((a) => a.textContent === "Patron Authentication");
    fireEvent.click(patronAuthLink);

    expect(goToTab).toHaveBeenCalledWith("patronAuthServices");
  });

  // ─── getNames ─────────────────────────────────────────────────────────────────

  it("getNames converts 'collections' to [keyName, typeName, linkName]", () => {
    const store = buildStore();
    const fetchItems = jest.fn();
    const goToTab = jest.fn();

    // Render and get access to the component instance via imperative ref
    let containerInstance: any;
    class Capture extends React.Component {
      render() {
        return (
          <SelfTestsTabContainer
            store={store}
            goToTab={goToTab}
            fetchItems={fetchItems}
            tab="collections"
            items={{ collections, protocols: [] } as any}
            isLoaded={true}
            ref={(r) => {
              containerInstance = r;
            }}
          />
        );
      }
    }

    const { LegacyCtxProvider } = createLegacyWrapper();
    render(
      <LegacyCtxProvider>
        <Capture />
      </LegacyCtxProvider>
    );

    expect(containerInstance.getNames("collections")).toEqual([
      "collections",
      "collection",
      "collections",
    ]);
    expect(containerInstance.getNames("patronAuthServices")).toEqual([
      "patron_auth_services",
      "patron_auth_service",
      "patronAuth",
    ]);
    expect(containerInstance.getNames("metadataServices")).toEqual([
      "metadata_services",
      "metadata_service",
      "metadata",
    ]);
  });
});

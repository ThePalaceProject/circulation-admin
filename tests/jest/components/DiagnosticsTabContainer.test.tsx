import * as React from "react";
import PropTypes from "prop-types";
import { render, fireEvent } from "@testing-library/react";
import buildStore from "../../../src/store";
import { DiagnosticsTabContainer } from "../../../src/components/diagnostics/DiagnosticsTabContainer";

// DiagnosticsTabContainer extends TabContainer which needs router context.
class RouterContextProvider extends React.Component<{
  children: React.ReactNode;
}> {
  static childContextTypes = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
  };
  getChildContext() {
    return {
      router: { push: jest.fn(), createHref: () => "test href" },
      pathFor: (collectionUrl: string, bookUrl: string) =>
        `${collectionUrl}::${bookUrl}`,
    };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

const ts1 = {
  service: "test_service",
  id: "1",
  start: "start_time_string",
  duration: "0",
  collection_name: "collection1",
};

const diagnostics = {
  monitor: [{ test_service_1: [{ collection1: [ts1] }] }],
};

function renderDiagnostics(props = {}) {
  const defaultProps = {
    goToTab: jest.fn(),
    tab: "coverage_provider",
    store: buildStore(),
    fetchDiagnostics: jest.fn(),
    diagnostics: { coverage_provider: [] },
    isLoaded: true,
  };
  return render(
    <RouterContextProvider>
      <DiagnosticsTabContainer {...defaultProps} {...props} />
    </RouterContextProvider>
  );
}

describe("DiagnosticsTabContainer", () => {
  describe("rendering", () => {
    it("renders a tab container", () => {
      const { container } = renderDiagnostics();
      expect(container.querySelector(".tab-container")).not.toBeNull();
    });

    it("renders tabs and defaults to showing the Coverage Providers tab", () => {
      const { container } = renderDiagnostics();
      const nav = container.querySelector(".nav-tabs");
      expect(nav).not.toBeNull();
      const tabs = nav.querySelectorAll("li");
      expect(tabs.length).toBe(4);

      const cpTab = tabs[0];
      expect(cpTab.textContent).toBe("Coverage Providers");
      expect(cpTab.classList.contains("active")).toBe(true);

      const monitorTab = tabs[1];
      expect(monitorTab.textContent).toBe("Monitors");
      expect(monitorTab.classList.contains("active")).toBe(false);

      const scriptTab = tabs[2];
      expect(scriptTab.textContent).toBe("Scripts");
      expect(scriptTab.classList.contains("active")).toBe(false);

      const otherTab = tabs[3];
      expect(otherTab.textContent).toBe("Other");
      expect(otherTab.classList.contains("active")).toBe(false);
    });

    it("renders tab content including DiagnosticsServiceType panels", () => {
      const { container } = renderDiagnostics({ diagnostics });
      // tab-content wraps all service type panels
      const tabContent = container.querySelector(".tab-content");
      expect(tabContent).not.toBeNull();
      // 4 service type divs with ids: coverage_provider, monitor, script, other
      const serviceTypes = ["coverage_provider", "monitor", "script", "other"];
      serviceTypes.forEach((id) => {
        expect(tabContent.querySelector(`#${id}`)).not.toBeNull();
      });
    });
  });

  describe("behavior", () => {
    it("calls fetchDiagnostics on mount", () => {
      const fetchDiagnostics = jest.fn();
      renderDiagnostics({ fetchDiagnostics });
      expect(fetchDiagnostics).toHaveBeenCalledTimes(1);
    });

    it("shows the loading indicator when isLoaded is false", () => {
      const { container } = renderDiagnostics({ isLoaded: false });
      // Tab nav still shows coverage provider labels
      expect(container.querySelector(".nav-tabs")).not.toBeNull();
      // Tab content should show Loading indicators (4 tabs → 4 loading indicators)
      const tabContent = container.querySelector(".tab-content");
      expect(tabContent.textContent).toContain("Loading");
    });

    it("shows an error message when fetchError is set", () => {
      const fetchError = {
        status: 403,
        response: "error fetching diagnostics",
        url: "/diagnostics",
      };
      const { container } = renderDiagnostics({ fetchError });
      // ErrorMessage renders one per tab pane — 4 tab panels
      const tabContent = container.querySelector(".tab-content");
      // Each tab pane should have an error message
      expect(tabContent.textContent).toContain("Error");
    });

    it("calls goToTab when a tab link is clicked", () => {
      const goToTab = jest.fn();
      const { container } = renderDiagnostics({ goToTab });
      const tabs = container.querySelectorAll(".nav-tabs a");
      const monitorTab = tabs[1];
      fireEvent.click(monitorTab);
      expect(goToTab).toHaveBeenCalledWith("monitor");
    });

    it("shows the active tab based on the tab prop", () => {
      const { container } = renderDiagnostics({ tab: "monitor" });
      const tabs = container.querySelectorAll(".nav-tabs li");
      expect(tabs[0].classList.contains("active")).toBe(false);
      expect(tabs[1].classList.contains("active")).toBe(true);
    });
  });
});

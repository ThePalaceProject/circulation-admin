import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import buildStore from "../../../src/store";

// The active tab renders DiagnosticsServiceType, which recurses into the service
// tab machinery. The legacy test only asserted the `type`/`services` props it
// received, so mock it to a marker that echoes those.
jest.mock("../../../src/components/DiagnosticsServiceType", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="service-type"
      data-type={props.type}
      data-has-services={String(props.services !== undefined)}
    />
  ),
}));

import { DiagnosticsTabContainer } from "../../../src/components/DiagnosticsTabContainer";

describe("DiagnosticsTabContainer", () => {
  let goToTab: jest.Mock;
  let fetchDiagnostics: jest.Mock;

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

  beforeEach(() => {
    goToTab = jest.fn();
    fetchDiagnostics = jest.fn();
  });

  const element = (overrides = {}) => {
    const props = {
      goToTab,
      tab: "coverage_provider",
      store: buildStore(),
      fetchDiagnostics,
      diagnostics: { coverage_provider: [] },
      isLoaded: true,
      ...overrides,
    };
    return <DiagnosticsTabContainer {...props} />;
  };

  const renderContainer = (overrides = {}) => render(element(overrides));

  describe("rendering", () => {
    it("renders a tab container", () => {
      const { container } = renderContainer();
      expect(container.firstChild).toHaveClass("tab-container");
    });

    it("renders tabs and defaults to showing the Coverage Providers tab", () => {
      const { container } = renderContainer();
      const tabs = container.querySelectorAll("ul.nav-tabs li");
      expect(tabs).toHaveLength(4);

      expect(tabs[0]).toHaveTextContent("Coverage Providers");
      expect(tabs[0]).toHaveClass("active");

      expect(tabs[1]).toHaveTextContent("Monitors");
      expect(tabs[1]).not.toHaveClass("active");

      expect(tabs[2]).toHaveTextContent("Scripts");
      expect(tabs[2]).not.toHaveClass("active");

      expect(tabs[3]).toHaveTextContent("Other");
      expect(tabs[3]).not.toHaveClass("active");
    });

    it("renders tab content", () => {
      renderContainer({ diagnostics });
      const serviceTypes = screen.getAllByTestId("service-type");
      expect(serviceTypes).toHaveLength(4);

      expect(serviceTypes[0]).toHaveAttribute("data-type", "coverage_provider");
      expect(serviceTypes[0]).toHaveAttribute("data-has-services", "false");

      expect(serviceTypes[1]).toHaveAttribute("data-type", "monitor");
      expect(serviceTypes[1]).toHaveAttribute("data-has-services", "true");

      expect(serviceTypes[2]).toHaveAttribute("data-type", "script");
      expect(serviceTypes[2]).toHaveAttribute("data-has-services", "false");

      expect(serviceTypes[3]).toHaveAttribute("data-type", "other");
      expect(serviceTypes[3]).toHaveAttribute("data-has-services", "false");
    });
  });

  describe("behavior", () => {
    it("calls fetchDiagnostics on mount", () => {
      renderContainer();
      expect(fetchDiagnostics).toHaveBeenCalled();
    });

    it("shows the loading indicator", () => {
      const { container, rerender } = renderContainer();
      expect(container.querySelectorAll(".loading")).toHaveLength(0);
      rerender(element({ isLoaded: false }));
      expect(container.querySelectorAll(".loading")).toHaveLength(4);
    });

    it("shows an error message", () => {
      const { container, rerender } = renderContainer();
      expect(container.querySelectorAll(".alert-danger")).toHaveLength(0);
      rerender(
        element({
          fetchError: { status: 401, response: "error fetching diagnostics" },
        })
      );
      expect(container.querySelectorAll(".alert-danger")).toHaveLength(4);
    });

    it("calls goToTab when a tab is clicked", async () => {
      const user = userEvent.setup();
      renderContainer({ diagnostics });
      await user.click(screen.getByRole("link", { name: "Monitors" }));
      expect(goToTab).toHaveBeenCalledTimes(1);
      expect(goToTab).toHaveBeenCalledWith("monitor");
    });

    it("switches tabs when the tab prop changes", () => {
      const { container, rerender } = renderContainer();
      let tabs = container.querySelectorAll("ul.nav-tabs li");
      expect(tabs[0]).toHaveClass("active");
      expect(tabs[1]).not.toHaveClass("active");

      rerender(element({ tab: "monitor" }));

      tabs = container.querySelectorAll("ul.nav-tabs li");
      expect(tabs[0]).not.toHaveClass("active");
      expect(tabs[1]).toHaveClass("active");
    });
  });
});

import * as React from "react";
import PropTypes from "prop-types";
import { render, screen, fireEvent } from "@testing-library/react";
import DiagnosticsServiceTabs from "../../../src/components/diagnostics/DiagnosticsServiceTabs";

// DiagnosticsServiceTabs extends TabContainer which needs router context.
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
  service: "test_service_1",
  id: "1",
  start: "start_time_string_1",
  duration: "0",
  collection_name: "collection1",
};
const ts2 = {
  service: "test_service_2",
  id: "2",
  start: "start_time_string_2",
  duration: "0",
  collection_name: "collection2",
  exception: "Stack trace",
};

const content = {
  test_service_1: { collection1: [ts1] },
  test_service_2: { collection2: [ts2] },
};

const renderTabs = (tab = "test_service_1", goToTab = jest.fn()) =>
  render(
    <RouterContextProvider>
      <DiagnosticsServiceTabs
        goToTab={goToTab}
        content={content as any}
        tab={tab}
      />
    </RouterContextProvider>
  );

describe("DiagnosticsServiceTabs", () => {
  describe("nav", () => {
    it("renders a tab for each service", () => {
      const { container } = renderTabs();
      const nav = container.querySelector(".nav-tabs");
      expect(nav).toBeInTheDocument();
      const tabs = nav.querySelectorAll("a");
      expect(tabs.length).toEqual(2);
      expect(tabs[0].textContent).toContain("Test_service_1");
      expect(tabs[1].textContent).toContain("Test_service_2");
    });

    it("displays a badge", () => {
      const { container } = renderTabs();
      const navTabs = container.querySelectorAll(".nav-tabs a");

      // First tab (no exception): shows count badge with tooltip
      const tabWithoutException = navTabs[0];
      expect(
        tabWithoutException.querySelector(".danger")
      ).not.toBeInTheDocument();
      const badge = tabWithoutException.querySelector(".badge");
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toEqual("1");
      const toolTip = tabWithoutException.querySelector(".tool-tip");
      expect(toolTip).toBeInTheDocument();
      expect(toolTip.textContent).toContain(
        "Total number of timestamps for this service"
      );

      // Second tab (has exception): shows danger badge, no tooltip
      const tabWithException = navTabs[1];
      const dangerBadge = tabWithException.querySelector(".badge.danger");
      expect(dangerBadge).toBeInTheDocument();
      expect(dangerBadge.textContent).toEqual("!");
      expect(
        tabWithException.querySelector(".tool-tip")
      ).not.toBeInTheDocument();
    });

    it("defaults to showing the first tab as active", () => {
      const { container } = renderTabs();
      const lis = container.querySelectorAll(".nav-tabs li");
      expect(lis[0].classList.contains("active")).toBe(true);
      expect(lis[1].classList.contains("active")).toBe(false);
    });
  });

  describe("content", () => {
    it("renders collections", () => {
      const { container } = renderTabs();
      const tabContent = container.querySelector(".tab-content");
      expect(tabContent).toBeInTheDocument();

      // collection1 has no exception — openByDefault should be false
      const panels = container.querySelectorAll(".panel");
      expect(panels.length).toBeGreaterThanOrEqual(1);

      // Check collection headers
      expect(screen.getByText("collection1")).toBeInTheDocument();
    });

    it("renders timestamps", () => {
      const { container } = renderTabs();
      // Both timestamps should render (Timestamp components show start/duration)
      const timestampHolders = container.querySelectorAll(".timestamp-holder");
      // We're on tab_service_1 which shows collection1 with ts1
      // collection2 is in the other tab panel but may still be in DOM
      expect(timestampHolders.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("behavior", () => {
    it("calls goToTab when a tab is clicked", () => {
      const goToTab = jest.fn();
      const { container } = renderTabs("test_service_1", goToTab);

      const tab2 = container.querySelectorAll(".nav-tabs li")[1];
      const anchor = tab2.querySelector("a");
      fireEvent.click(anchor, {
        preventDefault: () => undefined,
        currentTarget: { dataset: { tabkey: "test_service_2" } },
      });

      expect(goToTab).toHaveBeenCalledTimes(1);
      expect(goToTab).toHaveBeenCalledWith("test_service_2");
    });
  });
});

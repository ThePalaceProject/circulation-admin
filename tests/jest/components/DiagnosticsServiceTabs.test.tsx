import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DiagnosticsServiceTabs from "../../../src/components/DiagnosticsServiceTabs";

describe("DiagnosticsServiceTabs", () => {
  let goToTab: jest.Mock;

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

  const content: any = {
    test_service_1: { collection1: [ts1] },
    test_service_2: { collection2: [ts2] },
  };

  const renderTabs = () => {
    goToTab = jest.fn();
    return render(
      <DiagnosticsServiceTabs
        goToTab={goToTab}
        content={content}
        tab="test_service_1"
      />
    );
  };

  // Find the collapsible `.panel` whose header text matches `title`. The
  // collection panels are titled by collection name; the timestamp panels nested
  // inside them are titled by their start time.
  const panelByTitle = (container: HTMLElement, title: string) => {
    const titleEl = Array.from(container.querySelectorAll(".panel-title")).find(
      (el) => el.textContent === title
    );
    return titleEl ? titleEl.closest(".panel") : null;
  };

  describe("nav", () => {
    it("renders a tab for each service", () => {
      const { container } = renderTabs();
      expect(container.querySelectorAll("ul.nav-tabs")).toHaveLength(1);
      const tabs = container.querySelectorAll("ul.nav-tabs li a");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveTextContent("Test_service_1");
      expect(tabs[1]).toHaveTextContent("Test_service_2");
    });

    it("displays a badge", () => {
      const { container } = renderTabs();
      const tabs = container.querySelectorAll("ul.nav-tabs li");

      // The first service has no exception: a plain count badge with a tooltip.
      const tabWithoutException = tabs[0];
      expect(tabWithoutException.querySelector(".danger")).toBeNull();
      const badge = tabWithoutException.querySelector(".badge");
      expect(badge).toHaveTextContent("1");
      const toolTip = tabWithoutException.querySelector(".tool-tip");
      expect(toolTip).toHaveTextContent(
        "Total number of timestamps for this service"
      );

      // The second service contains a timestamp with an exception, so it shows a
      // danger badge (a warning) and no tooltip.
      const tabWithException = tabs[1];
      const dangerBadge = tabWithException.querySelector(".badge.danger");
      expect(dangerBadge).toHaveTextContent("!");
      expect(tabWithException.querySelector(".tool-tip")).toBeNull();
    });

    it("defaults to showing the first tab", () => {
      const { container } = renderTabs();
      const tabs = container.querySelectorAll("ul.nav-tabs li");
      expect(tabs[0]).toHaveClass("active");
      expect(tabs[1]).not.toHaveClass("active");
    });
  });

  describe("content", () => {
    it("renders collections", () => {
      const { container } = renderTabs();
      expect(container.querySelectorAll(".tab-content")).toHaveLength(1);

      // collection1 has no exception, so its panel starts collapsed.
      const collection1 = panelByTitle(container, "collection1");
      expect(collection1).toBeInTheDocument();
      expect(collection1.querySelector(".panel-heading")).toHaveAttribute(
        "aria-expanded",
        "false"
      );

      // collection2 contains a timestamp with an exception, so its panel starts
      // expanded.
      const collection2 = panelByTitle(container, "collection2");
      expect(collection2).toBeInTheDocument();
      expect(collection2.querySelector(".panel-heading")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });

    it("renders timestamps", () => {
      const { container } = renderTabs();
      // Each timestamp renders as a panel headed by its start time.
      expect(
        panelByTitle(container, "start_time_string_1")
      ).toBeInTheDocument();
      expect(
        panelByTitle(container, "start_time_string_2")
      ).toBeInTheDocument();
      // Both timestamps render their duration.
      expect(screen.getAllByText("Duration: 0 seconds")).toHaveLength(2);
    });
  });

  describe("behavior", () => {
    it("switches tabs", async () => {
      const user = userEvent.setup();
      const { container } = renderTabs();
      const tabLinks = container.querySelectorAll("ul.nav-tabs li a");

      await user.click(tabLinks[1]);

      expect(goToTab).toHaveBeenCalledTimes(1);
      expect(goToTab).toHaveBeenCalledWith("test_service_2");
    });
  });
});

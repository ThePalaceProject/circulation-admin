import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  TabContainer,
  TabContainerProps,
} from "../../../src/components/TabContainer";

describe("TabContainer", () => {
  let handleSelectSpy: jest.Mock;

  // A concrete subclass of the abstract TabContainer, mirroring the legacy test's
  // MockTabContainer: it supplies two trivial tabs and records the selected tab
  // key when handleSelect runs.
  class MockTabContainer extends TabContainer<TabContainerProps> {
    handleSelect(event) {
      handleSelectSpy(event.target.dataset.tabkey);
    }
    tabs() {
      return {
        tab1: <div className="tab1" />,
        tab2: <div className="tab2" />,
      };
    }
  }

  const renderContainer = (tab: string = null) =>
    render(
      <MockTabContainer tab={tab} csrfToken="token">
        <div className="test-child">Moby Dick</div>
      </MockTabContainer>
    );

  beforeEach(() => {
    handleSelectSpy = jest.fn();
  });

  it("shows nav tabs", () => {
    const { container } = renderContainer();
    const items = container.querySelectorAll("ul.nav-tabs li");
    const linkTexts = Array.from(items).map((li) => li.textContent);
    expect(linkTexts).toContain("Tab1");
    expect(linkTexts).toContain("Tab2");
    expect(items[0]).toHaveClass("active");
    expect(items[1]).not.toHaveClass("active");
  });

  it("shows default tab content", () => {
    const { container } = renderContainer();
    expect(container.querySelector("#tab1")).toHaveStyle({ display: "block" });
    expect(container.querySelector("#tab2")).toHaveStyle({ display: "none" });
  });

  it("shows tab content from tab in props", () => {
    const { container } = renderContainer("tab2");
    expect(container.querySelector("#tab1")).toHaveStyle({ display: "none" });
    expect(container.querySelector("#tab2")).toHaveStyle({ display: "block" });
  });

  it("uses handleSelect to navigate when tab is clicked", async () => {
    const user = userEvent.setup();
    renderContainer();
    await user.click(screen.getByRole("link", { name: "Tab2" }));
    expect(handleSelectSpy).toHaveBeenCalledTimes(1);
    expect(handleSelectSpy).toHaveBeenCalledWith("tab2");
  });
});

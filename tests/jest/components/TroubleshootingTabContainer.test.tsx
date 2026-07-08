import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// The tab content (TroubleshootingCategoryPage) renders the connected
// Diagnostics/Self-tests containers, which need Redux store + csrf context this
// test does not supply. That content is incidental here — the test is about the
// tab navigation — so mock it to a marker.
jest.mock("../../../src/components/TroubleshootingCategoryPage", () => ({
  __esModule: true,
  default: () => <div data-testid="category-page" />,
}));

import TroubleshootingTabContainer from "../../../src/components/TroubleshootingTabContainer";

describe("TroubleshootingTabContainer", () => {
  let goToTab: jest.Mock;

  beforeEach(() => {
    goToTab = jest.fn();
  });

  it("renders tabs and defaults to showing the Diagnostics tab", () => {
    const { container } = render(
      <TroubleshootingTabContainer goToTab={goToTab} tab="diagnostics" />
    );

    const nav = container.querySelector("ul.nav-tabs");
    expect(nav).not.toBeNull();

    const tabs = nav.querySelectorAll("li");
    expect(tabs).toHaveLength(2);

    expect(tabs[0]).toHaveTextContent("Diagnostics");
    expect(tabs[0]).toHaveClass("active");

    expect(tabs[1]).toHaveTextContent("Self-tests");
    expect(tabs[1]).not.toHaveClass("active");
  });

  it("calls goToTab when another tab is clicked", async () => {
    const user = userEvent.setup();
    render(<TroubleshootingTabContainer goToTab={goToTab} tab="diagnostics" />);

    await user.click(screen.getByRole("link", { name: "Self-tests" }));

    expect(goToTab).toHaveBeenCalledTimes(1);
    expect(goToTab).toHaveBeenCalledWith("self-tests");
  });

  it("switches the active tab when the tab prop changes", () => {
    const { container, rerender } = render(
      <TroubleshootingTabContainer goToTab={goToTab} tab="diagnostics" />
    );

    let tabs = container.querySelectorAll("ul.nav-tabs li");
    expect(tabs[0]).toHaveClass("active");
    expect(tabs[1]).not.toHaveClass("active");

    rerender(
      <TroubleshootingTabContainer goToTab={goToTab} tab="self-tests" />
    );

    tabs = container.querySelectorAll("ul.nav-tabs li");
    expect(tabs[0]).not.toHaveClass("active");
    expect(tabs[1]).toHaveClass("active");
  });
});

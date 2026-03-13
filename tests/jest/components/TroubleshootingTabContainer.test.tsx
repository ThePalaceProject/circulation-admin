import * as React from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/withProviders";
import TroubleshootingTabContainer from "../../../src/components/diagnostics/TroubleshootingTabContainer";

describe("TroubleshootingTabContainer", () => {
  it("renders tabs for Diagnostics and Self-tests", () => {
    const { container } = renderWithProviders(
      <TroubleshootingTabContainer goToTab={jest.fn()} tab="diagnostics" />
    );
    // The first .nav-tabs is the outer tab bar (2 items); inner content adds more
    const firstNav = container.querySelector("ul.nav-tabs");
    const tabs = firstNav!.querySelectorAll("li");
    expect(tabs).toHaveLength(2);
    expect(tabs[0].textContent).toBe("Diagnostics");
    expect(tabs[1].textContent).toBe("Self-tests");
  });

  it("marks the active tab with the 'active' class", () => {
    const { container } = renderWithProviders(
      <TroubleshootingTabContainer goToTab={jest.fn()} tab="diagnostics" />
    );
    const firstNav = container.querySelector("ul.nav-tabs");
    const tabs = firstNav!.querySelectorAll("li");
    expect(tabs[0]).toHaveClass("active");
    expect(tabs[1]).not.toHaveClass("active");
  });

  it("calls goToTab when the Self-tests tab link is clicked", () => {
    const goToTab = jest.fn();
    const { container } = renderWithProviders(
      <TroubleshootingTabContainer goToTab={goToTab} tab="diagnostics" />
    );
    const firstNav = container.querySelector("ul.nav-tabs");
    const selfTestsLink = firstNav!.querySelectorAll("li a")[1] as HTMLElement;
    fireEvent.click(selfTestsLink);
    expect(goToTab).toHaveBeenCalledWith("self-tests");
  });
});

import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";

// The tab containers are connected components that fetch on mount and require
// react-router context; TroubleshootingCategoryPage only chooses between them
// and hands them a `tab` and `goToTab`. Mock them to markers that surface the
// `tab` they receive and let us drive `goToTab`.
jest.mock("../../../src/components/DiagnosticsTabContainer", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="diagnostics-tab-container" data-tab={props.tab}>
      <button type="button" onClick={() => props.goToTab("monitor")}>
        go-to-monitor
      </button>
    </div>
  ),
}));
jest.mock("../../../src/components/SelfTestsTabContainer", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="self-tests-tab-container" data-tab={props.tab} />
  ),
}));

import TroubleshootingCategoryPage from "../../../src/components/TroubleshootingCategoryPage";

describe("TroubleshootingCategoryPage", () => {
  it("renders a tab container", () => {
    renderWithProviders(<TroubleshootingCategoryPage type="diagnostics" />);

    expect(screen.getByTestId("diagnostics-tab-container")).toBeInTheDocument();
    expect(
      screen.queryByTestId("self-tests-tab-container")
    ).not.toBeInTheDocument();
  });

  it("switches tabs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TroubleshootingCategoryPage type="diagnostics" />);

    expect(screen.getByTestId("diagnostics-tab-container")).toHaveAttribute(
      "data-tab",
      "coverage_provider"
    );

    await user.click(screen.getByRole("button", { name: "go-to-monitor" }));

    expect(screen.getByTestId("diagnostics-tab-container")).toHaveAttribute(
      "data-tab",
      "monitor"
    );
  });

  it("renders a different tab container", () => {
    const { rerender } = renderWithProviders(
      <TroubleshootingCategoryPage type="diagnostics" />
    );

    rerender(<TroubleshootingCategoryPage type="self-tests" />);

    expect(
      screen.queryByTestId("diagnostics-tab-container")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("self-tests-tab-container")).toBeInTheDocument();
  });
});

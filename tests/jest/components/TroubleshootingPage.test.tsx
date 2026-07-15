import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import title from "../../../src/utils/title";

// Header needs react-router v3 context that renderWithProviders does not supply,
// and both Header and Footer are page chrome, so mock them to markers.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));
jest.mock("../../../src/components/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

// The real TroubleshootingTabContainer requires router/pathFor context and
// mounts self-test/diagnostic pages that fetch on mount. TroubleshootingPage's
// own behavior is to own the active tab and pass it (and a goToTab callback)
// down, so mock the container to a marker that exposes its `tab`/`subtab` props
// and a control that invokes `goToTab` — exactly the contract under test.
jest.mock("../../../src/components/TroubleshootingTabContainer", () => ({
  __esModule: true,
  default: ({
    tab,
    subtab,
    goToTab,
  }: {
    tab: string;
    subtab: string;
    goToTab: (tab: string) => void;
  }) => (
    <div data-testid="tab-container" data-tab={tab} data-subtab={subtab}>
      <button type="button" onClick={() => goToTab("self-tests")}>
        Go to self-tests
      </button>
    </div>
  ),
}));

import TroubleshootingPage from "../../../src/components/TroubleshootingPage";

const renderPage = () =>
  renderWithProviders(<TroubleshootingPage params={{ tab: "", subtab: "" }} />);

describe("TroubleshootingPage", () => {
  it("renders a header", () => {
    renderPage();
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("renders a heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Troubleshooting" })
    ).toBeInTheDocument();
  });

  it("renders a tab container starting on the diagnostics tab", () => {
    renderPage();
    const tabContainer = screen.getByTestId("tab-container");
    expect(tabContainer).toBeInTheDocument();
    expect(tabContainer).toHaveAttribute("data-tab", "diagnostics");
  });

  it("switches tabs", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.getByTestId("tab-container")).toHaveAttribute(
      "data-tab",
      "diagnostics"
    );

    await user.click(screen.getByRole("button", { name: "Go to self-tests" }));

    expect(screen.getByTestId("tab-container")).toHaveAttribute(
      "data-tab",
      "self-tests"
    );
  });

  it("sets the document title", () => {
    renderPage();
    expect(document.title).toBe(title("Troubleshooting"));
  });

  it("shows a footer", () => {
    renderPage();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});

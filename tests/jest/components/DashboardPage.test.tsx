import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";

// Header and Footer are page chrome; Header pulls in the react-router v3 context
// that `renderWithProviders` does not supply. Mock them to markers.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));
jest.mock("../../../src/components/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

// Stats fetches statistics via RTK Query on mount; DashboardPage's job is just
// composition, so mock Stats to a marker that echoes the `library` prop it is
// handed rather than wiring up fetch mocking.
jest.mock("../../../src/components/Stats", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="stats" data-library={props.library} />
  ),
}));

// CirculationEventsDownload gates its output on a feature flag (off by default) and
// keeps the `library` prop inside a collapsed form, so it is not DOM-observable when
// rendered for real. Mock it to a marker that echoes `library` so the prop-flow the
// original test checked stays observable.
jest.mock("../../../src/components/CirculationEventsDownload", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="circulation-events-download"
      data-library={props.library}
    />
  ),
}));

import DashboardPage from "../../../src/components/DashboardPage";

describe("DashboardPage", () => {
  it("shows Header", () => {
    renderWithProviders(<DashboardPage params={{}} />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("shows CirculationEventsDownload", () => {
    const { rerender } = renderWithProviders(<DashboardPage params={{}} />);

    let events = screen.getByTestId("circulation-events-download");
    expect(events).toBeInTheDocument();
    expect(events).not.toHaveAttribute("data-library");

    rerender(<DashboardPage params={{ library: "NYPL" }} />);
    events = screen.getByTestId("circulation-events-download");
    expect(events).toHaveAttribute("data-library", "NYPL");
  });

  it("shows Stats", () => {
    const { rerender } = renderWithProviders(<DashboardPage params={{}} />);

    let stats = screen.getByTestId("stats");
    expect(stats).not.toHaveAttribute("data-library");

    rerender(<DashboardPage params={{ library: "NYPL" }} />);
    stats = screen.getByTestId("stats");
    expect(stats).toHaveAttribute("data-library", "NYPL");
  });

  it("shows Footer", () => {
    renderWithProviders(<DashboardPage params={{}} />);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});

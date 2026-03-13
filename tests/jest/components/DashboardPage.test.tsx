import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import DashboardPage from "../../../src/components/dashboard/DashboardPage";

describe("DashboardPage", () => {
  it("renders the dashboard container", () => {
    const { container } = renderWithProviders(<DashboardPage params={{}} />);
    expect(container.querySelector(".dashboard")).toBeInTheDocument();
  });

  it("renders a header landmark", () => {
    const { container } = renderWithProviders(<DashboardPage params={{}} />);
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("renders a footer landmark", () => {
    const { container } = renderWithProviders(<DashboardPage params={{}} />);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("renders Stats and circulation events download with a library prop when provided", () => {
    const { container } = renderWithProviders(
      <DashboardPage params={{ library: "NYPL" }} />
    );
    expect(container.querySelector(".dashboard")).toBeInTheDocument();
  });
});

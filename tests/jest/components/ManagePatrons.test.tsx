import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";

// Header and Footer are page chrome; Header pulls in the react-router v3 context
// that renderWithProviders does not supply. Mock them to markers.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));
jest.mock("../../../src/components/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

import ManagePatrons from "../../../src/components/ManagePatrons";

describe("ManagePatrons", () => {
  it("shows Header", () => {
    renderWithProviders(<ManagePatrons params={{ library: "", tab: "" }} />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("should have a .manage-patrons-page class", () => {
    const { container } = renderWithProviders(
      <ManagePatrons params={{ library: "", tab: "" }} />
    );

    expect(container.querySelector(".manage-patrons-page")).toBeInTheDocument();
  });

  it("shows heading", () => {
    renderWithProviders(<ManagePatrons params={{ library: "", tab: "" }} />);

    expect(
      screen.getByRole("heading", { name: "Patron Manager" })
    ).toBeInTheDocument();
  });

  it("shows ManagePatronsTabContainer", () => {
    // A library manager for "NYPL" sees a tab per patron action, which proves
    // both the library and tab props reached the tab container.
    const { container } = renderWithProviders(
      <ManagePatrons params={{ library: "NYPL", tab: "resetAdobeId" }} />,
      { appConfigSettings: { roles: [{ role: "manager", library: "NYPL" }] } }
    );

    const tabContainer = container.querySelector(".tab-container");
    expect(tabContainer).toBeInTheDocument();

    // The tab <li>s carry role="presentation", so query them directly.
    const tabs = (tabContainer as HTMLElement).querySelectorAll(
      "ul.nav-tabs > li"
    );
    expect(tabs).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "Reset Adobe ID" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Debug Authentication" })
    ).toBeInTheDocument();
    // The `tab` prop selects the active tab.
    expect(tabs[0]).toHaveClass("active");
  });

  it("shows Footer", () => {
    renderWithProviders(<ManagePatrons params={{ library: "", tab: "" }} />);

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});

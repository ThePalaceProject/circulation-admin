import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../testUtils/withProviders";
import { setupMswServer } from "../testUtils/mswServer";

// Header and Footer are page chrome; Header reads the legacy `router` context
// and fetches on mount. Mock them to markers.
// The Header marker shows the library that the page gives through the page
// context.
vi.mock("../../../src/components/Header", async () => {
  const { usePageLibrary } = await vi.importActual<
    typeof import("../../../src/context/pageContext")
  >("../../../src/context/pageContext");
  const HeaderMock = () => (
    <div data-testid="header" data-library={usePageLibrary()} />
  );
  return { default: HeaderMock };
});
vi.mock("../../../src/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

import ManagePatrons from "../../../src/components/ManagePatrons";

describe("ManagePatrons", () => {
  const { requests } = setupMswServer(
    http.post("*/NYPL/admin/manage_patrons", () =>
      HttpResponse.json({ authorization_identifier: "1234" })
    )
  );

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

    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-library",
      "NYPL"
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

  it("sends the CSRF token from the app config with a patron lookup", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ManagePatrons params={{ library: "NYPL", tab: "resetAdobeId" }} />,
      {
        appConfigSettings: {
          csrfToken: "token",
          roles: [{ role: "manager", library: "NYPL" }],
        },
      }
    );

    await user.type(
      screen.getByRole("textbox", { name: /Identifier/i }),
      "1234"
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText(/Patron found: 1234/)).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get("X-CSRF-Token")).toBe("token");
  });
});

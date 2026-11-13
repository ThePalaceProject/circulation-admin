import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Admin from "../../../src/models/Admin";
import { renderWithProviders } from "../testUtils/withProviders";
import { LegacyRouterContext } from "../../../src/components/LegacyRouterBridge";
import { mockLegacyRouter } from "../testUtils/mockLegacyRouter";

// Both tab panels fetch on mount (ResetAdobeId is a connected component; Debug
// Authentication uses react-query). They're incidental to a tab-navigation test,
// so mock them to markers. ResetAdobeId echoes the csrfToken asserted below.
vi.mock("../../../src/components/ResetAdobeId", () => ({
  default: (props: any) => (
    <div data-testid="reset-adobe-id" data-csrf-token={props.csrfToken} />
  ),
}));
vi.mock("../../../src/components/DebugAuthentication", () => ({
  default: () => <div data-testid="debug-authentication" />,
}));

import ManagePatronsTabContainer from "../../../src/components/ManagePatronsTabContainer";

describe("ManagePatronsTabContainer", () => {
  const systemAdmin = new Admin([{ role: "system" }]);
  const libraryManagerNYPL = new Admin([{ role: "manager", library: "NYPL" }]);
  const libraryManagerA = new Admin([{ role: "manager", library: "a" }]);
  const librarian = new Admin([{ role: "librarian", library: "NYPL" }]);

  // The default export reads `router` with `useLegacyRouter()`, so give it a
  // mock router through `LegacyRouterContext`. It reads `admin` from the app
  // context, which `renderWithProviders` builds from the configured roles.
  const renderWithAdmin = (admin: Admin) => {
    const router = mockLegacyRouter();
    const result = renderWithProviders(
      <LegacyRouterContext.Provider value={router}>
        <ManagePatronsTabContainer
          tab={null}
          csrfToken="token"
          library="NYPL"
        />
      </LegacyRouterContext.Provider>,
      { appConfigSettings: { roles: admin.roles } }
    );
    return { ...result, push: router.push };
  };

  describe("for system admin", () => {
    it("shows tabs", () => {
      renderWithAdmin(systemAdmin);
      expect(
        screen.getByRole("link", { name: "Reset Adobe ID" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Debug Authentication" })
      ).toBeInTheDocument();
    });

    it("shows components", () => {
      renderWithAdmin(systemAdmin);
      expect(screen.getByTestId("reset-adobe-id")).toHaveAttribute(
        "data-csrf-token",
        "token"
      );
    });

    it("uses router to navigate when tab is clicked", async () => {
      const user = userEvent.setup();
      const { push } = renderWithAdmin(systemAdmin);
      await user.click(screen.getByRole("link", { name: "Reset Adobe ID" }));
      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith("/admin/web/patrons/NYPL/resetAdobeId");
    });
  });

  describe("for right library manager", () => {
    it("shows tabs", () => {
      renderWithAdmin(libraryManagerNYPL);
      expect(
        screen.getByRole("link", { name: "Reset Adobe ID" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Debug Authentication" })
      ).toBeInTheDocument();
    });

    it("marks the current tab as active", () => {
      const { container } = renderWithAdmin(libraryManagerNYPL);
      const tabItems = container.querySelectorAll("ul.nav-tabs li");
      expect(tabItems).toHaveLength(2);
      expect(tabItems[0]).toHaveClass("active");
    });

    it("shows components", () => {
      renderWithAdmin(libraryManagerNYPL);
      expect(screen.getByTestId("reset-adobe-id")).toHaveAttribute(
        "data-csrf-token",
        "token"
      );
    });

    it("uses router to navigate when tab is clicked", async () => {
      const user = userEvent.setup();
      const { push } = renderWithAdmin(libraryManagerNYPL);
      await user.click(screen.getByRole("link", { name: "Reset Adobe ID" }));
      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith("/admin/web/patrons/NYPL/resetAdobeId");
    });
  });

  describe("for wrong library manager", () => {
    it("doesn't show tabs", () => {
      renderWithAdmin(libraryManagerA);
      expect(
        screen.queryByRole("link", { name: "Reset Adobe ID" })
      ).not.toBeInTheDocument();
    });
  });

  describe("for librarian", () => {
    it("doesn't show tabs", () => {
      renderWithAdmin(librarian);
      expect(
        screen.queryByRole("link", { name: "Reset Adobe ID" })
      ).not.toBeInTheDocument();
    });
  });
});

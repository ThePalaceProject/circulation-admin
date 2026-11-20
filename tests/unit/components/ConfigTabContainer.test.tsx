import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Admin from "../../../src/models/Admin";
import { renderWithProviders } from "../testUtils/withProviders";
import { LegacyRouterContext } from "../../../src/components/LegacyRouterBridge";
import { mockLegacyRouter } from "../testUtils/mockLegacyRouter";

// Every configuration tab panel is a connected component that fetches on mount.
// This container's behavior is the tab SET and tab SWITCHING, not the panels'
// internals, so mock each panel to a marker echoing the props the container is
// responsible for threading into it (csrfToken / editOrCreate / identifier).
function panelMock(testId: string) {
  return {
    default: (props: any) => (
      <div
        data-testid={testId}
        data-csrf-token={props.csrfToken}
        data-edit-or-create={props.editOrCreate}
        data-identifier={props.identifier}
      />
    ),
  };
}

vi.mock("../../../src/components/Libraries", () => panelMock("libraries"));
vi.mock("../../../src/components/Collections", () => panelMock("collections"));
vi.mock("../../../src/components/IndividualAdmins", () =>
  panelMock("individual-admins")
);
vi.mock("../../../src/components/PatronAuthServices", () =>
  panelMock("patron-auth-services")
);
vi.mock("../../../src/components/MetadataServices", () =>
  panelMock("metadata-services")
);
vi.mock("../../../src/components/CatalogServices", () =>
  panelMock("catalog-services")
);
vi.mock("../../../src/components/DiscoveryServices", () =>
  panelMock("discovery-services")
);
vi.mock("../../../src/components/SitewideAnnouncements", () =>
  panelMock("sitewide-announcements")
);

import ConfigTabContainer from "../../../src/components/ConfigTabContainer";

describe("ConfigTabContainer", () => {
  const systemAdmin = new Admin([{ role: "system" }]);
  const libraryManagerA = new Admin([{ role: "manager", library: "a" }]);
  const sitewideLibrarian = new Admin([{ role: "librarian-all" }]);

  // The default export reads `router` with `useLegacyRouter()`, so give it a
  // mock router through `LegacyRouterContext`. It reads `admin` from the app
  // context, which `renderWithProviders` builds from the configured roles.
  const renderWithAdmin = (admin: Admin, { withRouter = true } = {}) => {
    const router = withRouter ? mockLegacyRouter() : undefined;
    const result = renderWithProviders(
      <LegacyRouterContext.Provider value={router}>
        <ConfigTabContainer
          tab={null}
          csrfToken="token"
          editOrCreate="edit"
          identifier="identifier"
        />
      </LegacyRouterContext.Provider>,
      { appConfigSettings: { roles: admin.roles } }
    );
    return { ...result, push: router?.push };
  };

  const expectPanelProps = (testId: string) => {
    const panel = screen.getByTestId(testId);
    expect(panel).toHaveAttribute("data-csrf-token", "token");
    expect(panel).toHaveAttribute("data-edit-or-create", "edit");
    expect(panel).toHaveAttribute("data-identifier", "identifier");
  };

  describe("for system admin", () => {
    it("shows tabs", () => {
      renderWithAdmin(systemAdmin);
      for (const name of [
        "Libraries",
        "Admins",
        "Collections",
        "Patron Authentication",
        "Metadata",
        "External Catalogs",
        "Discovery",
        "Sitewide Announcements",
      ]) {
        expect(screen.getByRole("link", { name })).toBeInTheDocument();
      }
    });

    it("shows components", () => {
      renderWithAdmin(systemAdmin);
      for (const testId of [
        "libraries",
        "individual-admins",
        "collections",
        "patron-auth-services",
        "metadata-services",
        "catalog-services",
        "discovery-services",
        "sitewide-announcements",
      ]) {
        expectPanelProps(testId);
      }
    });

    it("uses router to navigate when tab is clicked", async () => {
      const { push } = renderWithAdmin(systemAdmin);
      await userEvent.click(screen.getByRole("link", { name: "Collections" }));
      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith("/admin/web/config/collections");
    });

    it("does not throw when a tab is clicked with no router", async () => {
      renderWithAdmin(systemAdmin, { withRouter: false });
      await userEvent.click(screen.getByRole("link", { name: "Collections" }));
    });
  });

  describe("for library manager", () => {
    it("shows tabs", () => {
      renderWithAdmin(libraryManagerA);
      expect(
        screen.getByRole("link", { name: "Libraries" })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Admins" })).toBeInTheDocument();
      for (const name of [
        "Collections",
        "Patron Authentication",
        "Metadata",
        "External Catalogs",
      ]) {
        expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
      }
    });

    it("shows components", () => {
      renderWithAdmin(libraryManagerA);
      expectPanelProps("libraries");
      expectPanelProps("individual-admins");
      for (const testId of [
        "collections",
        "patron-auth-services",
        "metadata-services",
        "catalog-services",
        "discovery-services",
        "sitewide-announcements",
      ]) {
        expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
      }
    });
  });

  describe("for librarian", () => {
    it("shows tabs", () => {
      const { container } = renderWithAdmin(sitewideLibrarian);
      const links = container.querySelectorAll("ul.nav-tabs a");
      expect(links).toHaveLength(1);
      expect(
        screen.getByRole("link", { name: "Libraries" })
      ).toBeInTheDocument();
    });

    it("shows components", () => {
      renderWithAdmin(sitewideLibrarian);
      expectPanelProps("libraries");
      for (const testId of [
        "individual-admins",
        "collections",
        "patron-auth-services",
        "metadata-services",
        "catalog-services",
        "discovery-services",
        "sitewide-announcements",
      ]) {
        expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
      }
    });
  });
});

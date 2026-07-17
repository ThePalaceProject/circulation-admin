import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import buildStore from "../../../src/store";
import Admin from "../../../src/models/Admin";

// Every configuration tab panel is a connected component that fetches on mount.
// This container's behavior is the tab SET and tab SWITCHING, not the panels'
// internals, so mock each panel to a marker echoing the props the container is
// responsible for threading into it (csrfToken / editOrCreate / identifier).
const panelMock = (testId: string) => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid={testId}
      data-csrf-token={props.csrfToken}
      data-edit-or-create={props.editOrCreate}
      data-identifier={props.identifier}
    />
  ),
});

jest.mock("../../../src/components/Libraries", () => panelMock("libraries"));
jest.mock("../../../src/components/Collections", () =>
  panelMock("collections")
);
jest.mock("../../../src/components/IndividualAdmins", () =>
  panelMock("individual-admins")
);
jest.mock("../../../src/components/PatronAuthServices", () =>
  panelMock("patron-auth-services")
);
jest.mock("../../../src/components/MetadataServices", () =>
  panelMock("metadata-services")
);
jest.mock("../../../src/components/CatalogServices", () =>
  panelMock("catalog-services")
);
jest.mock("../../../src/components/DiscoveryServices", () =>
  panelMock("discovery-services")
);
jest.mock("../../../src/components/SitewideAnnouncements", () =>
  panelMock("sitewide-announcements")
);

import ConfigTabContainer from "../../../src/components/ConfigTabContainer";

// ConfigTabContainer reads `router`, `pathFor`, and `admin` from the legacy React
// context the app supplies in production. Wrap it in a small provider that hands
// it those.
class LegacyContextProvider extends React.Component<{ context: any }> {
  static childContextTypes = {
    router: PropTypes.object,
    pathFor: PropTypes.func,
    admin: PropTypes.object,
  };
  getChildContext() {
    return this.props.context;
  }
  render() {
    return this.props.children;
  }
}

describe("ConfigTabContainer", () => {
  const systemAdmin = new Admin([{ role: "system" }]);
  const libraryManagerA = new Admin([{ role: "manager", library: "a" }]);
  const sitewideLibrarian = new Admin([{ role: "librarian-all" }]);

  const renderWithAdmin = (admin: Admin, push: jest.Mock = jest.fn()) => {
    const context = { router: { push }, pathFor: jest.fn(), admin };
    const result = render(
      <LegacyContextProvider context={context}>
        <ConfigTabContainer
          tab={null}
          csrfToken="token"
          store={buildStore()}
          editOrCreate="edit"
          identifier="identifier"
        />
      </LegacyContextProvider>
    );
    return { ...result, push };
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

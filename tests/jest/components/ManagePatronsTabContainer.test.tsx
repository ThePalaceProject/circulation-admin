import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import buildStore from "../../../src/store";
import Admin from "../../../src/models/Admin";

// Both tab panels fetch on mount (ResetAdobeId is a connected component; Debug
// Authentication uses react-query). They're incidental to a tab-navigation test,
// so mock them to markers. ResetAdobeId echoes the csrfToken asserted below.
jest.mock("../../../src/components/ResetAdobeId", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="reset-adobe-id" data-csrf-token={props.csrfToken} />
  ),
}));
jest.mock("../../../src/components/DebugAuthentication", () => ({
  __esModule: true,
  default: () => <div data-testid="debug-authentication" />,
}));

import ManagePatronsTabContainer from "../../../src/components/ManagePatronsTabContainer";

// ManagePatronsTabContainer reads `admin`, `router`, and `pathFor` from the legacy
// React context the app supplies in production. Wrap it in a small provider that
// hands it those.
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

describe("ManagePatronsTabContainer", () => {
  const systemAdmin = new Admin([{ role: "system" }]);
  const libraryManagerNYPL = new Admin([{ role: "manager", library: "NYPL" }]);
  const libraryManagerA = new Admin([{ role: "manager", library: "a" }]);
  const librarian = new Admin([{ role: "librarian", library: "NYPL" }]);

  const renderWithAdmin = (admin: Admin, push: jest.Mock = jest.fn()) => {
    const context = { router: { push }, pathFor: jest.fn(), admin };
    const result = render(
      <LegacyContextProvider context={context}>
        <ManagePatronsTabContainer
          tab={null}
          csrfToken="token"
          store={buildStore()}
          library="NYPL"
        />
      </LegacyContextProvider>
    );
    return { ...result, push };
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

import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import buildStore from "../../../src/store";
import Admin from "../../../src/models/Admin";
import ManagePatronsTabContainer from "../../../src/components/patrons/ManagePatronsTabContainer";

// ManagePatronsTabContainer reads `router`, `pathFor`, and `admin` via
// React legacy contextTypes — we provide them through a parent class component.
function createLegacyWrapper(admin: Admin, pushMock: jest.Mock) {
  const router = { push: pushMock };

  class LegacyCtxProvider extends React.Component<{
    children?: React.ReactNode;
  }> {
    getChildContext() {
      return { router, pathFor: jest.fn(), admin };
    }
    static childContextTypes = {
      router: PropTypes.object,
      pathFor: PropTypes.func,
      admin: PropTypes.object,
    };
    render() {
      return <>{this.props.children}</>;
    }
  }

  return { LegacyCtxProvider, router };
}

function renderContainer(
  admin: Admin,
  { library = "NYPL", tab = null as string, pushMock = jest.fn() } = {}
) {
  const store = buildStore();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const { LegacyCtxProvider } = createLegacyWrapper(admin, pushMock);

  render(
    <QueryClientProvider client={queryClient}>
      <LegacyCtxProvider>
        <ManagePatronsTabContainer
          tab={tab}
          csrfToken="token"
          store={store}
          library={library}
        />
      </LegacyCtxProvider>
    </QueryClientProvider>
  );

  return { pushMock };
}

describe("ManagePatronsTabContainer", () => {
  const systemAdmin = new Admin([{ role: "system" }]);
  const libraryManagerNYPL = new Admin([{ role: "manager", library: "NYPL" }]);
  const libraryManagerA = new Admin([{ role: "manager", library: "a" }]);
  const librarian = new Admin([{ role: "librarian", library: "NYPL" }]);

  // ─── System admin ──────────────────────────────────────────────────────────

  describe("for system admin", () => {
    it("shows Reset Adobe ID tab", () => {
      renderContainer(systemAdmin);
      const tabLinks = screen.getAllByRole("link").map((a) => a.textContent);
      expect(tabLinks).toContain("Reset Adobe ID");
    });

    it("shows Debug Authentication tab", () => {
      renderContainer(systemAdmin);
      const tabLinks = screen.getAllByRole("link").map((a) => a.textContent);
      expect(tabLinks).toContain("Debug Authentication");
    });

    it("marks the first tab (Reset Adobe ID) as active by default", () => {
      renderContainer(systemAdmin);
      const navItems = document
        .querySelector("ul.nav-tabs")
        .querySelectorAll("li");
      expect(navItems[0].className).toBe("active");
    });

    it("navigates via router when a tab link is clicked", () => {
      const pushMock = jest.fn();
      renderContainer(systemAdmin, { pushMock });
      const resetLink = screen
        .getAllByRole("link")
        .find((a) => a.textContent === "Reset Adobe ID");
      fireEvent.click(resetLink);
      expect(pushMock).toHaveBeenCalledWith(
        "/admin/web/patrons/NYPL/resetAdobeId"
      );
    });
  });

  // ─── Correct library manager ────────────────────────────────────────────────

  describe("for library manager of the correct library", () => {
    it("shows Reset Adobe ID and Debug Authentication tabs", () => {
      renderContainer(libraryManagerNYPL);
      const tabLinks = screen.getAllByRole("link").map((a) => a.textContent);
      expect(tabLinks).toContain("Reset Adobe ID");
      expect(tabLinks).toContain("Debug Authentication");
    });

    it("marks the first tab as active by default when tab=null", () => {
      renderContainer(libraryManagerNYPL);
      const navItems = document
        .querySelector("ul.nav-tabs")
        .querySelectorAll("li");
      expect(navItems[0].className).toBe("active");
    });

    it("navigates via router when a tab link is clicked", () => {
      const pushMock = jest.fn();
      renderContainer(libraryManagerNYPL, { pushMock });
      const resetLink = screen
        .getAllByRole("link")
        .find((a) => a.textContent === "Reset Adobe ID");
      fireEvent.click(resetLink);
      expect(pushMock).toHaveBeenCalledWith(
        "/admin/web/patrons/NYPL/resetAdobeId"
      );
    });
  });

  // ─── Wrong library manager ──────────────────────────────────────────────────

  describe("for library manager of a different library", () => {
    it("does not show patron tabs", () => {
      renderContainer(libraryManagerA);
      const tabLinks = screen.queryAllByRole("link").map((a) => a.textContent);
      expect(tabLinks).not.toContain("Reset Adobe ID");
      expect(tabLinks).not.toContain("Debug Authentication");
    });
  });

  // ─── Librarian ──────────────────────────────────────────────────────────────

  describe("for librarian", () => {
    it("does not show patron tabs", () => {
      renderContainer(librarian);
      const tabLinks = screen.queryAllByRole("link").map((a) => a.textContent);
      expect(tabLinks).not.toContain("Reset Adobe ID");
      expect(tabLinks).not.toContain("Debug Authentication");
    });
  });
});

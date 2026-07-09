import * as React from "react";
import * as PropTypes from "prop-types";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";

import { Header } from "../../../src/components/Header";
import HeaderWithStore from "../../../src/components/Header";
import Admin from "../../../src/models/Admin";
import title from "../../../src/utils/title";
import buildStore from "../../../src/store";

// Render react-router's Link as a marker `<div>` so we can read its target
// (`data-to`) and text without a real Router in context. (A bare `<a>` without an
// href would fail jsx-a11y, so use a div.)
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props) => (
    <div data-testid="Link" data-to={props.to} className={props.className}>
      {props.children}
    </div>
  ),
}));

// Header reads `library`, `router`, and `admin` from the legacy React context that
// the OPDS web client supplies in production. Supply them via a small legacy
// context provider (also carrying the `editorStore`/`csrfToken` the connected
// default export needs).
class LegacyContextProvider extends React.Component<{ context: any }> {
  static childContextTypes = {
    library: PropTypes.func,
    router: PropTypes.object,
    admin: PropTypes.object,
    editorStore: PropTypes.object,
    csrfToken: PropTypes.string,
  };
  getChildContext() {
    return this.props.context;
  }
  render() {
    return this.props.children;
  }
}

const makeRouter = () => ({
  createHref: jest.fn(),
  push: jest.fn(),
  isActive: jest.fn(),
  replace: jest.fn(),
  go: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  setRouteLeaveHook: jest.fn(),
  getCurrentLocation: jest.fn(),
});

const libraryManager = new Admin([{ role: "manager", library: "nypl" }]);
const librarian = new Admin([{ role: "librarian", library: "nypl" }]);
const systemAdmin = new Admin([{ role: "system", library: "nypl" }]);

type RenderHeaderOptions = {
  // Pass `null` to model an absent `library` in context (a destructuring default
  // cannot distinguish an omitted key from an explicit `undefined`, so `null` is
  // the sentinel for "no library selected"). Header treats null/undefined alike.
  library?: (() => string) | null;
  admin?: Admin;
  router?: ReturnType<typeof makeRouter>;
  props?: Record<string, unknown>;
};

const renderHeader = ({
  library = () => "nypl",
  admin = libraryManager,
  router = makeRouter(),
  props = {},
}: RenderHeaderOptions = {}) =>
  render(
    <LegacyContextProvider context={{ library, admin, router }}>
      <Header {...props} />
    </LegacyContextProvider>
  );

describe("Header", () => {
  describe("rendering", () => {
    it("renders the site title as an h1", () => {
      renderHeader();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        title()
      );
    });

    it("shows the brand image", () => {
      renderHeader();
      expect(screen.getByAltText(title())).toBeInTheDocument();
    });

    it("shows no library dropdown when there are no libraries", () => {
      renderHeader();
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("shows a library dropdown listing the available libraries", () => {
      const libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" },
      ];
      renderHeader({ props: { libraries } });

      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("nypl");

      const options = within(select).getAllByRole("option");
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent("NYPL");
      expect(options[0]).toHaveValue("nypl");
      expect(options[1]).toHaveTextContent("bpl");
      expect(options[1]).toHaveValue("bpl");
    });

    it("reflects the selected library as the dropdown value", () => {
      const libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" },
      ];
      renderHeader({ library: () => "bpl", props: { libraries } });
      expect(screen.getByRole("combobox")).toHaveValue("bpl");
    });

    it("prepends a 'Select a library' option when no library is selected", () => {
      const libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" },
      ];
      renderHeader({ library: null, props: { libraries } });

      const options = within(screen.getByRole("combobox")).getAllByRole(
        "option"
      );
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent("Select a library");
      expect(options[1]).toHaveTextContent("NYPL");
      expect(options[1]).toHaveValue("nypl");
      expect(options[2]).toHaveTextContent("bpl");
      expect(options[2]).toHaveValue("bpl");
    });

    it("shows the catalog nav links when a library is selected", () => {
      const { container } = renderHeader();

      const catalogLinks = container.querySelectorAll(
        'a[href^="/admin/web/collection/"]'
      );
      expect(catalogLinks).toHaveLength(2);

      const catalog = container.querySelector('a[href*="nypl%2Fgroups"]');
      expect(catalog).toHaveTextContent("Catalog");
      const hidden = container.querySelector(
        'a[href*="nypl%2Fadmin%2Fsuppressed"]'
      );
      expect(hidden).toHaveTextContent("Hidden Books");
    });

    it("hides the catalog nav links when no library is selected", () => {
      const { container } = renderHeader({ library: null });
      expect(
        container.querySelectorAll('a[href^="/admin/web/collection/"]')
      ).toHaveLength(0);
    });

    it("shows dashboard, lists, lanes, and system configuration links for a library manager", () => {
      renderHeader({ admin: libraryManager });

      const links = screen.getAllByTestId("Link");
      expect(links).toHaveLength(4);
      expect(links[0]).toHaveTextContent("Dashboard");
      expect(links[0]).toHaveAttribute("data-to", "/admin/web/dashboard/nypl");
      expect(links[1]).toHaveTextContent("Lists");
      expect(links[1]).toHaveAttribute("data-to", "/admin/web/lists/nypl");
      expect(links[2]).toHaveTextContent("Lanes");
      expect(links[2]).toHaveAttribute("data-to", "/admin/web/lanes/nypl");
      expect(links[3]).toHaveTextContent("System Configuration");
      expect(links[3]).toHaveAttribute("data-to", "/admin/web/config/");
    });

    it("shows only site-wide dashboard and system configuration links when no library is selected", () => {
      renderHeader({ library: null, admin: libraryManager });

      const links = screen.getAllByTestId("Link");
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveTextContent("Dashboard");
      expect(links[0]).toHaveAttribute("data-to", "/admin/web/dashboard/");
      expect(links[1]).toHaveTextContent("System Configuration");
      expect(links[1]).toHaveAttribute("data-to", "/admin/web/config/");
    });

    it("shows dashboard, lists, and system configuration links for a librarian", () => {
      renderHeader({ admin: librarian });

      const links = screen.getAllByTestId("Link");
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveTextContent("Dashboard");
      expect(links[0]).toHaveAttribute("data-to", "/admin/web/dashboard/nypl");
      expect(links[1]).toHaveTextContent("Lists");
      expect(links[1]).toHaveAttribute("data-to", "/admin/web/lists/nypl");
      expect(links[2]).toHaveTextContent("System Configuration");
      expect(links[2]).toHaveAttribute("data-to", "/admin/web/config/");
    });

    it("shows the account dropdown toggle when the admin has an email", () => {
      const admin = new Admin(
        [{ role: "librarian", library: "nypl" }],
        "admin@nypl.org"
      );
      const { container } = renderHeader({ admin });

      const toggle = container.querySelector("button.account-dropdown-toggle");
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveTextContent("admin@nypl.org");
    });

    describe("patron manager display", () => {
      it("does not show the Patrons link for a librarian", () => {
        renderHeader({ admin: librarian });
        const links = screen.getAllByTestId("Link");
        expect(links).toHaveLength(3);
        expect(links.some((link) => link.textContent === "Patrons")).toBe(
          false
        );
      });

      it("does not show the Patrons link for a library manager", () => {
        renderHeader({ admin: libraryManager });
        const links = screen.getAllByTestId("Link");
        expect(links).toHaveLength(4);
        expect(links.some((link) => link.textContent === "Patrons")).toBe(
          false
        );
      });

      it("shows the Patrons link for a system admin", () => {
        renderHeader({ admin: systemAdmin });
        const links = screen.getAllByTestId("Link");
        expect(links).toHaveLength(6);
        expect(links[3]).toHaveTextContent("Patrons");
      });
    });

    describe("troubleshooting display", () => {
      it("does not show the Troubleshooting link for a librarian", () => {
        renderHeader({ admin: librarian });
        const links = screen.getAllByTestId("Link");
        expect(links).toHaveLength(3);
        expect(
          links.some((link) => link.textContent === "Troubleshooting")
        ).toBe(false);
      });

      it("does not show the Troubleshooting link for a library manager", () => {
        renderHeader({ admin: libraryManager });
        const links = screen.getAllByTestId("Link");
        expect(links).toHaveLength(4);
        expect(
          links.some((link) => link.textContent === "Troubleshooting")
        ).toBe(false);
      });

      it("shows the Troubleshooting link for a system admin", () => {
        renderHeader({ admin: systemAdmin });
        const links = screen.getAllByTestId("Link");
        expect(links).toHaveLength(6);
        expect(links[5]).toHaveTextContent("Troubleshooting");
      });
    });
  });

  describe("behavior", () => {
    it("fetches libraries on mount", () => {
      const fetchLibraries = jest.fn();
      renderHeader({ admin: libraryManager, props: { fetchLibraries } });
      expect(fetchLibraries).toHaveBeenCalledTimes(1);
    });

    it("does not fetch libraries on mount if a fetch is already in progress", () => {
      const fetchLibraries = jest.fn();
      renderHeader({
        admin: libraryManager,
        props: { fetchLibraries, isFetchingLibraries: true },
      });
      expect(fetchLibraries).not.toHaveBeenCalled();
    });

    it("navigates to the selected library's catalog when the dropdown changes", async () => {
      const user = userEvent.setup();
      const router = makeRouter();
      const libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" },
      ];
      renderHeader({ router, props: { libraries } });

      await user.selectOptions(screen.getByRole("combobox"), "bpl");

      expect(router.push).toHaveBeenCalledTimes(1);
      expect(router.push).toHaveBeenCalledWith(
        "/admin/web/collection/bpl%2Fgroups"
      );
    });

    it("toggles the account dropdown open and closed", async () => {
      const user = userEvent.setup();
      const admin = new Admin(
        [{ role: "librarian", library: "nypl" }],
        "admin@nypl.org"
      );
      const { container } = renderHeader({ admin });

      expect(
        container.querySelector("ul.dropdown-menu")
      ).not.toBeInTheDocument();

      const toggle = container.querySelector(
        "button.account-dropdown-toggle"
      ) as HTMLElement;
      await user.click(toggle);

      const menu = container.querySelector("ul.dropdown-menu") as HTMLElement;
      expect(menu).toBeInTheDocument();
      expect(menu.querySelectorAll("li")).toHaveLength(3);
      expect(menu.querySelector("li.permissions")).toHaveTextContent(
        "Logged in as a user"
      );

      // The change-password entry is a react-router Link (mocked to a marker div).
      const changePassword = within(menu).getByTestId("Link");
      expect(changePassword).toHaveTextContent("Change password");
      expect(changePassword).toHaveAttribute("data-to", "/admin/web/account/");

      // The sign-out entry is a real anchor.
      const signOut = within(menu).getByRole("link", { name: "Sign out" });
      expect(signOut).toHaveAttribute("href", "/admin/sign_out");

      await user.click(toggle);
      expect(
        container.querySelector("ul.dropdown-menu")
      ).not.toBeInTheDocument();
    });

    it("labels the permission level in the account dropdown", async () => {
      const user = userEvent.setup();
      const openDropdownPermissions = async (admin: Admin) => {
        const { container, unmount } = renderHeader({ admin });
        const toggle = container.querySelector(
          "button.account-dropdown-toggle"
        ) as HTMLElement;
        await user.click(toggle);
        const text = container.querySelector(
          "ul.dropdown-menu li.permissions"
        )?.textContent;
        unmount();
        return text;
      };

      expect(
        await openDropdownPermissions(
          new Admin([{ role: "system", library: "nypl" }], "admin@nypl.org")
        )
      ).toBe("Logged in as a system admin");
      expect(
        await openDropdownPermissions(
          new Admin([{ role: "manager", library: "nypl" }], "admin@nypl.org")
        )
      ).toBe("Logged in as an administrator");
      expect(
        await openDropdownPermissions(
          new Admin([{ role: "librarian", library: "nypl" }], "admin@nypl.org")
        )
      ).toBe("Logged in as a user");
    });
  });

  describe("connected (default export)", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("wires libraries from the store and fetches them on mount", async () => {
      // The connected default export reads `libraries`/`isFetchingLibraries` from
      // the redux store and dispatches `fetchLibraries` on mount, which hits the
      // network — stub fetch so mounting settles without a real request.
      const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ libraries: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
      const store = buildStore();

      render(
        <Provider store={store}>
          <LegacyContextProvider
            context={{
              editorStore: store,
              csrfToken: "token",
              library: () => "nypl",
              admin: libraryManager,
              router: makeRouter(),
            }}
          >
            <HeaderWithStore />
          </LegacyContextProvider>
        </Provider>
      );

      expect(
        await screen.findByRole("heading", { level: 1 })
      ).toHaveTextContent(title());
      await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
      expect(fetchSpy.mock.calls[0][0]).toContain("/admin/libraries");
    });
  });
});

import * as React from "react";
import PropTypes from "prop-types";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import buildStore from "../../../src/store";
import ConfigTabContainer from "../../../src/components/config/ConfigTabContainer";
import Admin from "../../../src/models/Admin";
import { AdminRole } from "../../../src/interfaces";

// ConfigTabContainer extends TabContainer which needs router + pathFor + admin context.
class ContextProvider extends React.Component<{
  children: React.ReactNode;
  admin: Admin;
}> {
  static childContextTypes = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
    admin: PropTypes.object.isRequired,
  };
  getChildContext() {
    return {
      router: { push: jest.fn(), createHref: () => "test href" },
      pathFor: (colUrl: string, bookUrl: string) => `${colUrl}::${bookUrl}`,
      admin: this.props.admin,
    };
  }
  render() {
    return <>{this.props.children}</>;
  }
}

const systemAdmin = new Admin([{ role: "system" as AdminRole }]);
const libraryManagerA = new Admin([
  { role: "manager" as AdminRole, library: "a" },
]);
const sitewideLibrarian = new Admin([{ role: "librarian-all" as AdminRole }]);

function renderConfig(admin: Admin, props = {}) {
  const store = buildStore();
  return render(
    <Provider store={store}>
      <ContextProvider admin={admin}>
        <ConfigTabContainer
          tab={null}
          csrfToken="token"
          store={store}
          editOrCreate="edit"
          identifier="identifier"
          {...props}
        />
      </ContextProvider>
    </Provider>
  );
}

describe("ConfigTabContainer", () => {
  describe("for system admin", () => {
    it("shows all tabs", () => {
      const { container } = renderConfig(systemAdmin);
      const links = container.querySelectorAll("ul.nav-tabs a");
      const linkTexts = Array.from(links).map((l) => l.textContent);
      expect(linkTexts).toContain("Libraries");
      expect(linkTexts).toContain("Admins");
      expect(linkTexts).toContain("Collections");
      expect(linkTexts).toContain("Patron Authentication");
      expect(linkTexts).toContain("Metadata");
      expect(linkTexts).toContain("Catalog");
      expect(linkTexts).toContain("Announcements");
    });

    it("uses router to navigate when tab is clicked", () => {
      const pushFn = jest.fn();
      // Create a custom context with our push mock
      class RouterContextWithPush extends React.Component<{
        children: React.ReactNode;
      }> {
        static childContextTypes = {
          router: PropTypes.object.isRequired,
          pathFor: PropTypes.func.isRequired,
          admin: PropTypes.object.isRequired,
        };
        getChildContext() {
          return {
            router: { push: pushFn, createHref: () => "test href" },
            pathFor: jest.fn().mockReturnValue("url"),
            admin: systemAdmin,
          };
        }
        render() {
          return <>{this.props.children}</>;
        }
      }

      const store = buildStore();
      const { container } = render(
        <Provider store={store}>
          <RouterContextWithPush>
            <ConfigTabContainer
              tab={null}
              csrfToken="token"
              store={store}
              editOrCreate="edit"
              identifier="identifier"
            />
          </RouterContextWithPush>
        </Provider>
      );

      const tabs = container.querySelectorAll("ul.nav-tabs a");
      // Click the Collections tab (index 1: libraries, collections, ...)
      fireEvent.click(tabs[1]);
      expect(pushFn).toHaveBeenCalledTimes(1);
      expect(pushFn.mock.calls[0][0]).toBe("/admin/web/config/collections");
    });
  });

  describe("for library manager", () => {
    it("shows Libraries and Collections tabs for library manager", () => {
      const { container } = renderConfig(libraryManagerA);
      const links = container.querySelectorAll("ul.nav-tabs a");
      const linkTexts = Array.from(links).map((l) => l.textContent);
      expect(linkTexts).toContain("Libraries");
      expect(linkTexts).toContain("Collections");
      expect(linkTexts).not.toContain("Admins");
    });
  });

  describe("for librarian", () => {
    it("shows Libraries tab for librarian (plus other configured tabs)", () => {
      const { container } = renderConfig(sitewideLibrarian);
      const links = container.querySelectorAll("ul.nav-tabs a");
      const linkTexts = Array.from(links).map((l) => l.textContent);
      expect(linkTexts).toContain("Libraries");
    });
  });
});

import { expect } from "chai";
import { stub } from "sinon";
import * as PropTypes from "prop-types";
import * as React from "react";
import { shallow, mount } from "enzyme";

import { Header } from "../Header";
import EditableInput from "../EditableInput";
import { NavItem } from "react-bootstrap";
import { Link } from "react-router";
import Admin from "../../models/Admin";
import title from "../../utils/title";

describe("Header", () => {
  let wrapper;
  let context;

  const libraryManager = new Admin([{ role: "manager", library: "nypl" }]);
  const librarian = new Admin([{ role: "librarian", library: "nypl" }]);
  const systemAdmin = new Admin([{ role: "system", library: "nypl" }]);
  const router = {
    createHref: stub(),
    push: stub(),
    isActive: stub(),
    replace: stub(),
    go: stub(),
    goBack: stub(),
    goForward: stub(),
    setRouteLeaveHook: stub(),
    getCurrentLocation: stub(),
  };
  const childContextTypes = {
    router: PropTypes.object.isRequired,
    pathFor: PropTypes.func.isRequired,
    admin: PropTypes.object.isRequired,
  };

  beforeEach(() => {
    context = { library: () => "nypl", admin: libraryManager, router };

    wrapper = shallow(<Header />, { context });
  });

  describe("rendering", () => {
    it("shows the brand name", () => {
      expect(wrapper.containsMatchingElement(<img alt={title()} />)).to.equal(
        true
      );
    });

    it("shows library dropdown when libraries are available", () => {
      let select = wrapper.find(EditableInput);
      expect(select.length).to.equal(0);

      const libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" },
      ];
      wrapper.setProps({ libraries });
      select = wrapper.find(EditableInput);
      expect(select.length).to.equal(1);
      expect(select.props().elementType).to.equal("select");
      expect(select.props().value).to.equal("nypl");
      let options = select.children();
      expect(options.length).to.equal(2);
      expect(options.at(0).text()).to.equal("NYPL");
      expect(options.at(0).props().value).to.equal("nypl");
      expect(options.at(1).text()).to.equal("bpl");
      expect(options.at(1).props().value).to.equal("bpl");

      wrapper.setContext({ library: () => "bpl", admin: libraryManager });
      select = wrapper.find(EditableInput);
      expect(select.props().value).to.equal("bpl");

      wrapper.setContext({ admin: libraryManager });
      select = wrapper.find(EditableInput);
      options = select.children();
      expect(options.length).to.equal(3);
      expect(options.at(0).text()).to.equal("Select a library");
      expect(options.at(1).text()).to.equal("NYPL");
      expect(options.at(1).props().value).to.equal("nypl");
      expect(options.at(2).text()).to.equal("bpl");
      expect(options.at(2).props().value).to.equal("bpl");
    });

    it("shows catalog links when there's a library", () => {
      let navItems = wrapper.find(NavItem);

      expect(navItems.length).to.equal(3);

      const mainNavItem = navItems.at(0);
      expect(mainNavItem.prop("href")).to.contain("/nypl%2Fgroups");
      expect(mainNavItem.children().text()).to.equal("Catalog");

      const complaintsLink = navItems.at(1);
      expect(complaintsLink.prop("href")).to.contain(
        "/nypl%2Fadmin%2Fcomplaints"
      );
      expect(complaintsLink.children().text()).to.equal("Complaints");

      const hiddenLink = navItems.at(2);
      expect(hiddenLink.prop("href")).to.contain("/nypl%2Fadmin%2Fsuppressed");
      expect(hiddenLink.children().text()).to.equal("Hidden Books");

      wrapper.setContext({ admin: libraryManager });
      navItems = wrapper.find(NavItem);
      expect(navItems.length).to.equal(0);
    });

    it("shows sitewide links, non-catalog library links, and system configuration link for library manager", () => {
      let links = wrapper.find(Link);
      expect(links.length).to.equal(4);

      const listsLink = links.at(0);
      expect(listsLink.prop("to")).to.equal("/admin/web/lists/nypl");
      expect(listsLink.children().text()).to.equal("Lists");

      const lanesLink = links.at(1);
      expect(lanesLink.prop("to")).to.equal("/admin/web/lanes/nypl");
      expect(lanesLink.children().text()).to.equal("Lanes");

      let dashboardLink = links.at(2);
      expect(dashboardLink.prop("to")).to.equal("/admin/web/dashboard/nypl");
      expect(dashboardLink.children().text()).to.equal("Dashboard");

      let settingsLink = links.at(3);
      expect(settingsLink.prop("to")).to.equal("/admin/web/config/");
      expect(settingsLink.children().text()).to.equal("System Configuration");

      // no selected library
      wrapper.setContext({ admin: libraryManager });
      links = wrapper.find(Link);
      dashboardLink = links.at(0);
      expect(dashboardLink.prop("to")).to.equal("/admin/web/dashboard/");

      settingsLink = links.at(1);
      expect(settingsLink.prop("to")).to.equal("/admin/web/config/");
    });

    it("shows sitewide, system configuration, and non-catalog library links for librarian", () => {
      wrapper.setContext({ library: () => "nypl", admin: librarian });

      const links = wrapper.find(Link);
      expect(links.length).to.equal(3);

      const listsLink = links.at(0);
      expect(listsLink.prop("to")).to.equal("/admin/web/lists/nypl");
      expect(listsLink.children().text()).to.equal("Lists");

      const dashboardLink = links.at(1);
      expect(dashboardLink.prop("to")).to.equal("/admin/web/dashboard/nypl");
      expect(dashboardLink.children().text()).to.equal("Dashboard");

      const sysConfigLink = links.at(2);
      expect(sysConfigLink.prop("to")).to.equal("/admin/web/config/");
      expect(sysConfigLink.children().text()).to.equal("System Configuration");
    });

    it("shows account dropdown when the admin has an email", () => {
      const admin = new Admin(
        [{ role: "librarian", library: "nypl" }],
        "admin@nypl.org"
      );
      wrapper.setContext({ library: () => "nypl", admin: admin, router });
      const emailBtn = wrapper.find(".account-dropdown-toggle").render();
      expect(emailBtn.length).to.equal(1);
      expect(emailBtn.text()).to.contain("admin@nypl.org");
    });

    describe("patron manager display", () => {
      it("does not show Patron Manager link for librarian", () => {
        wrapper.setContext({ library: () => "nypl", admin: librarian });
        const links = wrapper.find(Link);
        expect(links.length).to.equal(3);
        links.forEach((link) => {
          expect(link.children().text()).to.not.equal("Patrons");
        });
      });
      it("does not show Patron Manager link for library manager", () => {
        wrapper.setContext({ library: () => "nypl", admin: libraryManager });
        const links = wrapper.find(Link);
        expect(links.length).to.equal(4);
        links.forEach((link) => {
          expect(link.children().text()).to.not.equal("Patrons");
        });
      });
      it("shows Patron Manager link for system admin", () => {
        wrapper.setContext({ library: () => "nypl", admin: systemAdmin });
        const links = wrapper.find(Link);
        const patronManagerLink = links.at(3);
        expect(links.length).to.equal(6);
        expect(patronManagerLink.children().text()).to.equal("Patrons");
      });
    });
    describe("troubleshooting display", () => {
      it("does not show Troubleshooting link for librarian", () => {
        wrapper.setContext({ library: () => "nypl", admin: librarian });
        const links = wrapper.find(Link);
        expect(links.length).to.equal(3);
        links.forEach((link) => {
          expect(link.children().text()).to.not.equal("Troubleshooting");
        });
      });
      it("does not show Troubleshooting link for library manager", () => {
        wrapper.setContext({ library: () => "nypl", admin: libraryManager });
        const links = wrapper.find(Link);
        expect(links.length).to.equal(4);
        links.forEach((link) => {
          expect(link.children().text()).to.not.equal("Troubleshooting");
        });
      });
      it("shows Troubleshooting link for system admin", () => {
        wrapper.setContext({ library: () => "nypl", admin: systemAdmin });
        const links = wrapper.find(Link);
        expect(links.length).to.equal(6);
        expect(links.at(5).children().text()).to.equal("Troubleshooting");
      });
    });
  });

  describe("behavior", () => {
    it("fetches libraries on mount", () => {
      const fetchLibraries = stub();
      wrapper = shallow(<Header fetchLibraries={fetchLibraries} />, {
        context: { admin: libraryManager },
      });
      expect(fetchLibraries.callCount).to.equal(1);
    });

    it("does not fetch libraries on mount if a fetch is already in progress", () => {
      const fetchLibraries = stub();

      wrapper = shallow(
        <Header fetchLibraries={fetchLibraries} isFetchingLibraries />,
        {
          context: { admin: libraryManager },
        }
      );

      expect(fetchLibraries.callCount).to.equal(0);
    });

    it("changes library", async () => {
      const libraries = [
        { short_name: "nypl", name: "NYPL" },
        { short_name: "bpl" },
      ];
      const fullContext = Object.assign({}, context, {
        pathFor: stub().returns("url"),
        router,
        admin: libraryManager,
      });
      wrapper = mount(<Header libraries={libraries} />, {
        context: fullContext,
        childContextTypes,
      });
      const select = wrapper.find("select") as any;
      const selectElement = select.getDOMNode();
      selectElement.value = "bpl";
      select.simulate("change");

      expect(fullContext.router.push.callCount).to.equal(1);
      expect(fullContext.router.push.args[0][0]).to.equal(
        "/admin/web/collection/bpl%2Fgroups?max_cache_age=0"
      );
    });

    it("toggles account dropdown", () => {
      const admin = new Admin(
        [{ role: "librarian", library: "nypl" }],
        "admin@nypl.org"
      );
      context = { library: () => "nypl", admin, router };
      const fullContext = Object.assign({}, context, {
        pathFor: stub().returns("url"),
        router,
        admin,
      });
      wrapper = mount(<Header />, { context: fullContext, childContextTypes });

      const toggle = wrapper.find(".account-dropdown-toggle").hostNodes();
      let dropdownItems = wrapper.find("ul.dropdown-menu li");
      let dropdownLinks = wrapper.find("ul.dropdown-menu li a");
      expect(dropdownItems.length).to.equal(0);
      expect(dropdownLinks.length).to.equal(0);

      toggle.simulate("click");
      dropdownItems = wrapper.find("ul.dropdown-menu li");
      dropdownLinks = wrapper.find("ul.dropdown-menu li a");
      expect(dropdownItems.length).to.equal(3);
      expect(dropdownLinks.length).to.equal(2);

      const loggedInAs = dropdownItems.at(0);
      expect(loggedInAs.text()).to.equal("Logged in as a user");
      const changePassword = dropdownLinks.at(0);
      expect(changePassword.parent().prop("to")).to.equal(
        "/admin/web/account/"
      );
      // The first anchor element is from the Link component.
      const signOut = dropdownLinks.find("a").at(1);
      expect(signOut.prop("href")).to.equal("/admin/sign_out");

      toggle.simulate("click");
      dropdownLinks = wrapper.find("ul.dropdown-menu li");
      expect(dropdownLinks.length).to.equal(0);
    });
  });

  it("displays the user's level of permissions", () => {
    const permissions = (args) =>
      wrapper
        .instance()
        .displayPermissions(...args)
        .props.children.join("");
    expect(permissions([true, true])).to.equal("Logged in as a system admin");
    expect(permissions([true, false])).to.equal("Logged in as a system admin");
    expect(permissions([false, true])).to.equal(
      "Logged in as an administrator"
    );
    expect(permissions([false, false])).to.equal("Logged in as a user");
  });
});

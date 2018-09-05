import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import { mockRouterContext } from "./routing";
import buildStore from "../../store";

import Admin from "../../models/Admin";
import ResetAdobeId from "../ResetAdobeId";
import ManagePatronsTabContainer from "../ManagePatronsTabContainer";

describe("ManagePatronsTabContainer", () => {
  let wrapper;
  let context;
  let push;
  let store;
  let childContextTypes;

  const systemAdmin = new Admin([{ "role": "system" }]);
  const libraryManagerNYPL = new Admin([{ "role": "manager", "library": "NYPL" }]);
  const libraryManagerA = new Admin([{ "role": "manager", "library": "a" }]);
  const librarian = new Admin([{ "role": "librarian", "library": "NYPL" }]);

  describe("for system admin", () => {
    beforeEach(() => {
      store = buildStore();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = systemAdmin;
      childContextTypes = mockRouterContext(push);
      childContextTypes["admin"] = systemAdmin;
      wrapper = mount(
        <ManagePatronsTabContainer
          tab={null}
          csrfToken="token"
          store={store}
          library="NYPL"
          />,
        { context, childContextTypes }
      );
    });

    it("shows tabs", () => {
      let links = wrapper.find("ul.nav-tabs").find("a");
      let linkTexts = links.map(link => link.text());
      expect(linkTexts).to.contain("Reset Adobe ID");
    });

    it("shows components", () => {
      const componentClasses = [ResetAdobeId];
      for (const componentClass of componentClasses) {
        const component = wrapper.find(componentClass);
        expect(component.props().csrfToken).to.equal("token");
      }
    });

    it("uses router to navigate when tab is clicked", () => {
      let tabs = wrapper.find("ul.nav-tabs").find("a");
      tabs.at(0).simulate("click", { target : { dataset: { tabkey: "resetAdobeId" } } });
      expect(push.callCount).to.equal(1);
      expect(push.args[0][0]).to.equal("/admin/web/patrons/NYPL/resetAdobeId");
    });
  });

  describe("for right library manager", () => {
    beforeEach(() => {
      store = buildStore();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = libraryManagerNYPL;
      childContextTypes = mockRouterContext(push);
      childContextTypes["admin"] = libraryManagerNYPL;

      wrapper = mount(
        <ManagePatronsTabContainer
          tab={null}
          csrfToken="token"
          store={store}
          library="NYPL"
          />,
        { context, childContextTypes }
      );
    });

    it("shows tabs", () => {
      let links = wrapper.find("ul.nav-tabs").find("a");
      let linkTexts = links.map(link => link.text());
      expect(linkTexts).to.contain("Reset Adobe ID");
    });

    it("disables the link for the current tab", () => {
      let tabItems = wrapper.find("ul.nav-tabs").find("li");
      expect(tabItems.length).to.equal(1);
      expect(tabItems.at(0).props().className).to.equal("disabled");
    });

    it("shows components", () => {
      const componentClasses = [ResetAdobeId];
      for (const componentClass of componentClasses) {
        const component = wrapper.find(componentClass);
        expect(component.props().csrfToken).to.equal("token");
      }
    });

    it("uses router to navigate when tab is clicked", () => {
      let tabs = wrapper.find("ul.nav-tabs").find("a");
      tabs.at(0).simulate("click", { target : { dataset: { tabkey: "resetAdobeId" } } });
      expect(push.callCount).to.equal(1);
      expect(push.args[0][0]).to.equal("/admin/web/patrons/NYPL/resetAdobeId");
    });
  });

  describe("for wrong library manager", () => {
    beforeEach(() => {
      store = buildStore();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = libraryManagerA;
      childContextTypes = mockRouterContext(push);
      childContextTypes["admin"] = libraryManagerA;

      wrapper = mount(
        <ManagePatronsTabContainer
          tab={null}
          csrfToken="token"
          store={store}
          library="NYPL"
          />,
        { context, childContextTypes }
      );
    });

    it("doesn't show tabs", () => {
      let links = wrapper.find("ul.nav-tabs").find("a");
      let linkTexts = links.map(link => link.text());
      expect(linkTexts).not.to.contain("Reset Adobe ID");
    });
  });

  describe("for librarian", () => {
    beforeEach(() => {
      store = buildStore();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = librarian;
      childContextTypes = mockRouterContext(push);
      childContextTypes["admin"] = librarian;

      wrapper = mount(
        <ManagePatronsTabContainer
          tab={null}
          csrfToken="token"
          store={store}
          library="NYPL"
          />,
        { context, childContextTypes }
      );
    });

    it("doesn't show tabs", () => {
      let links = wrapper.find("ul.nav-tabs").find("a");
      let linkTexts = links.map(link => link.text());
      expect(linkTexts).not.to.contain("Reset Adobe ID");
    });
  });

});

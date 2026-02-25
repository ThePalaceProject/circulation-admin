import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  let queryClient: QueryClient;

  const systemAdmin = new Admin([{ role: "system" }]);
  const libraryManagerNYPL = new Admin([{ role: "manager", library: "NYPL" }]);
  const libraryManagerA = new Admin([{ role: "manager", library: "a" }]);
  const librarian = new Admin([{ role: "librarian", library: "NYPL" }]);

  describe("for system admin", () => {
    beforeEach(() => {
      store = buildStore();
      queryClient = new QueryClient();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = systemAdmin;
      childContextTypes = mockRouterContext(push);
      childContextTypes["admin"] = systemAdmin;
      wrapper = mount(
        <QueryClientProvider client={queryClient}>
          <ManagePatronsTabContainer
            tab={null}
            csrfToken="token"
            store={store}
            library="NYPL"
          />
        </QueryClientProvider>,
        { context, childContextTypes }
      );
    });

    it("shows tabs", () => {
      const links = wrapper.find("ul.nav-tabs").find("a");
      const linkTexts = links.map((link) => link.text());
      expect(linkTexts).to.contain("Reset Adobe ID");
      expect(linkTexts).to.contain("Debug Authentication");
    });

    it("shows components", () => {
      const componentClasses = [ResetAdobeId];
      for (const componentClass of componentClasses) {
        const component = wrapper.find(componentClass);
        expect(component.props().csrfToken).to.equal("token");
      }
    });

    it("uses router to navigate when tab is clicked", () => {
      const tabs = wrapper.find("ul.nav-tabs").find("a");
      tabs
        .at(0)
        .simulate("click", { target: { dataset: { tabkey: "resetAdobeId" } } });
      expect(push.callCount).to.equal(1);
      expect(push.args[0][0]).to.equal("/admin/web/patrons/NYPL/resetAdobeId");
    });
  });

  describe("for right library manager", () => {
    beforeEach(() => {
      store = buildStore();
      queryClient = new QueryClient();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = libraryManagerNYPL;
      childContextTypes = mockRouterContext(push);
      childContextTypes["admin"] = libraryManagerNYPL;

      wrapper = mount(
        <QueryClientProvider client={queryClient}>
          <ManagePatronsTabContainer
            tab={null}
            csrfToken="token"
            store={store}
            library="NYPL"
          />
        </QueryClientProvider>,
        { context, childContextTypes }
      );
    });

    it("shows tabs", () => {
      const links = wrapper.find("ul.nav-tabs").find("a");
      const linkTexts = links.map((link) => link.text());
      expect(linkTexts).to.contain("Reset Adobe ID");
      expect(linkTexts).to.contain("Debug Authentication");
    });

    it("marks the current tab as active", () => {
      const tabItems = wrapper.find("ul.nav-tabs").find("li");
      expect(tabItems.length).to.equal(2);
      expect(tabItems.at(0).props().className).to.equal("active");
    });

    it("shows components", () => {
      const componentClasses = [ResetAdobeId];
      for (const componentClass of componentClasses) {
        const component = wrapper.find(componentClass);
        expect(component.props().csrfToken).to.equal("token");
      }
    });

    it("uses router to navigate when tab is clicked", () => {
      const tabs = wrapper.find("ul.nav-tabs").find("a");
      tabs
        .at(0)
        .simulate("click", { target: { dataset: { tabkey: "resetAdobeId" } } });
      expect(push.callCount).to.equal(1);
      expect(push.args[0][0]).to.equal("/admin/web/patrons/NYPL/resetAdobeId");
    });
  });

  describe("for wrong library manager", () => {
    beforeEach(() => {
      store = buildStore();
      queryClient = new QueryClient();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = libraryManagerA;
      childContextTypes = mockRouterContext(push);
      childContextTypes["admin"] = libraryManagerA;

      wrapper = mount(
        <QueryClientProvider client={queryClient}>
          <ManagePatronsTabContainer
            tab={null}
            csrfToken="token"
            store={store}
            library="NYPL"
          />
        </QueryClientProvider>,
        { context, childContextTypes }
      );
    });

    it("doesn't show tabs", () => {
      const links = wrapper.find("ul.nav-tabs").find("a");
      const linkTexts = links.map((link) => link.text());
      expect(linkTexts).not.to.contain("Reset Adobe ID");
    });
  });

  describe("for librarian", () => {
    beforeEach(() => {
      store = buildStore();
      queryClient = new QueryClient();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = librarian;
      childContextTypes = mockRouterContext(push);
      childContextTypes["admin"] = librarian;

      wrapper = mount(
        <QueryClientProvider client={queryClient}>
          <ManagePatronsTabContainer
            tab={null}
            csrfToken="token"
            store={store}
            library="NYPL"
          />
        </QueryClientProvider>,
        { context, childContextTypes }
      );
    });

    it("doesn't show tabs", () => {
      const links = wrapper.find("ul.nav-tabs").find("a");
      const linkTexts = links.map((link) => link.text());
      expect(linkTexts).not.to.contain("Reset Adobe ID");
    });
  });
});

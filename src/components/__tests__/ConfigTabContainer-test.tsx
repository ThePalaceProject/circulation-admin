import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import buildStore from "../../store";
import ConfigTabContainer from "../ConfigTabContainer";
import Libraries from "../Libraries";
import Collections from "../Collections";
import AdminAuthServices from "../AdminAuthServices";
import IndividualAdmins from "../IndividualAdmins";
import PatronAuthServices from "../PatronAuthServices";
import SitewideSettings from "../SitewideSettings";
import MetadataServices from "../MetadataServices";
import AnalyticsServices from "../AnalyticsServices";
import CDNServices from "../CDNServices";
import SearchServices from "../SearchServices";
import StorageServices from "../StorageServices";
import CatalogServices from "../CatalogServices";
import DiscoveryServices from "../DiscoveryServices";
import { mockRouterContext } from "./routing";
import Admin from "../../models/Admin";

describe("ConfigTabContainer", () => {
  let wrapper;
  let context;
  let push;
  let store;

  const systemAdmin = new Admin([{ "role": "system" }]);
  const libraryManagerA = new Admin([{ "role": "manager", "library": "a" }]);
  const sitewideLibrarian = new Admin([{ "role": "librarian-all" }]);

  describe("for system admin", () => {
    beforeEach(() => {
      store = buildStore();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = systemAdmin;
      wrapper = mount(
        <ConfigTabContainer
          tab={null}
          csrfToken="token"
          store={store}
          editOrCreate="edit"
          identifier="identifier"
          />,
        { context }
      );
    });

    it("shows tabs", () => {
      let links = wrapper.find("ul.nav-tabs").find("a");
      let linkTexts = links.map(link => link.text());
      expect(linkTexts).to.contain("Libraries");
      expect(linkTexts).to.contain("Admins");
      expect(linkTexts).to.contain("Collections");
      expect(linkTexts).to.contain("Admin Authentication");
      expect(linkTexts).to.contain("Patron Authentication");
      expect(linkTexts).to.contain("Sitewide Settings");
      expect(linkTexts).to.contain("Metadata");
      expect(linkTexts).to.contain("CDN");
      expect(linkTexts).to.contain("External Catalogs");
    });

    it("shows components", () => {
      const componentClasses = [
        Libraries, IndividualAdmins, Collections,
        AdminAuthServices, PatronAuthServices, SitewideSettings,
        MetadataServices, AnalyticsServices, CDNServices,
        SearchServices, StorageServices, CatalogServices,
        DiscoveryServices
      ];
      for (const componentClass of componentClasses) {
        const component = wrapper.find(componentClass);
        expect(component.props().csrfToken).to.equal("token");
        expect(component.props().editOrCreate).to.equal("edit");
        expect(component.props().identifier).to.equal("identifier");
      }
    });

    it("uses router to navigate when tab is clicked", () => {
      let tabs = wrapper.find("ul.nav-tabs").find("a");
      tabs.at(1).simulate("click", { target : { dataset: { tabkey: "collections" } } });
      expect(push.callCount).to.equal(1);
      expect(push.args[0][0]).to.equal("/admin/web/config/collections");
    });
  });

  describe("for library manager", () => {
    beforeEach(() => {
      store = buildStore();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = libraryManagerA;
      wrapper = mount(
        <ConfigTabContainer
          tab={null}
          csrfToken="token"
          store={store}
          editOrCreate="edit"
          identifier="identifier"
          />,
        { context }
      );
    });

    it("shows tabs", () => {
      let links = wrapper.find("ul.nav-tabs").find("a");
      let linkTexts = links.map(link => link.text());
      expect(linkTexts).to.contain("Libraries");
      expect(linkTexts).to.contain("Admins");
      expect(linkTexts).not.to.contain("Collections");
      expect(linkTexts).not.to.contain("Admin Authentication");
      expect(linkTexts).not.to.contain("Patron Authentication");
      expect(linkTexts).not.to.contain("Sitewide Settings");
      expect(linkTexts).not.to.contain("Metadata");
      expect(linkTexts).not.to.contain("CDN");
      expect(linkTexts).not.to.contain("External Catalogs");
    });

    it("shows components", () => {
      const expectedComponentClasses = [
        Libraries, IndividualAdmins
      ];
      for (const componentClass of expectedComponentClasses) {
        const component = wrapper.find(componentClass);
        expect(component.props().csrfToken).to.equal("token");
        expect(component.props().editOrCreate).to.equal("edit");
        expect(component.props().identifier).to.equal("identifier");
      }

      const hiddenComponentClasses = [
        Collections, AdminAuthServices, PatronAuthServices, SitewideSettings,
        MetadataServices, AnalyticsServices, CDNServices,
        SearchServices, StorageServices, CatalogServices,
        DiscoveryServices
      ];
      for (const componentClass of hiddenComponentClasses) {
        const component = wrapper.find(componentClass);
        expect(component.length).to.equal(0);
      }
    });
  });

  describe("for librarian", () => {
    beforeEach(() => {
      store = buildStore();
      push = stub();
      context = mockRouterContext(push);
      context["admin"] = sitewideLibrarian;
      wrapper = mount(
        <ConfigTabContainer
          tab={null}
          csrfToken="token"
          store={store}
          editOrCreate="edit"
          identifier="identifier"
          />,
        { context }
      );
    });

    it("shows no tabs", () => {
      let links = wrapper.find("ul.nav-tabs").find("a");
      expect(links.length).to.equal(0);
    });

    it("shows no components", () => {
      const componentClasses = [
        Libraries, IndividualAdmins, Collections,
        AdminAuthServices, PatronAuthServices, SitewideSettings,
        MetadataServices, AnalyticsServices, CDNServices,
        SearchServices, StorageServices, CatalogServices,
        DiscoveryServices
      ];
      for (const componentClass of componentClasses) {
        const component = wrapper.find(componentClass);
        expect(component.length).to.equal(0);
      }
    });
  });
});

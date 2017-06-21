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
import { mockRouterContext } from "./routing";


describe("ConfigTabContainer", () => {
  let wrapper;
  let context;
  let push;
  let store;

  beforeEach(() => {
    store = buildStore();
    push = stub();
    context = mockRouterContext(push);
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
    expect(linkTexts).to.contain("Collections");
    expect(linkTexts).to.contain("Admin Authentication");
    expect(linkTexts).to.contain("Individual Admins");
    expect(linkTexts).to.contain("Patron Authentication");
    expect(linkTexts).to.contain("Sitewide Settings");
    expect(linkTexts).to.contain("Metadata");
  });

  it("shows components", () => {
    const componentClasses = [
      Libraries, Collections, AdminAuthServices,
      IndividualAdmins, PatronAuthServices, SitewideSettings,
      MetadataServices
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
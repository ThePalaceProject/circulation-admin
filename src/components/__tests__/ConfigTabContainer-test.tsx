import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import buildStore from "../../store";
import ConfigTabContainer from "../ConfigTabContainer";
import Libraries from "../Libraries";
import Collections from "../Collections";
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

  it("shows libraries and collections tabs", () => {
    let links = wrapper.find("ul.nav-tabs").find("a");
    let linkTexts = links.map(link => link.text());
    expect(linkTexts).to.contain("Libraries");
    expect(linkTexts).to.contain("Collections");
  });

  it("shows Libraries", () => {
    let libraries = wrapper.find("Libraries");
    expect(libraries.props().csrfToken).to.equal("token");
    expect(libraries.props().editOrCreate).to.equal("edit");
    expect(libraries.props().identifier).to.equal("identifier");
  });

  it("shows Collections", () => {
    let collections = wrapper.find("Collections");
    expect(collections.props().csrfToken).to.equal("token");
    expect(collections.props().editOrCreate).to.equal("edit");
    expect(collections.props().identifier).to.equal("identifier");
  });

  it("uses router to navigate when tab is clicked", () => {
    let tabs = wrapper.find("ul.nav-tabs").find("a");
    tabs.at(1).simulate("click", { target : { dataset: { tabkey: "collections" } } });
    expect(push.callCount).to.equal(1);
    expect(push.args[0][0]).to.equal("/admin/web/config/collections");
  });
});
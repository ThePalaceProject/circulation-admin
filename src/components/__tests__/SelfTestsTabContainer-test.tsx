import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub } from "sinon";
import buildStore from "../../store";

import { SelfTestsTabContainer } from "../SelfTestsTabContainer";
import SelfTestsCategory from "../SelfTestsCategory";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "../ErrorMessage";

describe("SelfTestsTabContainer", () => {
  let wrapper;
  let store;
  let goToTab;
  let fetchItems;

  const collections = [
    {
      id: 1,
      name: "collection 1",
      protocol: "protocol",
      self_test_results: {
        duration: 1.75,
        start: "2018-08-07T19:34:54Z",
        end: "2018-08-07T19:34:55Z",
        results: [
          {
            duration: 0.000119,
            end: "2018-08-07T19:34:54Z",
            exception: null,
            name: "Initial setup.",
            result: null,
            start: "2018-08-07T19:34:54Z",
            success: true,
          },
        ],
      },
    },
  ];

  beforeEach(() => {
    store = buildStore();
    fetchItems = stub();
    goToTab = stub();
    wrapper = mount(
      <SelfTestsTabContainer
        store={store}
        goToTab={goToTab}
        fetchItems={fetchItems}
        tab="collections"
        items={{ protocols: [], collections: collections }}
      />
    );
  });

  it("renders a tab container", () => {
    expect(wrapper.render().hasClass("tab-container")).to.be.true;
  });

  it("renders tabs and defaults to showing the Collections tab", () => {
    const nav = wrapper.find(".nav-tabs").at(0);
    expect(nav.length).to.equal(1);
    const tabs = nav.find("li");
    expect(tabs.length).to.equal(3);

    const collectionsTab = tabs.at(0);
    expect(collectionsTab.text()).to.equal("Collections");
    expect(collectionsTab.hasClass("active")).to.be.true;

    const patronAuthTab = tabs.at(1);
    expect(patronAuthTab.text()).to.equal("Patron Authentication");
    expect(patronAuthTab.hasClass("active")).to.be.false;

    const metadataTab = tabs.at(2);
    expect(metadataTab.text()).to.equal("Metadata Services");
    expect(metadataTab.hasClass("active")).to.be.false;
  });

  it("renders tab content", () => {
    const contentComponents = wrapper.find(".tab-content > div");
    expect(contentComponents.length).to.equal(3);
    const [
      collectionsContent,
      patronAuthContent,
      metadataContent,
    ] = contentComponents.map((c) => c.childAt(0));

    expect(collectionsContent.prop("type")).to.equal("collection");
    expect(collectionsContent.prop("items")).to.equal(collections);
    expect(collectionsContent.prop("linkName")).to.equal("collections");
    expect(collectionsContent.find(".self-tests-category").length).to.equal(1);

    expect(patronAuthContent.find(LoadingIndicator).length).to.equal(1);
    expect(metadataContent.find(LoadingIndicator).length).to.equal(1);
  });

  it("calls fetchItems on mount", () => {
    expect(fetchItems.called).to.be.true;
  });

  it("shows an error message", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);

    const fetchError = { status: 401, response: "error fetching diagnostics" };
    wrapper.setProps({ fetchError });

    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(3);
  });

  it("calls goToTab", () => {
    wrapper = shallow(
      <SelfTestsTabContainer
        goToTab={goToTab}
        tab="collections"
        store={buildStore()}
        fetchItems={fetchItems}
        items={{ protocols: [], collections: collections }}
        isLoaded={true}
      />
    );
    const tabs = wrapper.find("ul.nav-tabs").find("a");
    const patronAuthTab = tabs.at(1);
    patronAuthTab.simulate("click", {
      preventDefault: stub(),
      currentTarget: { dataset: { tabkey: "patronAuthServices" } },
    });

    expect(goToTab.callCount).to.equal(1);
    expect(goToTab.args[0][0]).to.equal("patronAuthServices");
  });

  it("switches tabs when the tab prop changes", () => {
    let collectionsTab = wrapper.find("ul.nav-tabs").find("li").at(0);
    let patronAuthTab = wrapper.find("ul.nav-tabs").find("li").at(1);
    expect(collectionsTab.hasClass("active")).to.be.true;
    expect(patronAuthTab.hasClass("active")).to.be.false;

    wrapper.setProps({ tab: "patronAuthServices" });

    collectionsTab = wrapper.find("ul.nav-tabs").find("li").at(0);
    patronAuthTab = wrapper.find("ul.nav-tabs").find("li").at(1);
    expect(collectionsTab.hasClass("active")).to.be.false;
    expect(patronAuthTab.hasClass("active")).to.be.true;
  });

  it("converts from the tab name to the key name, type name, and link name", () => {
    expect(wrapper.instance().getNames("collections")).to.eql([
      "collections",
      "collection",
      "collections",
    ]);
    expect(wrapper.instance().getNames("patronAuthServices")).to.eql([
      "patron_auth_services",
      "patron_auth_service",
      "patronAuth",
    ]);
    expect(wrapper.instance().getNames("metadataServices")).to.eql([
      "metadata_services",
      "metadata_service",
      "metadata",
    ]);
  });
});

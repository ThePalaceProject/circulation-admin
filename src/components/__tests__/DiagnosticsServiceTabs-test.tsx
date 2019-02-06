import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub, spy } from "sinon";

import DiagnosticsServiceTabs from "../DiagnosticsServiceTabs";

describe("DiagnosticsServiceTabs", () => {
  let wrapper;
  let goToTab;
  let content;

  let ts1 = {
    service: "test_service_1",
    id: "1",
    start: "start_time_string_1",
    duration: "0",
    collection_name: "collection1"
  };
  let ts2 = {
    service: "test_service_2",
    id: "2",
    start: "start_time_string_2",
    duration: "0",
    collection_name: "collection2",
    exception: "Stack trace"
  };

  content = {"test_service_1": {"collection1": [ts1]}, "test_service_2": {"collection2": [ts2]}};

  beforeEach(() => {
    goToTab = stub();

    wrapper = mount(
      <DiagnosticsServiceTabs goToTab={goToTab} content={content} tab="test_service_1" />
    );
  });

  describe("nav", () => {
    it("renders a tab for each service", () => {
      let nav = wrapper.find(".nav-tabs");
      expect(nav.length).to.equal(1);
      let tabs = nav.find("a");
      expect(tabs.length).to.equal(2);
      expect(tabs.at(0).text()).to.contain("Test_service_1");
      expect(tabs.at(1).text()).to.contain("Test_service_2");
    });

    it("displays a badge if the service contains a timestamp with an exception", () => {
      let tabWithoutException = wrapper.find(".nav-tabs").find("a").at(0);
      expect(tabWithoutException.find(".badge").length).to.equal(0);

      let tabWithException = wrapper.find(".nav-tabs").find("a").at(1);
      let badge = tabWithException.find(".badge");
      expect(badge.length).to.equal(1);
      expect(badge.text()).to.equal("!");
    });

    it("defaults to showing the first tab", () => {
      let tab1 = wrapper.find(".nav-tabs").find("li").at(0);
      let tab2 = wrapper.find(".nav-tabs").find("li").at(1);
      expect(tab1.hasClass("active")).to.be.true;
      expect(tab2.hasClass("active")).to.be.false;
    });
  });

  describe("content", () => {
    it("renders a list of timestamps, organized by collection", () => {
      let tabContent = wrapper.find(".tab-content");
      expect(tabContent.length).to.equal(1);

      let collection1 = tabContent.find(".collapsible").at(0);
      expect(collection1.find(".panel-title").at(0).text()).to.equal("collection1");
      let timestampList1 = collection1.find("ul");
      let timestamps1 = timestampList1.find(".collapsible");
      expect(timestamps1.length).to.equal(1);
      expect(timestamps1.text()).to.contain("start_time_string_1");

      let collection2 = tabContent.find(".collapsible").at(2);
      expect(collection2.find(".panel-title").at(0).text()).to.equal("collection2");
      let timestampList2 = collection2.find("ul");
      let timestamps2 = timestampList2.find(".collapsible");
      expect(timestamps2.length).to.equal(1);
      expect(timestamps2.text()).to.contain("start_time_string_2");
    });
  });

  it("switches tabs", () => {
    wrapper = shallow(
      <DiagnosticsServiceTabs goToTab={goToTab} content={content} tab="test_service_1" />
    );

    let spyHandleSelect = spy(wrapper.instance(), "handleSelect");
    wrapper.setProps({ handleSelect: spyHandleSelect });

    let tab2 = wrapper.find(".nav-tabs").find("li").at(1);
    tab2.find("a").simulate("click", { currentTarget: { dataset: { tabkey: "test_service_2" } } });

    expect(spyHandleSelect.callCount).to.equal(1);
    expect(goToTab.callCount).to.equal(1);
    expect(goToTab.args[0][0]).to.equal("test_service_2");

    spyHandleSelect.restore();
  });

});

import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub, spy } from "sinon";

import DiagnosticsServiceTabs from "../DiagnosticsServiceTabs";
import Collapsible from "../Collapsible";
import Timestamp from "../Timestamp";
import ToolTip from "../ToolTip";

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

    it("displays a badge", () => {
      let tabWithoutException = wrapper.find(".nav-tabs").find("a").at(0);
      expect(tabWithoutException.find(".danger").length).to.equal(0);
      let badge = tabWithoutException.find(".badge");
      expect(badge.length).to.equal(1);
      expect(badge.text()).to.equal("1");
      let toolTip = badge.parent().find(".tool-tip");
      expect(toolTip.length).to.equal(1);
      expect(toolTip.text()).to.equal("Total number of timestamps for this service");

      // Because test_service_2 contains a timestamp with an exception, it should display a warning.
      let tabWithException = wrapper.find(".nav-tabs").find("a").at(1);
      badge = tabWithException.find(".badge.danger");
      expect(badge.length).to.equal(1);
      expect(badge.text()).to.equal("!");
      toolTip = badge.parent().find(".tool-tip");
      expect(toolTip.length).to.equal(0);
    });

    it("defaults to showing the first tab", () => {
      let tab1 = wrapper.find(".nav-tabs").find("li").at(0);
      let tab2 = wrapper.find(".nav-tabs").find("li").at(1);
      expect(tab1.hasClass("active")).to.be.true;
      expect(tab2.hasClass("active")).to.be.false;
    });
  });

  describe("content", () => {
    it("renders collections", () => {
      let tabContent = wrapper.find(".tab-content");
      expect(tabContent.length).to.equal(1);

      let collapsibles = tabContent.find("Collapsible");

      let collection1 = collapsibles.at(0);
      expect(collection1.prop("title")).to.equal("collection1");
      expect(collection1.prop("openByDefault")).to.be.false;

      let collection2 = collapsibles.at(2);
      expect(collection2.prop("title")).to.equal("collection2");
      // Because collection2 contains a timestamp with an exception, it should start out expanded.
      expect(collection2.prop("openByDefault")).to.be.true;
    });

    it("renders timestamps", () => {
      let timestamps = wrapper.find("Timestamp");
      expect(timestamps.length).to.equal(2);

      let timestamp1 = timestamps.at(0);
      expect(timestamp1.prop("timestamp")).to.equal(ts1);

      let timestamp2 = timestamps.at(1);
      expect(timestamp2.prop("timestamp")).to.equal(ts2);
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

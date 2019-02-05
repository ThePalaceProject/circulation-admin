import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub, spy } from "sinon";

import Timestamp from "../Timestamp";

describe("Timestamp", () => {
  let wrapper;
  let ts = {
    service: "test_service_achievement",
    id: "1",
    start: "start_time_string_1",
    duration: "0",
    collection_name: "collection1",
  };
  let tsWithException = {
    service: "test_service_exception",
    id: "2",
    start: "start_time_string_2",
    duration: "0",
    collection_name: "collection2",
    exception: "Stack trace"
  };

  beforeEach(() => {
    wrapper = mount(
      <Timestamp timestamp={ts} />
    );
  });

  it("renders a collapsible", () => {
    expect(wrapper.find(".collapsible").length).to.equal(1);
  });

  it("renders the start time", () => {
    let title = wrapper.find(".panel-title");
    expect(title.length).to.equal(1);
    expect(title.text()).to.equal("start_time_string_1");
  });

  it("shows available information", () => {
    expect(wrapper.find("ul").length).to.equal(1);

    expect(wrapper.find("ul li").length).to.equal(1);
    expect(wrapper.find("ul li").text()).to.equal("Duration: 0 seconds");

    let tsWithAchievement = Object.assign(ts, {achievements: ["Ran a script"]});
    wrapper.setProps({ timestamp: tsWithAchievement });
    expect(wrapper.find("ul li").length).to.equal(2);
    expect(wrapper.find("ul li").at(1).text()).to.contain("Ran a script");
  });

  it("determines style based on whether there is an exception", () => {
    let collapsible = wrapper.find(".collapsible");
    expect(collapsible.prop("bsStyle")).to.equal("success");

    wrapper.setProps({ timestamp: tsWithException });
    collapsible = wrapper.find(".collapsible");
    expect(collapsible.prop("bsStyle")).to.equal("danger");
  });

  it("displays an exception", () => {
    wrapper.setProps({ timestamp: tsWithException });
    expect(wrapper.find(".well").length).to.equal(1);
    expect(wrapper.find(".well").text()).to.equal("Stack trace");
  });
});

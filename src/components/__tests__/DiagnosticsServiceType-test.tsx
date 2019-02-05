import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub, spy } from "sinon";
import buildStore from "../../store";

import DiagnosticsServiceType from "../DiagnosticsServiceType";

describe.only("DiagnosticsServiceType", () => {
  let wrapper;
  let services;

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
    collection_name: "collection2"
  };

  services = {"test_service_1": {"collection1": [ts1]}, "test_service_2": {"collection2": [ts2]}};

  beforeEach(() => {
    wrapper = mount(
      <DiagnosticsServiceType type="monitor" services={services} />
    );
  });

  it("renders service tabs", () => {
    expect(wrapper.hasClass("config")).to.be.true;

    let tabContainer = wrapper.find(".tab-container");
    expect(tabContainer.length).to.equal(1);

    let nav = tabContainer.find(".nav-tabs");
    expect(nav.length).to.equal(1);

    let tabs = nav.find("a");
    expect(tabs.length).to.equal(2);
    expect(tabs.at(0).text()).to.equal("Test_service_1");
    expect(tabs.at(1).text()).to.equal("Test_service_2");
  });

  it("defaults to displaying the first tab", () => {
    let tabLis = wrapper.find("li");
    expect(tabLis.at(0).hasClass("active")).to.be.true;
    expect(tabLis.at(1).hasClass("active")).to.be.false;
  });
});

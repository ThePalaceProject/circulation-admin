import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub } from "sinon";
import buildStore from "../../store";

import { DiagnosticsTabContainer } from "../DiagnosticsTabContainer";

describe("DiagnosticsTabContainer", () => {
  let wrapper;
  let store;
  let goToTab;

  let ts1 = {
    service: "test_service",
    id: "1",
    start: "start_time_string",
    duration: "0",
    collection_name: "collection1"
  };

  let collection1 = {"collection1": [ts1]};
  let test_service = { "test_service": [collection1]};
  let diagnostics = { "monitor": [test_service] };

  let fetchDiagnostics = stub();

  beforeEach(() => {
    goToTab = stub();
    wrapper = mount(
      <DiagnosticsTabContainer goToTab={goToTab} tab="coverage_provider" store={buildStore()} fetchDiagnostics={fetchDiagnostics} diagnostics={{"coverage_provider": []}}/>
    );
  });

  it("renders a tab container", () => {
    expect(wrapper.find(".tab-container").length).to.equal(1);
  });

  it("calls fetchDiagnostics on mount", () => {
    expect(fetchDiagnostics.callCount).to.equal(2);
  });

  it("renders tabs", () => {
    let nav = wrapper.find(".nav-tabs").at(0);
    expect(nav.length).to.equal(1);
    let tabs = nav.find("li");
    expect(tabs.length).to.equal(4);

    expect(tabs.at(0).text()).to.equal("Coverage Providers");
    expect(tabs.at(1).text()).to.equal("Monitors");
    expect(tabs.at(2).text()).to.equal("Scripts");
    expect(tabs.at(3).text()).to.equal("Other");
  });

  it("renders tab content", () => {
    wrapper.setProps({ diagnostics });

    let tabContent = wrapper.find(".tab-content").at(0);
    let serviceNav = tabContent.find(".tab-container");
    expect(serviceNav.length).to.equal(1);
    expect(serviceNav.html()).to.contain("test_service");
  });

  it("switches tabs", () => {
    wrapper = shallow(
      <DiagnosticsTabContainer goToTab={goToTab} tab="coverage_provider" store={buildStore()} fetchDiagnostics={fetchDiagnostics} diagnostics={diagnostics} />
    );

    let tabs = wrapper.find("ul.nav-tabs").find("a");
    let monitorTab = tabs.at(1);
    monitorTab.simulate("click", { currentTarget : { dataset: { tabkey: "monitor" } } });

    expect(goToTab.callCount).to.equal(1);
    expect(goToTab.args[0][0]).to.equal("monitor");
  });
});

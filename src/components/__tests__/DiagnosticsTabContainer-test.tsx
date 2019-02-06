import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub } from "sinon";
import buildStore from "../../store";

import { DiagnosticsTabContainer } from "../DiagnosticsTabContainer";
import DiagnosticsServiceType from "../DiagnosticsServiceType";

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

  let diagnostics = { "monitor": [{ "test_service_1": [{ "collection1": [ts1] }] }] };

  let fetchDiagnostics = stub();

  beforeEach(() => {
    goToTab = stub();
    wrapper = mount(
      <DiagnosticsTabContainer
        goToTab={goToTab}
        tab="coverage_provider"
        store={buildStore()}
        fetchDiagnostics={fetchDiagnostics}
        diagnostics={{"coverage_provider": []}}
      />
    );
  });

  describe("rendering", () => {
    it("renders a tab container", () => {
      expect(wrapper.hasClass("tab-container")).to.be.true;
    });

    it("renders tabs and defaults to showing the Coverage Providers tab", () => {
      let nav = wrapper.find(".nav-tabs").at(0);
      expect(nav.length).to.equal(1);
      let tabs = nav.find("li");
      expect(tabs.length).to.equal(4);

      let cpTab = tabs.at(0);
      expect(cpTab.text()).to.equal("Coverage Providers");
      expect(cpTab.hasClass("active")).to.be.true;

      let monitorTab = tabs.at(1);
      expect(monitorTab.text()).to.equal("Monitors");
      expect(monitorTab.hasClass("active")).to.be.false;

      let scriptTab = tabs.at(2);
      expect(scriptTab.text()).to.equal("Scripts");
      expect(scriptTab.hasClass("active")).to.be.false;

      let otherTab = tabs.at(3);
      expect(otherTab.text()).to.equal("Other");
      expect(otherTab.hasClass("active")).to.be.false;
    });

    it("renders tab content", () => {
      wrapper.setProps({ diagnostics });
      let serviceTypes = wrapper.find(DiagnosticsServiceType);
      expect(serviceTypes.length).to.equal(4);

      let cpContent = serviceTypes.at(0);
      expect(cpContent.prop("type")).to.equal("coverage_provider");
      expect(cpContent.prop("services")).to.be.undefined;

      let monitorContent = serviceTypes.at(1);
      expect(monitorContent.prop("type")).to.equal("monitor");
      expect(monitorContent.prop("services")).to.equal(wrapper.prop("diagnostics")["monitor"]);

      let scriptContent = serviceTypes.at(2);
      expect(scriptContent.prop("type")).to.equal("script");
      expect(scriptContent.prop("services")).to.be.undefined;

      let otherContent = serviceTypes.at(3);
      expect(otherContent.prop("type")).to.equal("other");
      expect(otherContent.prop("services")).to.be.undefined;
    });
  });

  describe("behavior", () => {
    it("calls fetchDiagnostics on mount", () => {
      expect(fetchDiagnostics.called).to.be.true;
    });

    it("calls goToTab", () => {
      wrapper = shallow(
        <DiagnosticsTabContainer
        goToTab={goToTab}
        tab="coverage_provider"
        store={buildStore()}
        fetchDiagnostics={fetchDiagnostics}
        diagnostics={diagnostics}
        />
      );

      let tabs = wrapper.find("ul.nav-tabs").find("a");
      let monitorTab = tabs.at(1);
      monitorTab.simulate("click", { currentTarget : { dataset: { tabkey: "monitor" } } });

      expect(goToTab.callCount).to.equal(1);
      expect(goToTab.args[0][0]).to.equal("monitor");
    });

    it("switches tabs when the tab prop changes", () => {
      let cpTab = wrapper.find("ul.nav-tabs").find("li").at(0);
      let monitorTab = wrapper.find("ul.nav-tabs").find("li").at(1);
      expect(cpTab.hasClass("active")).to.be.true;
      expect(monitorTab.hasClass("active")).to.be.false;

      wrapper.setProps({ tab: "monitor" });

      cpTab = wrapper.find("ul.nav-tabs").find("li").at(0);
      monitorTab = wrapper.find("ul.nav-tabs").find("li").at(1);
      expect(cpTab.hasClass("active")).to.be.false;
      expect(monitorTab.hasClass("active")).to.be.true;
    });
  });
});

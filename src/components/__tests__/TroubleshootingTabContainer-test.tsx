import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { stub } from "sinon";

import TroubleshootingTabContainer from "../TroubleshootingTabContainer";

describe("TroubleshootingTabContainer", () => {
  let wrapper;
  let goToTab;

  beforeEach(() => {
    goToTab = stub();
    wrapper = shallow(
      <TroubleshootingTabContainer goToTab={goToTab} tab="diagnostics" />
    );
  });

  it("renders tabs and defaults to showing the Diagnostics tab", () => {
    const nav = wrapper.find(".nav-tabs").at(0);
    expect(nav.length).to.equal(1);
    const tabs = nav.find("li");
    expect(tabs.length).to.equal(2);

    const diagnosticsTab = tabs.at(0);
    expect(diagnosticsTab.text()).to.equal("Diagnostics");
    expect(diagnosticsTab.hasClass("active")).to.be.true;

    const selfTestsTab = tabs.at(1);
    expect(selfTestsTab.text()).to.equal("Self-tests");
    expect(selfTestsTab.hasClass("active")).to.be.false;
  });

  it("calls goToTab", () => {
    const tabs = wrapper.find("ul.nav-tabs").find("a");
    const selfTestsTab = tabs.at(1);
    selfTestsTab.simulate("click", {
      preventDefault: stub(),
      currentTarget: { dataset: { tabkey: "self-tests" } },
    });

    expect(goToTab.callCount).to.equal(1);
    expect(goToTab.args[0][0]).to.equal("self-tests");
  });

  it("switches tabs when the tab prop changes", () => {
    let diagnosticsTab = wrapper.find("ul.nav-tabs").find("li").at(0);
    let selfTestsTab = wrapper.find("ul.nav-tabs").find("li").at(1);
    expect(diagnosticsTab.hasClass("active")).to.be.true;
    expect(selfTestsTab.hasClass("active")).to.be.false;

    wrapper.setProps({ tab: "self-tests" });

    diagnosticsTab = wrapper.find("ul.nav-tabs").find("li").at(0);
    selfTestsTab = wrapper.find("ul.nav-tabs").find("li").at(1);
    expect(diagnosticsTab.hasClass("active")).to.be.false;
    expect(selfTestsTab.hasClass("active")).to.be.true;
  });
});

import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import TroubleshootingCategoryPage from "../TroubleshootingCategoryPage";
import DiagnosticsTabContainer from "../DiagnosticsTabContainer";
import SelfTestsTabContainer from "../SelfTestsTabContainer";
import buildStore from "../../store";

describe("TroubleshootingCategoryPage", () => {
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = { editorStore: store, csrfToken: "token" };
    wrapper = shallow(<TroubleshootingCategoryPage type="diagnostics" />, { context });
  });

  it("renders a tab container", () => {
    let container = wrapper.find(DiagnosticsTabContainer);
    expect(container.length).to.equal(1);
  });

  it("switches tabs", () => {
    expect(wrapper.state()["tab"]).to.equal("coverage_provider");
    expect(wrapper.find(DiagnosticsTabContainer).prop("tab")).to.equal("coverage_provider");

    wrapper.instance().goToTab("monitor");

    expect(wrapper.state()["tab"]).to.equal("monitor");
    expect(wrapper.find(DiagnosticsTabContainer).prop("tab")).to.equal("monitor");
  });

  it("renders a different tab container", () => {
    wrapper.setProps({ type: "self-tests" });
    expect(wrapper.find(DiagnosticsTabContainer).length).to.equal(0);
    expect(wrapper.find(SelfTestsTabContainer).length).to.equal(1);
  });
});

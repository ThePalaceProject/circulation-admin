import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import DiagnosticsPage from "../DiagnosticsPage";
import DiagnosticsTabContainer from "../DiagnosticsTabContainer";
import Header from "../Header";
import buildStore from "../../store";

describe("DiagnosticsPage", () => {
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = { editorStore: store, csrfToken: "token" };

    wrapper = shallow(<DiagnosticsPage />, { context });
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

  it("sets the document title", () => {
    let title = (global as any).window.document.title;
    expect(title).to.equal("Circulation Manager - Diagnostics");
  });

});

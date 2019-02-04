import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";

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

  it("renders a Header", () => {
    let header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });

  it("renders a heading", () => {
    let heading = wrapper.find("h1");
    expect(heading.length).to.equal(1);
    expect(heading.text()).to.equal("Diagnostics");
  });

  it("renders a tab container", () => {
    let container = wrapper.find(DiagnosticsTabContainer);
    expect(container.length).to.equal(1);
  });

  it("sets the document title", () => {
    let title = (global as any).window.document.title;
    expect(title).to.equal("Circulation Manager - Diagnostics");
  });
});

import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import TroubleshootingPage from "../TroubleshootingPage";
import TroubleshootingTabContainer from "../TroubleshootingTabContainer";
import Header from "../Header";
import Footer from "../Footer";
import buildStore from "../../store";
import title from "../../utils/title";

describe("TroubleshootingPage", () => {
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = { editorStore: store, csrfToken: "token" };
    wrapper = shallow(
      <TroubleshootingPage params={{ tab: "", subtab: "" }} />,
      { context }
    );
  });

  it("renders a header", () => {
    const header = wrapper.find(Header);
    expect(header.length).to.equal(1);
  });

  it("renders a heading", () => {
    const heading = wrapper.find("h2");
    expect(heading.text()).to.equal("Troubleshooting");
  });

  it("renders a tab container", () => {
    expect(wrapper.find(TroubleshootingTabContainer).length).to.equal(1);
  });

  it("switches tabs", () => {
    it("switches tabs", () => {
      expect(wrapper.state()["tab"]).to.equal("diagnostics");
      expect(wrapper.find(TroubleshootingTabContainer).prop("tab")).to.equal(
        "diagnostics"
      );

      wrapper.instance().goToTab("self-tests");

      expect(wrapper.state()["tab"]).to.equal("self-tests");
      expect(wrapper.find(TroubleshootingTabContainer).prop("tab")).to.equal(
        "self-tests"
      );
    });
  });

  it("sets the document title", () => {
    const documentTitle = (global as any).window.document.title;
    expect(documentTitle).to.equal(title("Troubleshooting"));
  });

  it("shows Footer", () => {
    const footer = wrapper.find(Footer);
    expect(footer.length).to.equal(1);
  });
});

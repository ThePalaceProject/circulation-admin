import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import buildStore from "../../store";
import { TabContainer, TabContainerProps } from "../TabContainer";
import { mockRouterContext } from "./routing";

describe("TabContainer", () => {
  let wrapper;
  let context;
  let push;
  let store;
  let handleSelect;
  let tabs;

  class MockTabContainer extends TabContainer<TabContainerProps> {
    handleSelect(event) {
      handleSelect(event);
    }
    tabs() {
      return tabs();
    }
  }

  beforeEach(() => {
    store = buildStore();
    push = stub();
    context = mockRouterContext(push);
    handleSelect = stub();
    tabs = stub().returns({
      tab1: (
         <div className="tab1"></div>
      ),
      tab2: (
        <div className="tab2"></div>
      )
    });
    wrapper = mount(
      <MockTabContainer
        tab={null}
        csrfToken="token"
        store={store}
        >
        <div className="test-child">Moby Dick</div>
      </MockTabContainer>,
      { context }
    );
  });

  it("shows nav tabs", () => {
    let links = wrapper.find("ul.nav-tabs").find("li");
    let linkTexts = links.map(link => link.text());
    expect(linkTexts).to.contain("Tab1");
    expect(linkTexts).to.contain("Tab2");
    expect(links.at(0).props().className).to.equal("active");
    expect(links.at(1).props().className).to.equal(null);
  });

  it("shows default tab content", () => {
    let tab1 = wrapper.find(".tab1");
    expect(tab1.parent().props().style.display).to.equal("block");

    let tab2 = wrapper.find(".tab2");
    expect(tab2.parent().props().style.display).to.equal("none");
  });

  it("shows tab content from tab in props", () => {
    wrapper.setProps({ tab: "tab2" });

    let tab1 = wrapper.find(".tab1");
    expect(tab1.parent().props().style.display).to.equal("none");

    let tab2 = wrapper.find(".tab2");
    expect(tab2.parent().props().style.display).to.equal("block");
  });

  it("uses handleSelect to navigate when tab is clicked", () => {
    let tabs = wrapper.find("ul.nav-tabs").find("a");
    tabs.at(1).simulate("click", { target : { dataset: { tabkey: "tab2" } } });
    expect(handleSelect.callCount).to.equal(1);
    let event = handleSelect.args[0][0];
    expect(event.target.dataset.tabkey).to.equal("tab2");
  });
});
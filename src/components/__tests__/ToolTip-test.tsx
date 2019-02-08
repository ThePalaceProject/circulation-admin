import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";
import { spy } from "sinon";
import ToolTip from "../ToolTip";

describe("ToolTip", () => {
  let wrapper;
  let trigger;

  beforeEach(() => {
    trigger = <h1>Hover</h1>;
    wrapper = shallow(
      <ToolTip trigger={trigger} text="ToolTip Content" />
    );
  });

  it("renders the trigger element", () => {
    let trigger = wrapper.find("h1");
    expect(trigger.length).to.equal(1);
    expect(trigger.text()).to.equal("Hover");
  });

  it("renders the tooltip", () => {
    let tooltip = wrapper.find(".tool-tip");
    expect(tooltip.length).to.equal(1);
    expect(tooltip.text()).to.equal("ToolTip Content");
  });

  it("initially hides the tooltip", () => {
    expect(wrapper.state()["show"]).to.be.false;
    expect(wrapper.find(".tool-tip").hasClass("hide")).to.be.true;
  });

  it("shows the tooltip on mouseEnter", () => {
    let spyShow = spy(wrapper.instance(), "show");
    wrapper.setProps({ show: spyShow });

    wrapper.simulate("mouseEnter");

    expect(spyShow.callCount).to.equal(1);
    expect(wrapper.find(".tool-tip").hasClass("hide")).to.be.false;
    expect(wrapper.state()["show"]).to.be.true;

    spyShow.restore();
  });

  it("hides the tooltip on mouseLeave", () => {
    wrapper.setState({ show: true });
    expect(wrapper.find(".tool-tip").hasClass("hide")).to.be.false;

    let spyHide = spy(wrapper.instance(), "hide");
    wrapper.setProps({ hide: spyHide });

    wrapper.simulate("mouseLeave");

    expect(spyHide.callCount).to.equal(1);
    expect(wrapper.find(".tool-tip").hasClass("hide")).to.be.true;
    expect(wrapper.state()["show"]).to.be.false;

    spyHide.restore();
  });
});

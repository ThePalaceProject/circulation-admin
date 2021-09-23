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
    wrapper = shallow(<ToolTip trigger={trigger} text="ToolTip Content" />);
  });

  it("renders the trigger element", () => {
    const trigger = wrapper.find("h1");
    expect(trigger.length).to.equal(1);
    expect(trigger.text()).to.equal("Hover");
  });

  it("renders the tooltip", () => {
    const tooltip = wrapper.find(".tool-tip");
    expect(tooltip.length).to.equal(1);
    expect(tooltip.prop("dangerouslySetInnerHTML")["__html"]).to.equal(
      "ToolTip Content"
    );
    expect(tooltip.html()).to.include("ToolTip Content");
  });

  it("initially hides the tooltip", () => {
    expect(wrapper.state()["show"]).to.be.false;
    expect(wrapper.find(".tool-tip").hasClass("hide")).to.be.true;
  });

  it("shows the tooltip on mouseEnter", () => {
    const spyShowToolTip = spy(wrapper.instance(), "showToolTip");
    wrapper.setProps({ show: spyShowToolTip });

    wrapper.simulate("mouseEnter");

    expect(spyShowToolTip.callCount).to.equal(1);
    expect(wrapper.find(".tool-tip").hasClass("hide")).to.be.false;
    expect(wrapper.state()["show"]).to.be.true;

    spyShowToolTip.restore();
  });

  it("hides the tooltip on mouseLeave", () => {
    wrapper.setState({ show: true });
    expect(wrapper.find(".tool-tip").hasClass("hide")).to.be.false;

    const spyHideToolTip = spy(wrapper.instance(), "hideToolTip");
    wrapper.setProps({ hide: spyHideToolTip });

    wrapper.simulate("mouseLeave");

    expect(spyHideToolTip.callCount).to.equal(1);
    expect(wrapper.find(".tool-tip").hasClass("hide")).to.be.true;
    expect(wrapper.state()["show"]).to.be.false;

    spyHideToolTip.restore();
  });
});

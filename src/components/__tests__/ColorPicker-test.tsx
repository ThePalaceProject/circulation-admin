import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";
import ColorPicker from "../ColorPicker";
import { CompactPicker } from "react-color";

describe("ColorPicker", () => {
  let wrapper;
  const setting = {
    key: "key",
    label: "label",
  };

  beforeEach(() => {
    wrapper = shallow(<ColorPicker setting={setting} value="#123456" />);
  });

  it("should show the compact picker", () => {
    const picker = wrapper.find(CompactPicker);
    expect(picker.length).to.equal(1);
    expect(picker.props().color).to.equal("#123456");
  });

  it("should have a hidden input with the value", () => {
    const input = wrapper.find("input");
    expect(input.props().type).to.equal("hidden");
    expect(input.props().name).to.equal("key");
    expect(input.props().value).to.equal("#123456");
  });

  it("should change the value", () => {
    expect(wrapper.instance().getValue()).to.equal("#123456");
    const picker = wrapper.find(CompactPicker);
    const handleChange = picker.props().onChangeComplete;
    handleChange({ hex: "#abcdef" }, null);
    expect(wrapper.instance().getValue()).to.equal("#abcdef");
  });
});

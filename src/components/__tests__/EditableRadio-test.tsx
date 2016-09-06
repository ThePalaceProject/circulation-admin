import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import EditableRadio from "../EditableRadio";

describe("EditableRadio", () => {
  let wrapper;
  let onChange;

  beforeEach(() => {
    onChange = stub();
    wrapper = mount(
      <EditableRadio
        type="text"
        label="label"
        name="name"
        disabled={false}
        checked={true}
        onChange={onChange}
        />
    );
  });

  it("shows label from props", () => {
    expect(wrapper.text()).to.equal(" label");
  });

  it("shows initial checked from props", () => {
    expect(wrapper.state("checked")).to.equal(true);
    let input = wrapper.find("input");
    expect(input.prop("checked")).to.equal(true);
  });

  it("updates state when props change", () => {
    wrapper.setProps({ checked: false });
    expect(wrapper.state("checked")).to.equal(false);
    let input = wrapper.find("input");
    expect(input.prop("checked")).to.equal(false);
  });

  it("updates checked in state when input changes", () => {
    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.checked = false;
    input.simulate("change");
    expect(wrapper.state("checked")).to.equal(false);
  });

  it("disables", () => {
    wrapper.setProps({ disabled: true });
    let input = wrapper.find("input");
    expect(input.prop("disabled")).to.equal(true);
  });

  it("calls provided onChange", () => {
    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.checked = false;
    input.simulate("change");
    expect(onChange.callCount).to.equal(1);
  });

  it("clears input", () => {
    wrapper = mount(
      <EditableRadio
        label="label"
        name="name"
        disabled={false}
        value="value"
        checked={true}
        />
    );

    wrapper.instance().clear();
    expect(wrapper.state("checked")).to.equal(false);
    let inputElement = wrapper.find("input").get(0) as any;
    expect(inputElement.checked).to.equal(false);
  });
});
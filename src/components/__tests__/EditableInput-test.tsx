import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import EditableInput from "../EditableInput";

describe("EditableInput", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value">
        <option>option</option>
      </EditableInput>
    );
  });

  it("shows label from props", () => {
    let label = wrapper.find("label");
    expect(label.text()).to.equal("label");
  });

  it("shows initial value from props", () => {
    expect(wrapper.state().value).to.equal("initial value");
    let input = wrapper.find("input");
    expect(input.prop("value")).to.equal("initial value");
  });

  it("shows children from props", () => {
    let option = wrapper.find("option");
    expect(option.text()).to.equal("option");
  });

  it("updates state and value when props change", () => {
    wrapper.setProps({ value: "new value" });
    expect(wrapper.state().value).to.equal("new value");
    let input = wrapper.find("input");
    expect(input.prop("value")).to.equal("new value");
  });

  it("updates value in state when input changes", () => {
    let wrapper = mount(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );
    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.value = "new value";
    input.simulate("change");
    expect(wrapper.state().value).to.equal("new value");
  });

  it("disables", () => {
    let wrapper = mount(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={true}
        value="initial value"
        />
    );
    let input = wrapper.find("input");
    expect(input.prop("disabled")).to.equal(true);
  });

  it("calls provided onChange", () => {
    let onChange = stub();
    let wrapper = mount(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={true}
        value="initial value"
        onChange={onChange}
        />
    );

    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.value = "new value";
    input.simulate("change");
    expect(onChange.callCount).to.equal(1);
  });

  it("clears input", () => {
    wrapper = mount(
      <EditableInput
        elementType="input"
        type="text"
        label="label"
        name="name"
        disabled={false}
        value="initial value"
        />
    );

    (wrapper.instance() as EditableInput).clear();
    expect(wrapper.state("value")).to.equal("");
    let inputElement = wrapper.find("input").get(0) as any;
    expect(inputElement.value).to.equal("");
  });
});
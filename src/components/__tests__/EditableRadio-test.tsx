jest.autoMockOff();

import * as React from "react";
import { mount } from "enzyme";

import EditableRadio from "../EditableRadio";

describe("EditableRadio", () => {
  let wrapper;
  let onChange;

  beforeEach(() => {
    onChange = jest.genMockFunction();
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
    expect(wrapper.text()).toBe(" label");
  });

  it("shows initial checked from props", () => {
    expect(wrapper.state("checked")).toBe(true);
    let input = wrapper.find("input");
    expect(input.prop("checked")).toBe(true);
  });

  it("updates state when props change", () => {
    wrapper.setProps({ checked: false });
    expect(wrapper.state("checked")).toBe(false);
    let input = wrapper.find("input");
    expect(input.prop("checked")).toBe(false);
  });

  it("updates checked in state when input changes", () => {
    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.checked = false;
    input.simulate("change");
    expect(wrapper.state("checked")).toBe(false);
  });

  it("disables", () => {
    wrapper.setProps({ disabled: true });
    let input = wrapper.find("input");
    expect(input.prop("disabled")).toBe(true);
  });

  it("calls provided onChange", () => {
    let input = wrapper.find("input");
    let inputElement = input.get(0) as any;
    inputElement.checked = false;
    input.simulate("change");
    expect(onChange.mock.calls.length).toBe(1);
  });
});
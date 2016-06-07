jest.autoMockOff();

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
    expect(label.text()).toBe("label");
  });

  it("shows initial value from props", () => {
    expect(wrapper.state().value).toBe("initial value");
    let input = wrapper.find("input");
    expect(input.prop("value")).toBe("initial value");
  });

  it("shows children from props", () => {
    let option = wrapper.find("option");
    expect(option.text()).toEqual("option");
  });

  it("updates state and value when props change", () => {
    wrapper.setProps({ value: "new value" });
    expect(wrapper.state().value).toBe("new value");
    let input = wrapper.find("input");
    expect(input.prop("value")).toBe("new value");
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
    expect(wrapper.state().value).toBe("new value");
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
    expect(input.prop("disabled")).toBe(true);
  });

  it("calls provided onChange", () => {
    let onChange = jest.genMockFunction();
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
    expect(onChange.mock.calls.length).toBe(1);
  });
});
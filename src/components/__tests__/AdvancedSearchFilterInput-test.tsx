import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import { fields, operators } from "../AdvancedSearchBuilder";
import AdvancedSearchFilterInput from "../AdvancedSearchFilterInput";

describe("AdvancedSearchFilterInput", () => {
  let wrapper;
  let onAdd;

  beforeEach(() => {
    onAdd = stub();

    wrapper = mount(<AdvancedSearchFilterInput name="include" onAdd={onAdd} />);
  });

  it("should render radio buttons for field selection", () => {
    const radioButtons = wrapper.find('input[type="radio"]');

    expect(radioButtons).to.have.length(fields.length);

    fields.forEach((field, index) => {
      expect(radioButtons.at(index).prop("value")).to.equal(field.value);
    });
  });

  it("should render a select with options for operator selection", () => {
    const options = wrapper.find("select > option");

    expect(options).to.have.length(operators.length);

    operators.forEach((op, index) => {
      expect(options.at(index).prop("value")).to.equal(op.value);
    });
  });

  it("should render a text input for value entry", () => {
    const valueInput = wrapper.find('input[type="text"]');

    expect(valueInput).to.have.length(1);
  });

  it("should render an Add Filter button", () => {
    const button = wrapper.find("button");

    expect(button).to.have.length(1);
    expect(button.text()).to.equal("Add filter");
  });

  it("should disable the Add Filter button when the value is blank", () => {
    const valueInput = wrapper.find('input[type="text"]');
    const button = wrapper.find("button");

    expect(button.getDOMNode().disabled).to.equal(true);

    valueInput.getDOMNode().value = "   ";
    valueInput.simulate("change");

    expect(button.getDOMNode().disabled).to.equal(true);

    valueInput.getDOMNode().value = "hello";
    valueInput.simulate("change");

    expect(button.getDOMNode().disabled).to.equal(false);
  });

  it("should call onAdd when the Add Filter button is clicked", () => {
    const valueInput = wrapper.find('input[type="text"]');
    const button = wrapper.find("button");

    valueInput.getDOMNode().value = "hello";
    valueInput.simulate("change");

    button.simulate("click");

    expect(onAdd.callCount).to.equal(1);

    expect(onAdd.args[0]).to.deep.equal([
      {
        key: "genre",
        op: "eq",
        value: "hello",
      },
    ]);
  });

  it("should trim whitespace from the value", () => {
    const valueInput = wrapper.find('input[type="text"]');
    const button = wrapper.find("button");

    valueInput.getDOMNode().value = "\thello  ";
    valueInput.simulate("change");

    button.simulate("click");

    expect(onAdd.callCount).to.equal(1);

    expect(onAdd.args[0]).to.deep.equal([
      {
        key: "genre",
        op: "eq",
        value: "hello",
      },
    ]);
  });
});

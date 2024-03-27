import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import { fields, operators } from "../AdvancedSearchBuilder";
import AdvancedSearchFilterInput from "../AdvancedSearchFilterInput";

describe("AdvancedSearchFilterInput", () => {
  let wrapper;
  let onAdd;
  let onClearFiltersFlagChange;

  beforeEach(() => {
    onAdd = stub();
    onClearFiltersFlagChange = stub();

    wrapper = mount(
      <AdvancedSearchFilterInput
        name="include"
        onAdd={onAdd}
        onClearFiltersFlagChange={onClearFiltersFlagChange}
      />
    );
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

  it("should restrict the operator selection, if the filter requests it", () => {
    const fictionRadioButton = wrapper.find(
      'input[type="radio"][value="fiction"]'
    );
    fictionRadioButton.getDOMNode().checked = true;
    fictionRadioButton.simulate("change");

    const options = wrapper.find(".filter-operator select > option");
    const fictionField = fields.find((element) => {
      return element.value === "fiction";
    });

    expect(options).to.have.length(fictionField.operators.length);
  });

  it("should render a text input for value entry", () => {
    const valueSelect = wrapper.find(".filter-value select");
    const valueInput = wrapper.find('.filter-value input[type="text"]');

    expect(valueSelect).to.have.length(0);
    expect(valueInput).to.have.length(1);
  });

  it("should render a select for value selection, if the filter requests it", () => {
    const fictionRadioButton = wrapper.find(
      'input[type="radio"][value="fiction"]'
    );
    fictionRadioButton.getDOMNode().checked = true;
    fictionRadioButton.simulate("change");

    const valueSelect = wrapper.find(".filter-value select");
    const valueInput = wrapper.find('.filter-value input[type="text"]');

    expect(valueSelect).to.have.length(1);
    expect(valueInput).to.have.length(0);
  });

  it("should clear the current value when changing the filter", () => {
    const valueInput = wrapper.find(".filter-value input");

    valueInput.getDOMNode().value = "ABC";
    valueInput.simulate("change");

    const filterRadioButton = wrapper.find(
      'input[type="radio"][value="data_source"]'
    );

    filterRadioButton.getDOMNode().checked = true;
    filterRadioButton.simulate("change");

    expect(valueInput.getDOMNode().value).to.equal("");
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

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

  it("should render select with field names for field selection", () => {
    const fieldControl = wrapper.find(".filter-key select > option");

    expect(fieldControl).to.have.length(fields.length);

    fields.forEach((field, index) => {
      expect(fieldControl.at(index).prop("value")).to.equal(field.value);
    });
  });

  it("should render a select with options for operator selection", () => {
    const options = wrapper.find(".filter-operator select > option");

    expect(options).to.have.length(operators.length);

    operators.forEach((op, index) => {
      expect(options.at(index).prop("value")).to.equal(op.value);
    });
  });

  it("should restrict the operator selection, if the filter requests it", () => {
    // Select the fiction field key.
    const filterKeyControl = wrapper.find(".filter-key select");
    filterKeyControl.getDOMNode().value = "fiction";
    filterKeyControl.simulate("change");

    // Look up the fiction field operator values.
    const options = wrapper.find(".filter-operator select > option");
    const fictionField = fields.find((element) => {
      return element.value === "fiction";
    });

    // And make sure the number of options is correct.
    expect(options).to.have.length(fictionField.operators.length);
    options.forEach((option, index) => {
      expect(option.prop("value")).to.equal(fictionField.operators[index]);
    });
  });

  it("should use the currently selected operator when changing filters", () => {
    const filterKeyControl = wrapper.find(".filter-key select");
    const filterKeyDomNode = filterKeyControl.getDOMNode();

    const chooseFilterKey = (value: string) => {
      filterKeyDomNode.value = value;
      filterKeyControl.simulate("change");
    };

    const fictionField = fields.find((element) => {
      return element.value === "fiction";
    });

    const operatorOptions = wrapper.find(".filter-operator select");
    operatorOptions.getDOMNode().value = "regex";
    operatorOptions.simulate("change");

    // Select data source/Distributor as the filter key.
    chooseFilterKey("data_source");
    expect(operatorOptions.getDOMNode().value).to.equal("regex");

    // But the "regex" operator is not supported by the "fiction" field`,
    // so we switch to fiction's first available operator.
    chooseFilterKey("fiction");
    expect(operatorOptions.getDOMNode().value).to.equal(
      fictionField.operators[0]
    );

    // Since data source/distributor supports fiction's first operator,
    // we'll continue to use it when changing back to that field.
    chooseFilterKey("data_source");
    expect(operatorOptions.getDOMNode().value).to.equal(
      fictionField.operators[0]
    );
  });

  it("should render a text input for value entry", () => {
    const valueSelect = wrapper.find(".filter-value select");
    const valueInput = wrapper.find('.filter-value input[type="text"]');

    expect(valueSelect).to.have.length(0);
    expect(valueInput).to.have.length(1);
  });

  it("should render a select for value selection, if the filter requests it", () => {
    const filterKeyControl = wrapper.find(".filter-key select");
    const filterKeyDomNode = filterKeyControl.getDOMNode();

    const chooseFilterKey = (value: string) => {
      filterKeyDomNode.value = value;
      filterKeyControl.simulate("change");
    };

    chooseFilterKey("fiction");

    const valueSelect = wrapper.find(".filter-value select");
    const valueInput = wrapper.find('.filter-value input[type="text"]');

    expect(valueSelect).to.have.length(1);
    expect(valueInput).to.have.length(0);
  });

  it("should clear the current value when changing the filter", () => {
    const filterKeyControl = wrapper.find(".filter-key select");
    const filterKeyDomNode = filterKeyControl.getDOMNode();

    const chooseFilterKey = (value: string) => {
      filterKeyDomNode.value = value;
      filterKeyControl.simulate("change");
    };

    const valueInput = wrapper.find(".filter-value input");

    valueInput.getDOMNode().value = "ABC";
    valueInput.simulate("change");

    chooseFilterKey("data_source");

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

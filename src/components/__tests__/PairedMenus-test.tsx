import { expect, assert } from "chai";
import { spy } from "sinon";

import * as React from "react";
import { mount } from "enzyme";
import PairedMenus from "../PairedMenus";
import InputList from "../InputList";

describe("PairedMenus", () => {
  let wrapper;
  let inputListSetting;
  let dropdownSetting;
  beforeEach(() => {
    inputListSetting = {
      key: "input",
      label: "Input List",
      default: ["a", "b", "c"],
      options: [
        { key: "a", label: "A" },
        { key: "b", label: "B" },
        { key: "c", label: "C" },
        { key: "d", label: "D" },
        { key: "e", label: "E" },
      ],
      paired: "dropdown",
    };
    dropdownSetting = {
      key: "dropdown",
      label: "Dropdown",
      default: "b",
      options: [
        { key: "a", label: "A" },
        { key: "b", label: "B" },
        { key: "c", label: "C" },
        { key: "d", label: "D" },
        { key: "e", label: "E" },
      ],
      type: "select",
    };
    wrapper = mount(
      <PairedMenus
        inputListSetting={inputListSetting}
        dropdownSetting={dropdownSetting}
        disabled={false}
      />
    );
  });
  const menuOptions = () => {
    return inputListSetting.options.map((o) => (
      <option key={o.key} value={o.label} aria-selected={false} />
    ));
  };
  it("renders a fieldset with an InputList and a dropdown", () => {
    const fieldset = wrapper.find("fieldset");
    expect(fieldset.length).to.equal(1);
    expect(fieldset.find(InputList).length).to.equal(1);
    expect(fieldset.find("select").at(1).prop("name")).to.equal("dropdown");
  });
  it("passes down the inputListSetting prop", () => {
    const inputList = wrapper.find(InputList);
    const modifiedSetting = {
      ...inputListSetting,
      ...{ format: "narrow", type: "menu", menuOptions: menuOptions },
    };
    Object.keys(inputList.prop("setting")).forEach(
      (k) =>
        k !== "menuOptions" &&
        expect(inputList.prop("setting")[k]).to.eql(modifiedSetting[k])
    );
    inputList
      .find("input")
      .forEach((x) => expect(x.props().readOnly).to.be.true);
    menuOptions().forEach((o, idx) => {
      expect(o.key).to.equal(inputList.prop("setting").menuOptions[idx].key);
      expect(o.value).to.equal(
        inputList.prop("setting").menuOptions[idx].value
      );
    });
  });
  it("passes down the dropdownSetting prop", () => {
    const dropdown = wrapper.find("select").at(1);
    expect(dropdown.prop("name")).to.equal(dropdownSetting.key);
    expect(dropdown.prop("value")).to.equal(dropdownSetting.default);
    menuOptions().forEach((o, idx) => {
      if (idx > wrapper.state().inputListValues.length - 1) {
        return;
      }
      expect(o.key).to.equal(dropdown.children().at(idx).props().value);
      expect(o.props.value).to.equal(
        dropdown.children().at(idx).props().children
      );
    });
  });
  it("optionally disables the InputList's button", () => {
    let inputList = wrapper.find(InputList);
    expect(inputList.prop("disableButton")).not.to.be.true;
    wrapper.setProps({ readOnly: true });
    inputList = wrapper.find(InputList);
    expect(inputList.prop("disableButton")).to.be.true;
  });
  it("calculates state", () => {
    expect(wrapper.state().inputListValues).to.eql(inputListSetting.default);
    expect(wrapper.state().dropdownValue).to.equal(dropdownSetting.default);
  });
  it("takes an optional item prop", () => {
    const item = {
      name: "Library",
      short_name: "lib",
      uuid: "123",
      settings: {
        input: ["c", "d", "e"],
        dropdown: "d",
      },
    };
    wrapper = mount(
      <PairedMenus
        inputListSetting={inputListSetting}
        dropdownSetting={dropdownSetting}
        disabled={false}
        item={item}
      />
    );
    expect(wrapper.state().inputListValues).to.eql(item.settings.input);
    expect(wrapper.state().dropdownValue).to.equal(item.settings.dropdown);

    const inputList = wrapper.find(InputList);
    expect(inputList.find("input").map((x) => x.props().value)).to.eql(
      item.settings.input.map((x) => x.toUpperCase())
    );
    expect(inputList.find("input").map((x) => x.props().name)).to.eql(
      item.settings.input.map((x) => `input_${x}`)
    );

    const dropdown = wrapper.find("select").at(1);
    expect(dropdown.props().value).to.equal(item.settings.dropdown);
  });
  it("updates the InputList", () => {
    const spyUpdateInputList = spy(wrapper.instance(), "updateInputList");
    wrapper.setProps({ updateInputList: spyUpdateInputList });
    wrapper.find(InputList).prop("onChange")({
      listItems: ["a", "b", "c", "d"],
    });
    expect(spyUpdateInputList.callCount).to.equal(1);
    expect(spyUpdateInputList.args[0][0]).to.eql({
      listItems: ["a", "b", "c", "d"],
    });
    expect(wrapper.state().inputListValues).to.eql(["a", "b", "c", "d"]);
    spyUpdateInputList.restore();
  });
  it("updates the dropdown", () => {
    const spyOnDropdownChange = spy(wrapper.instance(), "onDropdownChange");
    wrapper.setProps({ onDropdownChange: spyOnDropdownChange });
    wrapper.find("select").at(1).getDOMNode().value = "c";
    wrapper.find("select").at(1).simulate("change");
    expect(spyOnDropdownChange.callCount).to.equal(1);
    expect(spyOnDropdownChange.args[0][0]).to.equal("c");
    expect(wrapper.state().dropdownValue).to.equal("c");
    spyOnDropdownChange.restore();
  });
  it("calculates the dropdown options based on the InputList values", () => {
    let dropdownOptions = wrapper
      .find("select")
      .at(1)
      .find("option")
      .map((o) => o.text());
    expect(dropdownOptions).to.eql(["A", "B", "C"]);
    wrapper.instance().updateInputList({ listItems: ["d", "e"] });
    wrapper.update();
    dropdownOptions = wrapper
      .find("select")
      .at(1)
      .find("option")
      .map((o) => o.text());
    expect(dropdownOptions).to.eql(["D", "E"]);
  });
  it("displays a message if there are no values available in the dropdown", () => {
    wrapper.setState({ inputListValues: [] });
    expect(wrapper.find("select").length).to.equal(1);
    expect(wrapper.find(".bg-warning").length).to.equal(1);
    expect(wrapper.find(".bg-warning").text()).to.equal(
      "In order to set this value, you must add at least one option from the menu above."
    );
  });
});

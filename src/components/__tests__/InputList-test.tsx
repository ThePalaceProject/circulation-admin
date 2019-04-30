import { expect } from "chai";
import * as React from "react";
import { mount } from "enzyme";
import { spy, stub } from "sinon";
import buildStore from "../../store";

import InputList from "../InputList";
import ProtocolFormField from "../ProtocolFormField";
import EditableInput from "../EditableInput";
import WithRemoveButton from "../WithRemoveButton";
import ToolTip from "../ToolTip";
import LanguageField from "../LanguageField";

describe("InputList", () => {
  let wrapper;
  let store;
  let context;
  let value = ["Thing 1", "Thing 2"];
  let setting = {
    key: "setting",
    label: "label",
    description: "description",
    type: "list"
  };
  let parent;
  let createEditableInput;
  let labelAndDescription;

  beforeEach(() => {
    store = buildStore();
    context = { editorStore: store };
    parent = mount(<ProtocolFormField setting={setting} disabled={false} />);
    createEditableInput = spy(parent.instance(), "createEditableInput");
    labelAndDescription = spy(parent.instance(), "labelAndDescription");

    wrapper = mount(
      <InputList
        createEditableInput={createEditableInput}
        labelAndDescription={labelAndDescription}
        value={value}
        setting={setting}
        disabled={false}
      />
    , { context });
  });

  it("renders a label and description", () => {
    expect(labelAndDescription.callCount).to.equal(1);
    expect(labelAndDescription.args[0][0]).to.deep.equal(setting);
    let label = wrapper.find("label");
    expect(label.length).to.equal(1);
    expect(label.text()).to.equal("label");

    let description = wrapper.find(".description").at(0);
    expect(description.text()).to.equal("description");
  });

  it("renders a list of items", () => {
    let inputs = wrapper.find(".form-control");
    expect(inputs.length).to.equal(3);
    expect(inputs.at(0).prop("value")).to.equal("Thing 1");
    expect(inputs.at(0).prop("type")).to.equal("text");
    expect(inputs.at(0).prop("name")).to.equal("setting");

    expect(inputs.at(1).prop("value")).to.equal("Thing 2");
    expect(inputs.at(1).prop("type")).to.equal("text");
    expect(inputs.at(1).prop("name")).to.equal("setting");

    expect(inputs.at(2).prop("value")).to.equal("");
    expect(inputs.at(2).prop("type")).to.equal("text");
    expect(inputs.at(2).prop("name")).to.equal("setting");

    expect(createEditableInput.callCount).to.equal(3);
  });

  it("renders WithRemoveButton elements", () => {
    let withRemoveButtons = wrapper.find(WithRemoveButton);
    expect(withRemoveButtons.length).to.equal(2);
    expect(withRemoveButtons.at(0).prop("disabled")).to.be.false;
    expect(withRemoveButtons.at(0).find("input").prop("value")).to.equal("Thing 1");
    expect(withRemoveButtons.at(1).prop("disabled")).to.be.false;
    expect(withRemoveButtons.at(1).find("input").prop("value")).to.equal("Thing 2");
  });

  it("renders a button for adding a list item", () => {
    let addListItem = wrapper.find("span.add-list-item");
    expect(addListItem.length).to.equal(1);
    expect(addListItem.find("input").prop("value")).to.equal("");
    expect(addListItem.parent().find(WithRemoveButton).length).to.equal(0);
    expect(addListItem.parent().find("button").text()).to.equal("Add");
  });

  it("optionally renders a geographic tooltip with extra content", () => {
    let valueWithObject = [{"Thing 3": "extra information!"}];
    let geographicSetting = {...setting, ...{format: "geographic"}};
    let spyToolTip = spy(wrapper.instance(), "renderToolTip");

    wrapper.setProps({ setting: geographicSetting, value: valueWithObject });

    let withAddOn = wrapper.find(".with-add-on");
    expect(withAddOn.length).to.equal(1);

    let addOn = withAddOn.find(".input-group-addon");
    expect(addOn.length).to.equal(1);
    let toolTipElement = addOn.find(ToolTip);
    expect(toolTipElement.length).to.equal(1);
    expect(toolTipElement.find("svg").hasClass("locatorIcon")).to.be.true;
    expect(toolTipElement.find(".tool-tip").hasClass("point-right")).to.be.true;
    expect(toolTipElement.find(".tool-tip").text()).to.equal("extra information!");

    expect(withAddOn.find("input").length).to.equal(1);
    expect(withAddOn.find("input").prop("value")).to.equal("Thing 3");
    expect(spyToolTip.args[0]).to.eql([valueWithObject[0], "geographic"]);
  });

  it("renders an autocomplete field for languages", () => {
    let valueWithObject = ["abc"];
    let languageSetting = {...setting, ...{format: "language-code"}};
    let languages = {
      "eng": ["English"],
      "spa": ["Spanish", "Castilian"]
    };
    wrapper.setProps({ setting: languageSetting, value: valueWithObject, additionalData: languages });
    let languageField = wrapper.find(LanguageField);
    expect(languageField.length).to.equal(2);

    expect(languageField.at(0).prop("value")).to.equal("abc");
    expect(languageField.at(0).prop("name")).to.equal("setting");
    expect(languageField.at(0).prop("languages")).to.equal(languages);

    expect(languageField.at(1).prop("value")).to.be.undefined;
    expect(languageField.at(1).prop("name")).to.equal("setting");
    expect(languageField.at(1).prop("languages")).to.equal(languages);
  });

  it("removes an item", () => {
    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);
    let button = removables.at(0).find(".remove");
    button.simulate("click");
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(1);
  });

  it("adds a regular item", () => {
    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    let blankInput = wrapper.find("span.add-list-item input");
    blankInput.get(0).value = "Another thing...";
    blankInput.simulate("change");
    let addButton = wrapper.find("button.add-list-item");
    addButton.simulate("click");

    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(3);

    blankInput = wrapper.find("span.add-list-item input");
    expect(blankInput.prop("value")).to.equal("");
  });

  it("adds an autocompleted item", () => {
    let languageSetting = {...setting, ...{format: "language-code"}};
    wrapper.setProps({ setting: languageSetting, value: ["abc"] });

    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(1);
    let autocomplete = wrapper.find("[list='setting-autocomplete-list']").at(1);
    autocomplete.get(0).value = "Another language";
    autocomplete.simulate("change");
    let addButton = wrapper.find("button.add-list-item");
    addButton.simulate("click");

    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);
    autocomplete = wrapper.find("[list='setting-autocomplete-list']").at(2);
    expect(autocomplete.prop("value")).to.equal("");
  });

  it("does not add an empty input item", () => {
    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);
    expect(wrapper.state()["newItem"]).to.equal("");

    let empty = wrapper.find("span.add-list-item input");
    let addButton = wrapper.find("button.add-list-item");
    expect(addButton.prop("disabled")).to.be.true;
    addButton.simulate("click");
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    empty = wrapper.find("span.add-list-item input");
    empty.get(0).value = "something new";
    empty.simulate("change");
    addButton = wrapper.find("button.add-list-item");
    expect(wrapper.state()["newItem"]).to.equal("something new");
    expect(addButton.prop("disabled")).not.to.be.true;
    addButton.simulate("click");
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(3);
    expect(addButton.prop("disabled")).to.be.true;
  });

  it("gets the value", () => {
    expect((wrapper.instance() as InputList).getValue()).to.eql(value);
  });

  it("clears all the items", () => {
    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    (wrapper.instance() as InputList).clear();
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(0);
  });
});

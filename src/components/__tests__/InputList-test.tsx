import { expect } from "chai";
import * as React from "react";
import { mount } from "enzyme";
import { stub, spy } from "sinon";
import { Button } from "library-simplified-reusable-components";
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
  const value = ["Thing 1", "Thing 2"];
  const setting = {
    key: "setting",
    label: "label",
    description: "description",
    type: "list",
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
      />,
      { context }
    );
  });

  it("renders a label and description", () => {
    expect(labelAndDescription.callCount).to.equal(1);
    expect(labelAndDescription.args[0][0]).to.deep.equal(setting);
    const label = wrapper.find("label");
    expect(label.length).to.equal(1);
    expect(label.text()).to.equal("label");

    const description = wrapper.find(".description").at(0);
    expect(description.text()).to.equal("description");
  });

  it("renders a list of items", () => {
    const inputs = wrapper.find(".form-control");
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

  it("optionally renders links", () => {
    const urlBase = (itemName) => {
      return `admin/web/${itemName}`;
    };
    const settingWithUrlBase = { ...setting, ...{ urlBase } };
    wrapper.setProps({ setting: settingWithUrlBase });
    const links = wrapper.find("a");
    expect(links.length).to.equal(2);
    links.forEach((l, idx) => {
      expect(l.text()).to.equal(`Thing ${idx + 1}`);
      expect(l.prop("href")).to.equal(`admin/web/Thing ${idx + 1}`);
    });
  });

  it("renders WithRemoveButton elements", () => {
    const withRemoveButtons = wrapper.find(WithRemoveButton);
    expect(withRemoveButtons.length).to.equal(2);
    expect(withRemoveButtons.at(0).prop("disabled")).to.be.false;
    expect(withRemoveButtons.at(0).find("input").prop("value")).to.equal(
      "Thing 1"
    );
    expect(withRemoveButtons.at(1).prop("disabled")).to.be.false;
    expect(withRemoveButtons.at(1).find("input").prop("value")).to.equal(
      "Thing 2"
    );
  });

  it("optionally disables the remove buttons", () => {
    wrapper.setProps({ disableButton: true });
    const withRemoveButtons = wrapper.find(WithRemoveButton);
    expect(withRemoveButtons.length).to.equal(2);
    expect(withRemoveButtons.at(0).prop("disabled")).to.be.true;
    expect(withRemoveButtons.at(0).find("button").prop("disabled")).to.be.true;
    expect(withRemoveButtons.at(1).prop("disabled")).to.be.true;
    expect(withRemoveButtons.at(1).find("button").prop("disabled")).to.be.true;
  });

  it("renders a button for adding a list item", () => {
    const addListItemContainer = wrapper.find(".add-list-item-container");
    const addListItem = addListItemContainer.find("span.add-list-item");
    expect(addListItem.length).to.equal(1);
    expect(addListItem.find("input").prop("value")).to.equal("");
    expect(addListItemContainer.find(WithRemoveButton).length).to.equal(0);
    expect(addListItemContainer.find("button.add-list-item").text()).to.equal(
      "Add"
    );
  });

  it("optionally renders a geographic tooltip with extra content", () => {
    const valueWithObject = [{ "Thing 3": "extra information!" }];
    const geographicSetting = { ...setting, ...{ format: "geographic" } };
    const spyToolTip = spy(wrapper.instance(), "renderToolTip");

    wrapper.setProps({ setting: geographicSetting, value: valueWithObject });

    const withAddOn = wrapper.find(".with-add-on");
    expect(withAddOn.length).to.equal(1);

    const addOn = withAddOn.find(".input-group-addon");
    expect(addOn.length).to.equal(1);
    const toolTipElement = addOn.find(ToolTip);
    expect(toolTipElement.length).to.equal(1);
    expect(toolTipElement.find("svg").hasClass("locatorIcon")).to.be.true;
    expect(toolTipElement.find(".tool-tip").hasClass("point-right")).to.be.true;
    expect(toolTipElement.find(".tool-tip").text()).to.equal(
      "extra information!"
    );

    expect(withAddOn.find("input").length).to.equal(1);
    expect(withAddOn.find("input").prop("value")).to.equal("Thing 3");
    expect(spyToolTip.args[0]).to.eql([valueWithObject[0], "geographic"]);
  });

  it("renders an autocomplete field for languages", () => {
    const valueWithObject = ["abc"];
    const languageSetting = { ...setting, ...{ format: "language-code" } };
    const languages = {
      eng: ["English"],
      spa: ["Spanish", "Castilian"],
    };
    wrapper.setProps({
      setting: languageSetting,
      value: valueWithObject,
      additionalData: languages,
    });
    const languageField = wrapper.find(LanguageField);
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
    const button = removables.at(0).find(".remove-btn").hostNodes();
    button.simulate("click");
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(1);
  });

  it("adds a regular item", async () => {
    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    let blankInput = wrapper.find("span.add-list-item input");
    blankInput.getDOMNode().value = "Another thing...";
    blankInput.simulate("change");
    const addButton = wrapper.find("button.add-list-item");
    addButton.simulate("click");
    await new Promise((resolve) => setTimeout(resolve, 0));

    wrapper.update();
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(3);

    blankInput = wrapper.find("span.add-list-item input");
    expect(blankInput.prop("value")).to.equal("");
  });

  it("adds and capitalizes an item", async () => {
    wrapper.setProps({
      setting: { ...wrapper.prop("setting"), ...{ capitalize: true } },
    });
    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    let blankInput = wrapper.find("span.add-list-item input");
    blankInput.getDOMNode().value = "new york";
    blankInput.simulate("change");
    const addButton = wrapper.find("button.add-list-item");
    addButton.simulate("click");
    await new Promise((resolve) => setTimeout(resolve, 0));

    wrapper.update();
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(3);
    expect(removables.at(2).find(EditableInput).prop("value")).to.equal(
      "New York"
    );
    expect(wrapper.state()["listItems"][2]).to.equal("New York");

    blankInput = wrapper.find("span.add-list-item input");
    expect(blankInput.prop("value")).to.equal("");
  });

  it("capitalizes a string", () => {
    wrapper.setProps({
      setting: { ...wrapper.prop("setting"), ...{ format: "geographic" } },
    });
    const cap = wrapper.instance().capitalize;
    // Capitalizes one word
    expect(cap("california")).to.equal("California");
    // Capitalizes multiple words
    expect(cap("new jersey")).to.equal("New Jersey");
    // Capitalizes two-letter state/province abbreviations
    expect(cap("fl")).to.equal("FL");
    // Handles mixed words and abbreviations
    expect(cap("new york city, ny")).to.equal("New York City, NY");
  });

  it("adds an autocompleted item", async () => {
    const languageSetting = { ...setting, format: "language-code" };
    wrapper.setProps({ setting: languageSetting, value: ["abc"] });

    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(1);
    let autocomplete = wrapper
      .find("input[list='setting-autocomplete-list']")
      .at(1);
    autocomplete.getDOMNode().value = "Another language";
    autocomplete.simulate("change");
    const addButton = wrapper.find("button.add-list-item");
    addButton.simulate("click");
    await new Promise((resolve) => setTimeout(resolve, 0));
    wrapper.update();

    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);
    autocomplete = wrapper
      .find("input[list='setting-autocomplete-list']")
      .at(2);
    expect(autocomplete.prop("value")).to.equal("");
  });

  it("does not add an empty input item", () => {
    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);
    expect(wrapper.state()["newItem"]).to.equal("");

    let addButton = wrapper.find("button.add-list-item");
    expect(addButton.prop("disabled")).to.be.true;
    addButton.simulate("click");
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    const empty = wrapper.find("span.add-list-item input");
    empty.getDOMNode().value = "something new";
    empty.simulate("change");
    addButton = wrapper.find("button.add-list-item");
    expect(wrapper.state()["newItem"]).to.equal("something new");
    expect(addButton.prop("disabled")).not.to.be.true;
    addButton.simulate("click");

    removables = wrapper.find(WithRemoveButton);
    addButton = wrapper.find("button.add-list-item");
    expect(removables.length).to.equal(3);
    expect(addButton.prop("disabled")).to.be.true;
  });

  it("optionally accepts an onChange prop", async () => {
    const onChange = stub();
    wrapper.setProps({ onChange });
    expect(onChange.callCount).to.equal(0);
    wrapper.instance().addListItem();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onChange.callCount).to.equal(1);
    expect(onChange.args[0][0]).to.equal(wrapper.state());
    wrapper.instance().removeListItem("test");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onChange.callCount).to.equal(2);
    expect(onChange.args[1][0]).to.equal(wrapper.state());
  });

  it("optionally accepts a readOnly prop", () => {
    wrapper.setProps({ readOnly: true });
    expect(wrapper.find(EditableInput).at(0).prop("readOnly")).to.be.true;
    expect(wrapper.find(EditableInput).at(1).prop("readOnly")).to.be.true;
  });

  it("gets the value", () => {
    expect((wrapper.instance() as InputList).getValue()).to.eql(value);
  });

  it("clears all the items", () => {
    let removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(2);

    (wrapper.instance() as InputList).clear();
    wrapper.update();
    removables = wrapper.find(WithRemoveButton);
    expect(removables.length).to.equal(0);
  });
  describe("dropdown menu", () => {
    let options;
    beforeEach(() => {
      options = [];
      while (options.length < 3) {
        const optionName = `Option ${options.length + 1}`;
        options.push(
          <option value={optionName} aria-selected={false}>
            {optionName}
          </option>
        );
      }
      const menuSetting = {
        ...setting,
        ...{ type: "menu", menuOptions: options, description: null },
      };
      wrapper = mount(
        <InputList
          createEditableInput={createEditableInput}
          labelAndDescription={labelAndDescription}
          value={value}
          setting={menuSetting}
          disabled={false}
        />,
        { context }
      );
    });
    it("renders a dropdown menu", () => {
      const menu = wrapper.find("select");
      expect(menu.length).to.equal(1);
      const menuOptions = menu.find("option");
      expect(menuOptions.length).to.equal(3);
      menuOptions.forEach((o, idx) => {
        expect(o.text()).to.equal(`Option ${idx + 1}`);
      });
    });
    it("adds an item from the menu", () => {
      let removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(2);
      expect(wrapper.state()["listItems"].includes("Option 1")).to.be.false;
      const menu = wrapper.find("select");
      expect(menu.getDOMNode().value).to.equal("Option 1");
      const addButton = wrapper.find(Button).last();
      addButton.simulate("click");
      removables = wrapper.find(WithRemoveButton);
      expect(removables.length).to.equal(3);
      expect(removables.last().find(EditableInput).prop("value")).to.equal(
        "Option 1"
      );
      expect(wrapper.state()["listItems"].includes("Option 1")).to.be.true;
    });
    it("optionally eliminates already-selected options from the menu", () => {
      let options = wrapper.find("option");
      expect(options.length).to.equal(3);
      expect(options.map((o) => o.text()).includes("Option 1")).to.be.true;
      wrapper.find(Button).last().simulate("click");
      options = wrapper.find("option");
      expect(options.length).to.equal(3);
      expect(options.map((o) => o.text()).includes("Option 1")).to.be.true;

      const narrowSetting = {
        ...wrapper.prop("setting"),
        ...{ format: "narrow" },
      };
      wrapper.setProps({ setting: narrowSetting });

      wrapper.find(Button).last().simulate("click");
      options = wrapper.find("option");
      expect(options.length).to.equal(2);
      expect(options.map((o) => o.text()).includes("Option 1")).to.be.false;
    });
    it("optionally renders a label", () => {
      const settingWithLabel = {
        ...wrapper.prop("setting"),
        ...{ menuTitle: "Custom Menu Title" },
      };
      wrapper.setProps({ setting: settingWithLabel });
      const label = wrapper.find("select").closest("label");
      expect(label.text()).to.contain("Custom Menu Title");
    });
    it("optionally marks the menu as required", () => {
      let requiredText = wrapper.find(".required-field");
      expect(requiredText.length).to.equal(0);
      const requiredSetting = {
        ...wrapper.prop("setting"),
        ...{ menuTitle: "title", required: true },
      };
      wrapper.setProps({ setting: requiredSetting });
      requiredText = wrapper.find(".required-field");
      expect(requiredText.length).to.equal(1);
      expect(requiredText.text()).to.equal("Required");
    });
    it("optionally renders an alternate value if there are no list items", () => {
      let placeholder = wrapper.find(".input-list > span");
      expect(placeholder.length).to.equal(0);
      wrapper.setProps({ altValue: "No list items!" });
      placeholder = wrapper.find(".input-list > span");
      // There are still list items, so the placeholder isn't rendered yet.
      expect(placeholder.length).to.equal(0);
      wrapper.setProps({ value: [] });
      placeholder = wrapper.find(".input-list > span");
      expect(placeholder.length).to.equal(1);
      expect(placeholder.text()).to.equal("No list items!");
    });
    it("optionally renders an alternate value if all the available list items have already been added", () => {
      wrapper.setProps({
        value: ["Option 1", "Option 2", "Option 3"],
        onEmpty: "You've run out of options!",
        setting: { ...wrapper.prop("setting"), ...{ format: "narrow" } },
      });
      wrapper.update();
      const menu = wrapper.find("select");
      expect(menu.length).to.equal(0);
      const message = wrapper.find(".add-list-item-container span");
      expect(message.text()).to.equal("You've run out of options!");
    });
    it("renders option elements if necessary", () => {
      // If the setting does not have a menuOptions property (e.g. because it has come from the server without being modified),
      // InputList will use its options property to generate the dropdown menu with basic default values.
      const options = [
        { key: "key_1", label: "label_1" },
        { key: "key_2", label: "label_2" },
      ];
      const setting = {
        ...wrapper.prop("setting"),
        ...{ options: options, menuOptions: null },
      };
      wrapper = mount(
        <InputList
          createEditableInput={createEditableInput}
          labelAndDescription={labelAndDescription}
          value={value}
          setting={setting}
          disabled={false}
        />,
        { context }
      );
      const select = wrapper.find("select");
      expect(select.length).to.equal(1);
      expect(select.find("option").at(0).prop("value")).to.equal("key_1");
      expect(select.find("option").at(0).text()).to.equal("label_1");
      expect(select.find("option").at(1).prop("value")).to.equal("key_2");
      expect(select.find("option").at(1).text()).to.equal("label_2");
    });
    it("renders the default values", () => {
      const setting = {
        ...wrapper.prop("setting"),
        ...{ default: ["Option 1", "Option 2"] },
      };
      wrapper = mount(
        <InputList
          createEditableInput={createEditableInput}
          labelAndDescription={labelAndDescription}
          value={null}
          setting={setting}
          disabled={false}
        />,
        { context }
      );
      const defaultItems = wrapper.find(EditableInput);
      expect(defaultItems.length).to.equal(3);
      expect(defaultItems.at(0).prop("value")).to.equal("Option 1");
      expect(defaultItems.at(1).prop("value")).to.equal("Option 2");
    });
  });
});

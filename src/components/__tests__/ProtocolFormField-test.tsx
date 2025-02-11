import { expect } from "chai";

import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import { stub } from "sinon";

import ProtocolFormField from "../ProtocolFormField";
import EditableInput from "../EditableInput";
import InputList from "../InputList";
import ColorPicker from "../ColorPicker";
import { Button } from "library-simplified-reusable-components";

describe("ProtocolFormField", () => {
  describe("When visible...", () => {
    const setting = {
      key: "setting",
      label: "label",
      description: "<p>description</p>",
    };
    let wrapper;

    beforeEach(() => {
      wrapper = mount(<ProtocolFormField setting={setting} disabled={false} />);
    });

    it("renders text setting", () => {
      let input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("type")).to.equal("text");
      expect(input.prop("disabled")).to.equal(false);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(input.prop("description")).to.equal("<p>description</p>");
      expect(input.prop("value")).to.be.undefined;

      wrapper.setProps({ value: "test", disabled: true });
      input = wrapper.find(EditableInput);
      expect(input.prop("disabled")).to.equal(true);
      expect(input.prop("value")).to.equal("test");
      const inputElement = input.find("input").getDOMNode();
      expect(inputElement.value).to.equal("test");

      (wrapper.instance() as ProtocolFormField).clear();
      expect(inputElement.value).to.equal("");
    });

    it("renders date-picker setting", () => {
      const datePickerSetting = { ...setting, ...{ type: "date-picker" } };
      wrapper.setProps({ setting: datePickerSetting });
      let input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("type")).to.equal("date");
      expect(input.prop("disabled")).to.equal(false);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(input.prop("description")).to.equal("<p>description</p>");
      expect(input.prop("value")).to.be.undefined;

      wrapper.setProps({ value: "2020-10-13", disabled: true });
      input = wrapper.find(EditableInput);
      expect(input.prop("disabled")).to.equal(true);
      expect(input.prop("value")).to.equal("2020-10-13");
      const inputElement = input.find("input").getDOMNode();
      expect(inputElement.value).to.equal("2020-10-13");

      (wrapper.instance() as ProtocolFormField).clear();
      expect(inputElement.value).to.equal("");
    });

    it("renders optional setting", () => {
      const optionalSetting = { ...setting, ...{ optional: true } };
      wrapper.setProps({ setting, optionalSetting });

      const input = wrapper.find(EditableInput);
      const description = wrapper.find(".description");
      expect(input.length).to.equal(1);
      expect(input.prop("disabled")).to.equal(false);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(description.text()).to.equal("(Optional) description");
    });

    it("renders randomizable setting", () => {
      const randomizableSetting = { ...setting, ...{ randomizable: true } };
      wrapper.setProps({ setting: randomizableSetting });

      let input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("disabled")).to.equal(false);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("value")).to.be.undefined;
      let button = wrapper.find(Button);
      expect(button.length).to.equal(1);
      expect(button.prop("disabled")).to.equal(false);
      expect(button.text()).to.contain("random");

      button.simulate("click");
      expect((wrapper.instance() as ProtocolFormField).getValue()).to.be.ok;
      expect(
        (wrapper.instance() as ProtocolFormField).getValue().length
      ).to.equal(32);

      wrapper.setProps({ value: "test" });
      input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("value")).to.equal("test");
      button = wrapper.find("button");
      expect(button.length).to.equal(0);
    });

    it("renders setting with default", () => {
      const defaultSetting = { ...setting, ...{ default: "default" } };
      wrapper.setProps({ setting: defaultSetting });
      let input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("value")).to.equal("default");

      wrapper.setProps({ value: "test" });
      input = wrapper.find(EditableInput);
      expect(input.prop("value")).to.equal("test");
    });

    it("renders number setting", () => {
      const numberSetting = { ...setting, ...{ type: "number" } };
      wrapper.setProps({ setting: numberSetting });
      let input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("validation")).to.equal("number");
      expect(input.prop("disabled")).to.equal(false);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(input.prop("description")).to.equal("<p>description</p>");
      expect(input.prop("value")).to.be.undefined;

      wrapper.setProps({ value: "test" });
      input = wrapper.find(EditableInput);
      expect(input.prop("value")).to.equal("test");
    });

    it("renders select setting", () => {
      const selectSetting = {
        ...setting,
        ...{
          type: "select",
          options: [
            { key: "option1", label: "option 1" },
            { key: "option2", label: "option 2" },
          ],
        },
      };
      wrapper.setProps({ setting: selectSetting });

      const input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("disabled")).to.equal(false);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(input.prop("value")).to.be.undefined;
      const children = input.find("option");
      expect(children.length).to.equal(2);
      expect(children.at(0).prop("value")).to.equal("option1");
      expect(children.at(0).text()).to.contain("option 1");
      expect(children.at(1).prop("value")).to.equal("option2");
      expect(children.at(1).text()).to.contain("option 2");
    });

    it("renders textarea setting", () => {
      const textareaSetting = {
        ...setting,
        ...{ type: "textarea", description: "<p>Textarea</p>" },
      };
      wrapper.setProps({ setting: textareaSetting });

      let input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      const inputElement = input.find("textarea").at(0) as any;
      expect(inputElement.length).to.equal(1);
      expect(inputElement.text()).to.equal("");
      expect(input.prop("type")).to.equal("text");
      expect(input.prop("disabled")).to.equal(false);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(input.prop("description")).to.equal("<p>Textarea</p>");
      expect(input.prop("value")).to.be.undefined;

      wrapper.setProps({ value: "test" });
      input = wrapper.find(EditableInput);
      expect(input.prop("value")).to.equal("test");
      expect(inputElement.text()).to.equal("test");

      (wrapper.instance() as ProtocolFormField).clear();
      expect(inputElement.text()).to.equal("");
    });

    it("renders menu setting", () => {
      let inputList = wrapper.find(InputList);
      expect(inputList.length).to.equal(0);
      const menuSetting = {
        ...setting,
        ...{
          type: "menu",
          menuOptions: ["A", "B", "C"].map((x) => (
            <option key={x} aria-selected={false}>
              {x}
            </option>
          )),
        },
      };
      wrapper.setProps({
        setting: menuSetting,
        value: [],
        altValue: "Alternate",
        readOnly: true,
        disableButton: true,
      });
      inputList = wrapper.find(InputList);
      expect(inputList.length).to.equal(1);
      expect(inputList.prop("setting")).to.equal(menuSetting);
      expect(inputList.prop("altValue")).to.equal("Alternate");
      expect(inputList.find("select").length).to.equal(1);
      expect(inputList.prop("readOnly")).to.be.true;
      expect(inputList.prop("disableButton")).to.be.true;
    });

    it("renders image setting", () => {
      const imageSetting = { ...setting, ...{ type: "image" } };
      wrapper.setProps({ setting: imageSetting });

      let input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("type")).to.equal("file");
      expect(input.prop("disabled")).to.equal(false);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(input.prop("description")).to.equal("<p>description</p>");
      expect(input.prop("value")).to.be.undefined;
      expect(input.prop("accept")).to.equal("image/*");
      let label = wrapper.find("label");
      expect(label.text()).to.equal("label");

      wrapper.setProps({ value: "image data" });
      input = wrapper.find(EditableInput);
      expect(input.prop("value")).to.be.undefined;
      label = wrapper.find("label");
      expect(label.text()).to.equal("label");
      const img = wrapper.find("img");
      expect(img.prop("src")).to.equal("image data");
    });

    it("renders color picker setting", () => {
      const colorPickerSetting = {
        ...setting,
        ...{ type: "color-picker", default: "#aaaaaa" },
      };
      wrapper.setProps({ setting: colorPickerSetting });

      let picker = wrapper.find(ColorPicker);
      expect(picker.length).to.equal(1);
      expect(picker.prop("setting")).to.equal(colorPickerSetting);
      expect(picker.prop("value")).to.equal("#aaaaaa");
      const label = wrapper.find("label").at(0);
      expect(label.text()).to.equal("label");

      wrapper.setProps({ value: "#222222" });
      picker = wrapper.find(ColorPicker);
      expect(picker.prop("value")).to.equal("#222222");
    });

    it("gets value of list setting without options", () => {
      wrapper.setProps({
        setting: { ...setting, ...{ type: "list" } },
        value: ["item 1", "item 2"],
      });
      expect(
        (wrapper.instance() as ProtocolFormField).getValue()
      ).to.deep.equal(["item 1", "item 2"]);
    });

    it("optionally renders instructions", () => {
      const instructionsSetting = {
        ...setting,
        ...{ instructions: "<ul><li>Step 1</li></ul>", type: "list" },
      };
      wrapper.setProps({ setting: instructionsSetting });

      const instructions = wrapper.find(".well");
      expect(instructions.length).to.equal(1);
      expect(instructions.hasClass("description")).to.be.true;
      expect(instructions.text()).to.equal("Step 1");
    });

    it("optionally accepts an onChange prop", () => {
      const onChange = stub();
      wrapper.setProps({ onChange });
      const element = wrapper.find(EditableInput);
      expect(element.prop("onChange")).to.equal(onChange);
      const setting = { ...wrapper.prop("setting"), ...{ type: "list" } };
      wrapper.setProps({ setting });
      const inputList = wrapper.find(InputList);
      expect(inputList.prop("onChange")).to.equal(onChange);
    });

    it("optionally accepts a readOnly prop", () => {
      const setting = { ...wrapper.prop("setting"), ...{ type: "list" } };
      wrapper.setProps({ setting: setting, readOnly: true });
      const inputList = wrapper.find(InputList);
      expect(inputList.prop("readOnly")).to.be.true;
    });

    it("gets value of text setting", () => {
      wrapper.setProps({ value: "test" });
      expect((wrapper.instance() as ProtocolFormField).getValue()).to.equal(
        "test"
      );
    });
  });

  describe("When hidden...", () => {
    // For the hidden settings, the values are passed in the `settings` object.
    const setting = {
      hidden: true,
      key: "setting",
      label: "label",
      description: "<p>description</p>",
    };
    let wrapper: ReactWrapper;

    const expectHiddenValue = (value: any): ReactWrapper => {
      const hiddenDiv = wrapper.findWhere(
        (node) => node.type() === "div" && node.prop("style") !== undefined
      );

      expect(
        (wrapper.instance() as ProtocolFormField).getValue()
      ).to.deep.equal(value);
      return hiddenDiv;
    };

    beforeEach(() => {
      wrapper = mount(<ProtocolFormField setting={setting} disabled={false} />);
    });

    it("renders hidden text setting", () => {
      wrapper.setProps({ value: "test" });

      const hiddenDiv = expectHiddenValue("test");
      const input = hiddenDiv.find(EditableInput);
      const inputElement = input.find("input").getDOMNode();

      expect(input.prop("value")).to.equal("test");
      expect(inputElement.value).to.equal("test");
      expect(wrapper.instance().getValue()).to.equal("test");
    });

    it("renders hidden date-picker setting", () => {
      const datePickerSetting = { ...setting, type: "date-picker" };
      wrapper.setProps({ setting: datePickerSetting, value: "2020-10-13" });

      expectHiddenValue("2020-10-13");
    });

    it("renders hidden randomizable setting", () => {
      const randomizableSetting = { ...setting, randomizable: true };
      wrapper.setProps({ setting: randomizableSetting, value: "test" });

      expectHiddenValue("test");
    });

    it("renders hidden setting with default", () => {
      const defaultSetting = { ...setting, default: "default" };
      wrapper.setProps({ setting: defaultSetting, value: undefined });

      expectHiddenValue("default");
    });

    it("renders hidden number setting", () => {
      const numberSetting = { ...setting, type: "number" };
      wrapper.setProps({ setting: numberSetting });

      let hiddenDiv = expectHiddenValue("");

      let input = hiddenDiv.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("validation")).to.equal("number");
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("value")).to.be.undefined;

      wrapper.setProps({ setting: numberSetting, value: "42" });
      hiddenDiv = expectHiddenValue("42");
      input = hiddenDiv.find(EditableInput);
      expect(input.prop("value")).to.equal("42");
    });

    it("renders hidden select setting", () => {
      const selectSetting = {
        ...setting,
        type: "select",
        options: [
          { key: "option1", label: "option 1" },
          { key: "option2", label: "option 2" },
          { key: "option3", label: "option 3" },
        ],
      };

      // If there is no value and no default, then we use the first option.
      wrapper.setProps({
        setting: { ...selectSetting, default: undefined },
        value: undefined,
      });
      const hiddenDiv = expectHiddenValue("option1");

      const input = hiddenDiv.find(EditableInput);
      const children = input.find("option");

      expect(input.length).to.equal(1);
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(input.prop("value")).to.be.undefined;

      expect(children.length).to.equal(3);
      expect(children.at(0).prop("value")).to.equal("option1");
      expect(children.at(1).prop("value")).to.equal("option2");
      expect(children.at(2).prop("value")).to.equal("option3");
      expect(children.at(0).text()).to.contain("option 1");
      expect(children.at(1).text()).to.contain("option 2");
      expect(children.at(2).text()).to.contain("option 3");

      // If no value set and there is a default value, then we should get the default back.
      wrapper.setProps({
        setting: { ...selectSetting, default: "option3" },
        value: undefined,
      });
      expectHiddenValue("option3");

      // If a value is already set, then we should get that value.
      wrapper.setProps({ value: "option2" });
      expectHiddenValue("option2");
    });

    it("renders hidden textarea setting", () => {
      const textareaSetting = { ...setting, type: "textarea" };
      wrapper.setProps({ setting: textareaSetting });
      const hiddenDiv = expectHiddenValue("");

      const input = hiddenDiv.find(EditableInput);
      expect(input.length).to.equal(1);
      const inputElement = input.find("textarea").at(0) as any;
      expect(inputElement.length).to.equal(1);
      expect(inputElement.text()).to.equal("");
      expect(input.prop("type")).to.equal("text");
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("value")).to.be.undefined;

      wrapper.setProps({ setting: textareaSetting, value: "test" });
      expectHiddenValue("test");
    });

    it("renders hidden menu setting", () => {
      const menuSetting = {
        ...setting,
        type: "menu",
        menuOptions: ["A", "B", "C"].map((x) => (
          <option key={x} aria-selected={false}>
            {x}
          </option>
        )),
      };
      wrapper.setProps({
        setting: menuSetting,
        value: [],
        altValue: "Alternate",
        readOnly: true,
        disableButton: true,
      });

      const hiddenDiv = expectHiddenValue([]);
      const inputList = hiddenDiv.find(InputList);
      expect(inputList.length).to.equal(1);
      expect(inputList.prop("setting")).to.equal(menuSetting);
      expect(inputList.prop("altValue")).to.equal("Alternate");
      expect(inputList.find("select").length).to.equal(1);
      expect(inputList.prop("readOnly")).to.be.true;
      expect(inputList.prop("disableButton")).to.be.true;
    });

    it("renders hidden image setting", () => {
      const imageSetting = { ...setting, type: "image" };

      wrapper.setProps({ setting: imageSetting });
      let hiddenDiv = expectHiddenValue("");

      const input = hiddenDiv.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.prop("type")).to.equal("file");
      expect(input.prop("name")).to.equal("setting");
      expect(input.prop("label")).to.equal("label");
      expect(input.prop("value")).to.be.undefined;
      expect(input.prop("accept")).to.equal("image/*");

      wrapper.setProps({ value: "data:image/png;base64,..." });
      hiddenDiv = expectHiddenValue("");
      const img = hiddenDiv.find("img");
      expect(img.prop("src")).to.equal("data:image/png;base64,...");
    });

    it("renders hidden color picker setting", () => {
      const colorPickerSetting = {
        ...setting,
        type: "color-picker",
        default: "#aaaaaa",
      };
      // If there is no value, then we use the default.
      wrapper.setProps({ setting: colorPickerSetting, value: undefined });
      const hiddenDiv = expectHiddenValue("#aaaaaa");
      const picker = hiddenDiv.find(ColorPicker);
      expect(picker.length).to.equal(1);
      expect(picker.prop("setting")).to.equal(colorPickerSetting);
      expect(picker.prop("value")).to.equal("#aaaaaa");

      // If a value is provided, then we use that value.
      wrapper.setProps({ value: "#222222" });
      expectHiddenValue("#aaaaaa");
    });

    it("gets value of hidden list setting without options", () => {
      wrapper.setProps({
        setting: { ...setting, type: "list" },
        value: ["item 1", "item 2"],
      });
      expectHiddenValue(["item 1", "item 2"]);
    });
  });
});

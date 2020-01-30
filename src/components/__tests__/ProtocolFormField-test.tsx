import { expect } from "chai";

import * as React from "react";
import { mount } from "enzyme";
import { stub } from "sinon";

import ProtocolFormField from "../ProtocolFormField";
import EditableInput from "../EditableInput";
import InputList from "../InputList";
import ColorPicker from "../ColorPicker";
import { Button } from "library-simplified-reusable-components";

describe("ProtocolFormField", () => {
  let setting = {
    key: "setting",
    label: "label",
    description: "<p>description</p>"
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
    let inputElement = input.find("input").getDOMNode();
    expect(inputElement.value).to.equal("test");

    (wrapper.instance() as ProtocolFormField).clear();
    expect(inputElement.value).to.equal("");
  });

  it("renders optional setting", () => {
    const optionalSetting = {...setting, ...{optional: true}};
    wrapper.setProps({ setting, optionalSetting });

    let input = wrapper.find(EditableInput);
    let description = wrapper.find(".description");
    expect(input.length).to.equal(1);
    expect(input.prop("disabled")).to.equal(false);
    expect(input.prop("name")).to.equal("setting");
    expect(input.prop("label")).to.equal("label");
    expect(description.text()).to.equal("(Optional) description");
  });

  it("renders randomizable setting", () => {
    let randomizableSetting = {...setting, ...{randomizable: true}};
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
    expect((wrapper.instance() as ProtocolFormField).getValue().length).to.equal(32);

    wrapper.setProps({ value: "test" });
    input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("value")).to.equal("test");
    button = wrapper.find("button");
    expect(button.length).to.equal(0);
  });

  it("renders setting with default", () => {
    let defaultSetting = {...setting, ...{default: "default"}};
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
    let numberSetting = {...setting, ...{"type": "number"}};
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
    let selectSetting = {...setting, ...{type: "select", options: [{ key: "option1", label: "option 1" }, { key: "option2", label: "option 2" }]}};
    wrapper.setProps({ setting: selectSetting });

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("disabled")).to.equal(false);
    expect(input.prop("name")).to.equal("setting");
    expect(input.prop("label")).to.equal("label");
    expect(input.prop("value")).to.be.undefined;
    let children = input.find("option");
    expect(children.length).to.equal(2);
    expect(children.at(0).prop("value")).to.equal("option1");
    expect(children.at(0).text()).to.contain("option 1");
    expect(children.at(1).prop("value")).to.equal("option2");
    expect(children.at(1).text()).to.contain("option 2");
  });

  it("renders textarea setting", () => {
    let textareaSetting = {...setting, ...{type: "textarea", description: "<p>Textarea</p>"}};
    wrapper.setProps({ setting: textareaSetting });

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    let inputElement = input.find("textarea").at(0) as any;
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
    let menuSetting = {...setting, ...{
      type: "menu",
      menuOptions: ["A", "B", "C"].map(x => <option role="option" aria-selected={false}>{x}</option>)
    }};
    wrapper.setProps({ setting: menuSetting, value: [], altValue: "Alternate" });
    inputList = wrapper.find(InputList);
    expect(inputList.length).to.equal(1);
    expect(inputList.prop("setting")).to.equal(menuSetting);
    expect(inputList.prop("altValue")).to.equal("Alternate");
    expect(inputList.find("select").length).to.equal(1);
  });

  it("renders image setting", () => {
    let imageSetting = {...setting, ...{type: "image"}};
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
    let img = wrapper.find("img");
    expect(img.prop("src")).to.equal("image data");
  });

  it("renders color picker setting", () => {
    let colorPickerSetting = {...setting, ...{type: "color-picker", default: "#aaaaaa"}};
    wrapper.setProps({ setting: colorPickerSetting });

    let picker = wrapper.find(ColorPicker);
    expect(picker.length).to.equal(1);
    expect(picker.prop("setting")).to.equal(colorPickerSetting);
    expect(picker.prop("value")).to.equal("#aaaaaa");
    let label = wrapper.find("label");
    expect(label.text()).to.equal("label");

    wrapper.setProps({ value: "#222222" });
    picker = wrapper.find(ColorPicker);
    expect(picker.prop("value")).to.equal("#222222");
  });

  it("gets value of list setting without options", () => {
    wrapper.setProps({ setting: {...setting, ...{type: "list"}}, value: ["item 1", "item 2"] });
    expect((wrapper.instance() as ProtocolFormField).getValue()).to.deep.equal(["item 1", "item 2"]);
  });

  it("optionally renders instructions", () => {
    let instructionsSetting = {...setting, ...{instructions: "<ul><li>Step 1</li></ul>", type: "list"}};
    wrapper.setProps({ setting: instructionsSetting });

    let instructions = wrapper.find(".well");
    expect(instructions.length).to.equal(1);
    expect(instructions.hasClass("description")).to.be.true;
    expect(instructions.text()).to.equal("Step 1");
  });

  it("optionally accepts an onChange prop", () => {
    let onChange = stub();
    wrapper.setProps({ onChange });
    let element = wrapper.find(EditableInput);
    expect(element.prop("onChange")).to.equal(onChange);
    let setting = {...wrapper.prop("setting"), ...{type: "list"}};
    wrapper.setProps({ setting });
    let inputList = wrapper.find(InputList);
    expect(inputList.prop("onChange")).to.equal(onChange);
  });

  it("optionally accepts a locked prop", () => {
    let setting = {...wrapper.prop("setting"), ...{type: "list"}};
    wrapper.setProps({ setting: setting, locked: true });
    let inputList = wrapper.find(InputList);
    expect(inputList.prop("locked")).to.be.true;
  });

  it("gets value of text setting", () => {
    wrapper.setProps({ value: "test" });
    expect((wrapper.instance() as ProtocolFormField).getValue()).to.equal("test");
  });
});

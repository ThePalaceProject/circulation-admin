import { expect } from "chai";

import * as React from "react";
import { shallow, mount } from "enzyme";

import ProtocolFormField from "../ProtocolFormField";
import EditableInput from "../EditableInput";

describe("ProtocolFormField", () => {
  it("renders text setting", () => {
    const setting = {
      key: "setting",
      label: "label"
    };
    const wrapper = shallow(
      <ProtocolFormField
        setting={setting}
        disabled={true}
        />
    );

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("disabled")).to.equal(true);
    expect(input.prop("name")).to.equal("setting");
    expect(input.prop("label")).to.equal("label");
    expect(input.prop("value")).to.be.undefined;

    wrapper.setProps({ value: "test" });
    input = wrapper.find(EditableInput);
    expect(input.prop("value")).to.equal("test");
  });

  it("renders optional setting", () => {
    const setting = {
      key: "setting",
      label: "label",
      optional: true
    };
    const wrapper = shallow(
      <ProtocolFormField
        setting={setting}
        disabled={false}
        />
    );

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("disabled")).to.equal(false);
    expect(input.prop("name")).to.equal("setting");
    expect(input.prop("label")).to.equal("label (optional)");
    expect(input.prop("value")).to.be.undefined;
  });

  it("renders randomizable setting", () => {
    const setting = {
      key: "setting",
      label: "label",
      randomizable: true
    };
    const wrapper = mount(
      <ProtocolFormField
        setting={setting}
        disabled={false}
        />
    );

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("disabled")).to.equal(false);
    expect(input.prop("name")).to.equal("setting");
    expect(input.prop("value")).to.be.undefined;
    let button = wrapper.find("button");
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
    const setting = {
      key: "setting",
      label: "label",
      default: "default"
    };
    const wrapper = shallow(
      <ProtocolFormField
        setting={setting}
        disabled={true}
        />
    );

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("name")).to.equal("setting");
    expect(input.prop("value")).to.equal("default");

    wrapper.setProps({ value: "test" });
    input = wrapper.find(EditableInput);
    expect(input.prop("value")).to.equal("test");
  });

  it("renders select setting", () => {
    const setting = {
      key: "setting",
      label: "label",
      type: "select",
      options: [
        { key: "option1", label: "option 1" },
        { key: "option2", label: "option 2" }
      ]
    };
    const wrapper = shallow(
      <ProtocolFormField
        setting={setting}
        disabled={false}
        />
    );

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

  it("renders list setting with options", () => {
    const setting = {
      key: "setting",
      label: "label",
      type: "list",
      options: [
        { key: "option1", label: "option 1" },
        { key: "option2", label: "option 2" },
        { key: "option3", label: "option 3" }
      ]
    };
    const wrapper = shallow(
      <ProtocolFormField
        setting={setting}
        disabled={false}
        />
    );

    expect(wrapper.find("div").text()).to.contain("label");

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(3);

    expect(input.at(0).prop("name")).to.equal("setting_option1");
    expect(input.at(1).prop("name")).to.equal("setting_option2");
    expect(input.at(2).prop("name")).to.equal("setting_option3");

    expect(input.at(0).prop("label")).to.equal("option 1");
    expect(input.at(1).prop("label")).to.equal("option 2");
    expect(input.at(2).prop("label")).to.equal("option 3");

    expect(input.at(0).prop("checked")).not.to.be.ok;
    expect(input.at(1).prop("checked")).not.to.be.ok;
    expect(input.at(2).prop("checked")).not.to.be.ok;

    wrapper.setProps({ value: ["option1", "option3"] });

    input = wrapper.find(EditableInput);
    expect(input.length).to.equal(3);

    expect(input.at(0).prop("checked")).to.be.ok;
    expect(input.at(1).prop("checked")).not.to.be.ok;
    expect(input.at(2).prop("checked")).to.be.ok;
  });

  it("renders list setting without options", () => {
    const setting = {
      key: "setting",
      label: "label",
      type: "list"
    };
    let wrapper = mount(
      <ProtocolFormField
        setting={setting}
        disabled={false}
        />
    );

    expect(wrapper.text()).to.contain("label");
    let input = wrapper.find("input[name='setting']") as any;
    expect(input.length).to.equal(1);
    let button = wrapper.find("button");
    expect(button.length).to.equal(1);

    wrapper = mount(
      <ProtocolFormField
        setting={setting}
        disabled={false}
        value={["option1", "option2"]}
        />
    );
    input = wrapper.find("input[name='setting']") as any;
    expect(input.length).to.equal(3);
    expect(input.at(0).props().value).to.equal("option1");
    expect(input.at(1).props().value).to.equal("option2");

    input.at(2).get(0).value = "option3";
    button = wrapper.find("button");
    button.simulate("click");

    input = wrapper.find("input[name='setting']") as any;
    expect(input.length).to.equal(4);
    expect(input.at(0).props().value).to.equal("option1");
    expect(input.at(1).props().value).to.equal("option2");
    expect(input.at(2).props().value).to.equal("option3");
  });
});
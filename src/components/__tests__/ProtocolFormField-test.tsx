import { expect } from "chai";

import * as React from "react";
import { shallow } from "enzyme";

import ProtocolFormField from "../ProtocolFormField";
import EditableInput from "../EditableInput";

describe("ProtocolFormField", () => {
  it("renders text field", () => {
    const field = {
      key: "field",
      label: "label"
    };
    const wrapper = shallow(
      <ProtocolFormField
        field={field}
        disabled={true}
        />
    );

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("disabled")).to.equal(true);
    expect(input.prop("name")).to.equal("field");
    expect(input.prop("label")).to.equal("label");
    expect(input.prop("value")).to.be.undefined;

    wrapper.setProps({ value: "test" });
    input = wrapper.find(EditableInput);
    expect(input.prop("value")).to.equal("test");
  });

  it("renders optional field", () => {
    const field = {
      key: "field",
      label: "label",
      optional: true
    };
    const wrapper = shallow(
      <ProtocolFormField
        field={field}
        disabled={false}
        />
    );

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("disabled")).to.equal(false);
    expect(input.prop("name")).to.equal("field");
    expect(input.prop("label")).to.equal("label (optional)");
    expect(input.prop("value")).to.be.undefined;
  });

  it("renders select field", () => {
    const field = {
      key: "field",
      label: "label",
      type: "select",
      options: [
        { key: "option1", label: "option 1" },
        { key: "option2", label: "option 2" }
      ]
    };
    const wrapper = shallow(
      <ProtocolFormField
        field={field}
        disabled={false}
        />
    );

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("disabled")).to.equal(false);
    expect(input.prop("name")).to.equal("field");
    expect(input.prop("label")).to.equal("label");
    expect(input.prop("value")).to.be.undefined;
    let children = input.find("option");
    expect(children.length).to.equal(2);
    expect(children.at(0).prop("value")).to.equal("option1");
    expect(children.at(0).text()).to.contain("option 1");
    expect(children.at(1).prop("value")).to.equal("option2");
    expect(children.at(1).text()).to.contain("option 2");
  });

  it("renders list field", () => {
    const field = {
      key: "field",
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
        field={field}
        disabled={false}
        />
    );

    expect(wrapper.find("div").text()).to.contain("label");

    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(3);

    expect(input.at(0).prop("name")).to.equal("field_option1");
    expect(input.at(1).prop("name")).to.equal("field_option2");
    expect(input.at(2).prop("name")).to.equal("field_option3");

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
});
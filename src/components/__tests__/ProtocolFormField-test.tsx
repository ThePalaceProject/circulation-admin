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
});
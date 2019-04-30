import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { Button } from "library-simplified-reusable-components";

import TextWithEditMode from "../TextWithEditMode";
import EditableInput from "../EditableInput";

describe("TextWithEditMode", () => {
  let onUpdate;

  beforeEach(() => {
    onUpdate = stub();
  });

  it("renders text", () => {
    let wrapper = mount(
      <TextWithEditMode text="test" placeholder="editable thing" />
    );
    expect(wrapper.text()).to.contain("test");
    expect(wrapper.text()).to.contain("Edit editable thing");

    wrapper.setProps({ text: "other text" });
    expect(wrapper.text()).not.to.contain("test");
    expect(wrapper.text()).to.contain("other text");
  });

  it("starts in edit mode if there's no text", () => {
    let wrapper = mount(
      <TextWithEditMode placeholder="editable thing" />
    );
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("placeholder")).to.equal("editable thing");
    expect(input.prop("value")).to.equal("");
    let button = wrapper.find(Button);
    expect(button.text()).to.contain("Save editable thing");
  });

  it("switches to edit mode", () => {
    let wrapper = mount(
      <TextWithEditMode text="test" placeholder="editable thing" />
    );
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(0);
    let editButton = wrapper.find(Button);
    editButton.simulate("click");
    input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("placeholder")).to.equal("editable thing");
    expect(input.prop("value")).to.equal("test");

    let saveButton = wrapper.find(Button);
    expect(saveButton.text()).to.contain("Save");
    expect(saveButton.text()).not.to.contain("Edit");
  });

  it("switches out of edit mode", () => {
    let wrapper = mount(
      <TextWithEditMode
        placeholder="editable thing"
        onUpdate={onUpdate}
        />
    );
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);

    let getValueStub = stub(EditableInput.prototype, "getValue").returns("new value");

    let saveButton = wrapper.find(Button);
    saveButton.simulate("click");
    input = wrapper.find(EditableInput);
    expect(input.length).to.equal(0);
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.equal("new value");

    expect(wrapper.text()).to.contain("new value");

    let editButton = wrapper.find(Button);
    expect(editButton.text()).to.contain("Edit");
    expect(editButton.text()).not.to.contain("Save");

    getValueStub.restore();
  });

  it("gets text", () => {
    let wrapper = mount(
      <TextWithEditMode text="test" placeholder="editable thing" />
    );
    expect((wrapper.instance() as TextWithEditMode).getText()).to.equal("test");

    // From edit mode, it returns the current input value and exists edit mode.
    let getValueStub = stub(EditableInput.prototype, "getValue").returns("new value");
    wrapper = mount(
      <TextWithEditMode placeholder="editable thing" />
    );
    expect((wrapper.instance() as TextWithEditMode).getText()).to.equal("new value");
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(0);

    getValueStub.restore();
  });

  it("resets", () => {
    let getValueStub = stub(EditableInput.prototype, "getValue").returns("new value");
    let wrapper = mount(
      <TextWithEditMode
        placeholder="editable thing"
        onUpdate={onUpdate}
        />
    );
    let saveButton = wrapper.find(Button);
    saveButton.simulate("click");
    expect(wrapper.text()).to.contain("new value");
    expect(onUpdate.callCount).to.equal(1);

    (wrapper.instance() as TextWithEditMode).reset();
    expect(wrapper.text()).not.to.contain("new value");
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(onUpdate.callCount).to.equal(2);
    expect(onUpdate.args[1][0]).to.be.undefined;

    wrapper = mount(
      <TextWithEditMode
        text="test"
        placeholder="editable thing"
        onUpdate={onUpdate}
        />
    );
    let editButton = wrapper.find(Button);
    editButton.simulate("click");
    saveButton = wrapper.find(Button);
    saveButton.simulate("click");
    expect(wrapper.text()).not.to.contain("test");
    expect(wrapper.text()).to.contain("new value");
    expect(onUpdate.callCount).to.equal(3);

    (wrapper.instance() as TextWithEditMode).reset();
    expect(wrapper.text()).not.to.contain("new value");
    expect(wrapper.text()).to.contain("test");
    expect(onUpdate.callCount).to.equal(4);
    expect(onUpdate.args[3][0]).to.equal("test");

    getValueStub.restore();
  });
});

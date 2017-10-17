import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import TextWithEditMode from "../TextWithEditMode";
import EditableInput from "../EditableInput";

describe("TextWithEditMode", () => {
  let onUpdate;

  beforeEach(() => {
    onUpdate = stub();
  });

  it("renders text", () => {
    let wrapper = shallow(
      <TextWithEditMode text="test" placeholder="editable thing" />
    );

    expect(wrapper.text()).to.contain("test");
    expect(wrapper.text()).to.contain("Edit editable thing");

    wrapper.setProps({ text: "other text" });
    expect(wrapper.text()).not.to.contain("test");
    expect(wrapper.text()).to.contain("other text");
  });

  it("starts in edit mode if there's no text", () => {
    let wrapper = shallow(
      <TextWithEditMode placeholder="editable thing" />
    );
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("placeholder")).to.equal("editable thing");
    expect(input.prop("value")).to.be.undefined;
    let link = wrapper.find("a");
    expect(link.text()).to.contain("Save editable thing");
  });

  it("switches to edit mode", () => {
    let wrapper = shallow(
      <TextWithEditMode text="test" placeholder="editable thing" />
    );
    let input = wrapper.find(EditableInput);
    expect(input.length).to.equal(0);

    let editLink = wrapper.find("a");
    editLink.simulate("click");
    input = wrapper.find(EditableInput);
    expect(input.length).to.equal(1);
    expect(input.prop("placeholder")).to.equal("editable thing");
    expect(input.prop("value")).to.equal("test");

    let saveLink = wrapper.find("a");
    expect(saveLink.text()).to.contain("Save");
    expect(saveLink.text()).not.to.contain("Edit");
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

    let saveLink = wrapper.find("a");
    saveLink.simulate("click");
    input = wrapper.find(EditableInput);
    expect(input.length).to.equal(0);
    expect(onUpdate.callCount).to.equal(1);
    expect(onUpdate.args[0][0]).to.equal("new value");

    expect(wrapper.text()).to.contain("new value");

    let editLink = wrapper.find("a");
    expect(editLink.text()).to.contain("Edit");
    expect(editLink.text()).not.to.contain("Save");

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
    let saveLink = wrapper.find("a");
    saveLink.simulate("click");
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
    let editLink = wrapper.find("a");
    editLink.simulate("click");
    saveLink = wrapper.find("a");
    saveLink.simulate("click");
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
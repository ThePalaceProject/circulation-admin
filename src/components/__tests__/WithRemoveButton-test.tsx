import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import WithRemoveButton from "../WithRemoveButton";

describe("WithRemoveButton", () => {
  let wrapper;
  let onRemove;

  beforeEach(() => {
    onRemove = stub();
    wrapper = mount(
      <WithRemoveButton disabled={false} onRemove={onRemove}>
        child
      </WithRemoveButton>
    );
  });

  describe("rendering", () => {
    it("shows children", () => {
      expect(wrapper.text()).to.contain("child");
    });

    it("shows remove buttons", () => {
      const removeBtn = wrapper.find(".remove-btn").hostNodes();
      expect(removeBtn.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    it("calls onRemove", () => {
      const removeBtn = wrapper.find(".remove-btn").hostNodes();
      removeBtn.simulate("click");
      expect(onRemove.callCount).to.equal(1);
    });

    it("does nothing when disabled", () => {
      wrapper.setProps({ disabled: true });
      const removeBtn = wrapper.find(".remove-btn").hostNodes();
      removeBtn.simulate("click");
      expect(onRemove.callCount).to.equal(0);
    });

    it("calls onRemove when confirmation returns true", () => {
      const confirmRemoval = stub().returns(true);
      wrapper.setProps({ confirmRemoval });
      const removeBtn = wrapper.find(".remove-btn").hostNodes();

      removeBtn.simulate("click");

      expect(confirmRemoval.callCount).to.equal(1);
      expect(onRemove.callCount).to.equal(1);
    });

    it("does not call onRemove when confirmation returns false", () => {
      const confirmRemoval = stub().returns(false);
      wrapper.setProps({ confirmRemoval });
      const removeBtn = wrapper.find(".remove-btn").hostNodes();

      removeBtn.simulate("click");

      expect(confirmRemoval.callCount).to.equal(1);
      expect(onRemove.callCount).to.equal(0);
    });
  });
});

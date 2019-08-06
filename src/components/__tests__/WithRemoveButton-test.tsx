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
      <WithRemoveButton
        disabled={false}
        onRemove={onRemove}
      >
        child
      </WithRemoveButton>
    );
  });

  describe("rendering", () => {
    it("shows children", () => {
      expect(wrapper.text()).to.contain("child");
    });

    it("shows remove buttons", () => {
      let removeBtn = wrapper.find(".remove-btn").hostNodes();
      expect(removeBtn.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    it("calls onRemove", () => {
      let removeBtn = wrapper.find(".remove-btn").hostNodes();
      removeBtn.simulate("click");
      expect(onRemove.callCount).to.equal(1);
    });

    it("does nothing when disabled", () => {
      wrapper.setProps({ disabled: true });
      let removeBtn = wrapper.find(".remove-btn").hostNodes();
      removeBtn.simulate("click");
      expect(onRemove.callCount).to.equal(0);
    });
  });
});
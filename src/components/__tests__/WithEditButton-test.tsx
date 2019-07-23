import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import WithEditButton from "../WithEditButton";

describe("WithEditButton", () => {
  let wrapper;
  let onEdit;

  beforeEach(() => {
    onEdit = stub();
    wrapper = mount(
      <WithEditButton
        disabled={false}
        onEdit={onEdit}
        >
        child
      </WithEditButton>
    );
  });

  describe("rendering", () => {
    it("shows children", () => {
      expect(wrapper.text()).to.contain("child");
    });

    it("shows edit buttons", () => {
      let editBtn = wrapper.find(".edit-btn").hostNodes();
      expect(editBtn.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    it("calls onEdit", () => {
      let editBtn = wrapper.find(".edit-btn").hostNodes();
      editBtn.simulate("click");
      expect(onEdit.callCount).to.equal(1);
    });

    it("does nothing when disabled", () => {
      wrapper.setProps({ disabled: true });
      let editBtn = wrapper.find(".edit-btn").hostNodes();
      editBtn.simulate("click");
      expect(onEdit.callCount).to.equal(0);
    });
  });
});

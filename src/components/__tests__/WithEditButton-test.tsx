import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import WithEditButton from "../WithEditButton";

describe("WithEditButton", () => {
  let wrapper;
  let onEdit;

  beforeEach(() => {
    onEdit = stub();
    wrapper = shallow(
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
      let icon = wrapper.find(".edit");
      expect(icon.length).to.equal(1);

      let srLink = wrapper.find("a.sr-only");
      expect(srLink.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    it("calls onEdit", () => {
      let icon = wrapper.find(".edit");
      icon.simulate("click");
      expect(onEdit.callCount).to.equal(1);

      let srLink = wrapper.find("a.sr-only");
      srLink.simulate("click");
      expect(onEdit.callCount).to.equal(2);
    });

    it("does nothing when disabled", () => {
      wrapper.setProps({ disabled: true });
      let icon = wrapper.find(".edit");
      icon.simulate("click");
      expect(onEdit.callCount).to.equal(0);

      let srLink = wrapper.find("a.sr-only");
      srLink.simulate("click");
      expect(onEdit.callCount).to.equal(0);
    });
  });
});
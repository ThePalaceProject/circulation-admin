import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import WithRemoveButton from "../WithRemoveButton";

describe("WithRemoveButton", () => {
  let wrapper;
  let onRemove;

  beforeEach(() => {
    onRemove = stub();
    wrapper = shallow(
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
      let icon = wrapper.find(".remove");
      expect(icon.length).to.equal(1);

      let srLink = wrapper.find("a.sr-only");
      expect(srLink.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    it("calls onRemove", () => {
      let icon = wrapper.find(".remove");
      icon.simulate("click");
      expect(onRemove.callCount).to.equal(1);

      let srLink = wrapper.find("a.sr-only");
      srLink.simulate("click");
      expect(onRemove.callCount).to.equal(2);
    });

    it("does nothing when disabled", () => {
      wrapper.setProps({ disabled: true });
      let icon = wrapper.find(".remove");
      icon.simulate("click");
      expect(onRemove.callCount).to.equal(0);

      let srLink = wrapper.find("a.sr-only");
      srLink.simulate("click");
      expect(onRemove.callCount).to.equal(0);
    });
  });
});
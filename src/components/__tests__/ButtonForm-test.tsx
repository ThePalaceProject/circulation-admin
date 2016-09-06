import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import ButtonForm from "../ButtonForm";

describe("ButtonForm", () => {
  let wrapper;
  let input;
  let onClick;

  beforeEach(() => {
    onClick = stub();
    wrapper = shallow(
      <ButtonForm
        className="btn-sm"
        label="label"
        disabled={false}
        onClick={onClick}
        />
    );
    input = wrapper.find("input");
  });

  describe("rendering", () => {
    it("shows label", () => {
      expect(input.props().value).to.equal("label");
    });

    it("uses provided class and bootstrap classes", () => {
      expect(input.props().className).to.equal("btn btn-default button-form btn-sm");
    });

    it("disables", () => {
      expect(input.props().hasOwnProperty("disabled")).to.equal(false);
      wrapper.setProps({ disabled: true });
      input = wrapper.find("input");
      expect(input.props().disabled).to.equal(true);
    });
  });

  describe("behavior", () => {
    it("calls provided onClick function", () => {
      input.simulate("click");
      expect(onClick.callCount).to.equal(1);
    });
  });
});
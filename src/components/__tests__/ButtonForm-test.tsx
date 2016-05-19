jest.dontMock("../ButtonForm");

import * as React from "react";
import { shallow } from "enzyme";

import ButtonForm from "../ButtonForm";

describe("ButtonForm", () => {
  let wrapper;
  let input;
  let onClick;

  beforeEach(() => {
    onClick = jest.genMockFunction();
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
      expect(input.props().value).toBe("label");
    });

    it("uses provided class and bootstrap classes", () => {
      expect(input.props().className).toBe("btn btn-default btn-sm");
    });

    it("disables", () => {
      expect(input.props().hasOwnProperty("disabled")).toBe(false);
      wrapper.setProps({ disabled: true });
      input = wrapper.find("input");
      expect(input.props().disabled).toBe(true);
    });
  });

  describe("behavior", () => {
    it("calls provided onClick function", () => {
      input.simulate("click");
      expect(onClick.mock.calls.length).toBe(1);
    });
  });
});
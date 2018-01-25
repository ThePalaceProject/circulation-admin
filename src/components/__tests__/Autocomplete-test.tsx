import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import Autocomplete from "../Autocomplete";
import EditableInput from "../EditableInput";

describe("Autocomplete", () => {
  let wrapper;
  let autocompleteValues = ["a", "b", "c"];

  beforeEach(() => {
    wrapper = shallow(
      <Autocomplete
        autocompleteValues={autocompleteValues}
        disabled={false}
        name="test"
        label="Test"
        value="b"
        />
    );
  });

  describe("rendering", () => {
    it("shows input", () => {
      let input = wrapper.find(EditableInput);
      expect(input.length).to.equal(1);
      expect(input.props().type).to.equal("text");
      expect(input.props().disabled).to.equal(false);
      expect(input.props().name).to.equal("test");
      expect(input.props().label).to.equal("Test");
      expect(input.props().value).to.equal("b");
      expect(input.props().list).to.equal("test-autocomplete-list");
    });

    it("shows autocomplete list", () => {
      let list = wrapper.find("datalist");
      expect(list.length).to.equal(1);
      expect(list.props().id).to.equal("test-autocomplete-list");
      let options = list.find("option");
      expect(options.length).to.equal(3);
      expect(options.at(0).props().value).to.equal("a");
      expect(options.at(1).props().value).to.equal("b");
      expect(options.at(2).props().value).to.equal("c");
    });
  });

  describe("behavior", () => {
    it("returns value", () => {
      wrapper = mount(
        <Autocomplete
          autocompleteValues={autocompleteValues}
          disabled={false}
          name="test"
          label="Test"
          value="b"
          />
      );
      let getValueStub = stub(EditableInput.prototype, "getValue").returns("test value");
      expect((wrapper.instance() as Autocomplete).getValue()).to.equal("test value");
      getValueStub.restore();
    });
  });
});
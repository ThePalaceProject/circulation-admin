import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import * as Enzyme from "enzyme";
import EditableInput from "../EditableInput";
import SortButtons from "../SortButtons";

describe("SortButtons", () => {
  let wrapper: Enzyme.CommonWrapper<any, any, {}>;
  const changeSort = stub();

  beforeEach(() => {
    wrapper = Enzyme.mount(
      <SortButtons changeSort={changeSort} sortOrder="asc" />
    );
  });

  it("renders sort radio buttons", () => {
    const sortButtons = wrapper.find(EditableInput);
    const ascendingButton = sortButtons.at(0);
    const descendingButton = sortButtons.at(1);
    expect(ascendingButton.text()).to.equal("Sort A-Z");
    expect(descendingButton.text()).to.equal("Sort Z-A");
    expect(ascendingButton.props().checked).to.equal(true);
    expect(descendingButton.props().checked).to.equal(false);
  });

  it("checks the correct radio based on the sortOrder prop", () => {
    let sortButtons = wrapper.find(EditableInput);
    let ascendingButton = sortButtons.at(0);
    let descendingButton = sortButtons.at(1);
    expect(ascendingButton.props().checked).to.equal(true);
    expect(descendingButton.props().checked).to.equal(false);
    wrapper.setProps({ sortOrder: "desc" });
    sortButtons = wrapper.find(EditableInput);
    ascendingButton = sortButtons.at(0);
    descendingButton = sortButtons.at(1);
    expect(ascendingButton.props().checked).to.equal(false);
    expect(descendingButton.props().checked).to.equal(true);
  });
});

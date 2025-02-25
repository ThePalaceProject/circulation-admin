import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchValueFilter from "../AdvancedSearchValueFilter";
import { fields, operators } from "../AdvancedSearchBuilder";

describe("AdvancedSearchValueFilter", () => {
  let wrapper;
  let onMove;
  let onRemove;
  let onSelect;
  let query;

  beforeEach(() => {
    onMove = stub();
    onRemove = stub();
    onSelect = stub();

    query = {
      id: "91",
      key: "title",
      op: "eq",
      value: "foo",
    };

    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchValueFilter
          query={query}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );
  });

  it("should render the field label, operator symbol, and value of the query", () => {
    const filterLabel = wrapper.find(".advanced-search-value-filter > span");

    const expectedField = `${
      fields.find((field) => field.value === "title")?.label
    }`;
    const expectedOperator = `${
      operators.find((op) => op.value === "eq")?.symbol
    }`;
    const filterLabelText = `${expectedField} ${expectedOperator} foo`;

    expect(filterLabel).to.have.length(1);
    expect(filterLabel.text()).to.equal(filterLabelText);
  });

  it("should apply the selected class when selected is true", () => {
    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchValueFilter
          query={query}
          selected={true}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    expect(
      wrapper.find(".advanced-search-value-filter").hasClass("selected")
    ).to.equal(true);
  });

  it("should not apply the selected class when readOnly is true", () => {
    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchValueFilter
          query={query}
          readOnly={true}
          selected={true}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    expect(
      wrapper.find(".advanced-search-value-filter").hasClass("selected")
    ).to.equal(false);
  });

  it("should render a remove button", () => {
    const button = wrapper.find(".advanced-search-value-filter > button");

    expect(button).to.have.length(1);
    expect(button.text()).to.equal("×");
  });

  it("should not render a remove button when readOnly is true", () => {
    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchValueFilter
          query={query}
          readOnly={true}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const button = wrapper.find(".advanced-search-value-filter > button");

    expect(button).to.have.length(0);
  });

  it("should call onRemove when the remove button is clicked", () => {
    const button = wrapper.find(".advanced-search-value-filter > button");

    button.simulate("click");

    expect(onRemove.callCount).to.equal(1);
    expect(onRemove.args[0]).to.deep.equal(["91"]);
  });

  it("should call onSelect when clicked", () => {
    const filter = wrapper.find(".advanced-search-value-filter");

    filter.simulate("click");

    expect(onSelect.callCount).to.equal(1);
    expect(onSelect.args[0]).to.deep.equal(["91"]);
  });

  it("should call onSelect when the space bar is depressed", () => {
    const filter = wrapper.find(".advanced-search-value-filter");

    filter.simulate("keydown", { key: " " });

    expect(onSelect.callCount).to.equal(1);
    expect(onSelect.args[0]).to.deep.equal(["91"]);
  });
});

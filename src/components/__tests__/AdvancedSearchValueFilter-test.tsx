import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchValueFilter from "../AdvancedSearchValueFilter";

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

    expect(filterLabel).to.have.length(1);
    expect(filterLabel.text()).to.equal("title = foo");
  });

  it("should render the field label, operator symbol, and value of the query", () => {
    const filterLabel = wrapper.find(".advanced-search-value-filter > span");

    expect(filterLabel).to.have.length(1);
    expect(filterLabel.text()).to.equal("title = foo");
  });

  it("should render a remove button", () => {
    const button = wrapper.find(".advanced-search-value-filter > button");

    expect(button).to.have.length(1);
    expect(button.text()).to.equal("×");
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

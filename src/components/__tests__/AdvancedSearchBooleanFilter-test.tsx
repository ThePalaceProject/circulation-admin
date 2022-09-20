import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchFilter from "../AdvancedSearchFilter";
import AdvancedSearchBooleanFilter from "../AdvancedSearchBooleanFilter";

describe("AdvancedSearchBooleanFilter", () => {
  let wrapper;
  let onBooleanChange;
  let onMove;
  let onRemove;
  let onSelect;
  let query;

  beforeEach(() => {
    onBooleanChange = stub();
    onMove = stub();
    onRemove = stub();
    onSelect = stub();

    query = {
      id: "90",
      and: [
        {
          id: "91",
          key: "title",
          value: "foo",
        },
        {
          id: "92",
          key: "title",
          value: "bar",
        },
      ],
    };

    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchBooleanFilter
          query={query}
          selectedQueryId="91"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );
  });

  it("should render a select containing an option for each boolean operator, with the current operator selected", () => {
    const operatorOptions = wrapper.find(
      ".advanced-search-boolean-filter > header select > option"
    );

    expect(operatorOptions).to.have.length(2);

    expect(operatorOptions.at(0).prop("value")).to.equal("and");
    expect(operatorOptions.at(0).text()).to.equal(
      "All of these filters must be matched:"
    );
    expect(operatorOptions.at(0).getDOMNode().selected).to.equal(true);

    expect(operatorOptions.at(1).prop("value")).to.equal("or");
    expect(operatorOptions.at(1).text()).to.equal(
      "Any of these filters may be matched:"
    );
    expect(operatorOptions.at(1).getDOMNode().selected).to.equal(false);
  });

  it("should disable the boolean operator select when readOnly is true", () => {
    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchBooleanFilter
          query={query}
          readOnly={true}
          selectedQueryId="91"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const operatorSelect = wrapper.find(
      ".advanced-search-boolean-filter > header select"
    );

    expect(operatorSelect.prop("disabled")).to.equal(true);
  });

  it("should call onBooleanChange when the boolean operator changes", () => {
    const operatorSelect = wrapper.find(
      ".advanced-search-boolean-filter > header select"
    );

    operatorSelect.getDOMNode().value = "or";
    operatorSelect.simulate("change");

    expect(onBooleanChange.callCount).to.equal(1);
    expect(onBooleanChange.args[0]).to.deep.equal(["90", "or"]);
  });

  it("should render a remove button", () => {
    const button = wrapper.find(
      ".advanced-search-boolean-filter > header button"
    );

    expect(button).to.have.length(1);
    expect(button.text()).to.equal("×");
  });

  it("should not render a remove button when readOnly is true", () => {
    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchBooleanFilter
          query={query}
          readOnly={true}
          selectedQueryId="91"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const button = wrapper.find(
      ".advanced-search-boolean-filter > header button"
    );

    expect(button).to.have.length(0);
  });

  it("should call onRemove when the remove button is clicked", () => {
    const button = wrapper.find(
      ".advanced-search-boolean-filter > header button"
    );

    button.simulate("click");

    expect(onRemove.callCount).to.equal(1);
    expect(onRemove.args[0]).to.deep.equal(["90"]);
  });

  it("should call onSelect when clicked", () => {
    const filter = wrapper.find(".advanced-search-boolean-filter");

    filter.simulate("click");

    expect(onSelect.callCount).to.equal(1);
    expect(onSelect.args[0]).to.deep.equal(["90"]);
  });

  it("should call onSelect when the space bar is depressed", () => {
    const filter = wrapper.find(".advanced-search-boolean-filter");

    filter.simulate("keydown", { key: " " });

    expect(onSelect.callCount).to.equal(1);
    expect(onSelect.args[0]).to.deep.equal(["90"]);
  });

  it("should render an AdvancedSearchFilter for each child", () => {
    const list = wrapper.find(".advanced-search-boolean-filter > ul");
    const filters = list.find(AdvancedSearchFilter);

    expect(filters).to.have.length(2);

    const filter1 = filters.at(0);

    expect(filter1.prop("query")).to.deep.equal(query.and[0]);
    expect(filter1.prop("selectedQueryId")).to.equal("91");
    expect(filter1.prop("onBooleanChange")).to.equal(onBooleanChange);
    expect(filter1.prop("onMove")).to.equal(onMove);
    expect(filter1.prop("onSelect")).to.equal(onSelect);
    expect(filter1.prop("onRemove")).to.equal(onRemove);

    const filter2 = filters.at(1);

    expect(filter2.prop("query")).to.deep.equal(query.and[1]);
    expect(filter2.prop("selectedQueryId")).to.equal("91");
    expect(filter2.prop("onBooleanChange")).to.equal(onBooleanChange);
    expect(filter2.prop("onMove")).to.equal(onMove);
    expect(filter2.prop("onSelect")).to.equal(onSelect);
    expect(filter2.prop("onRemove")).to.equal(onRemove);
  });

  it("should propagate the readOnly prop to AdvancedSearchFilter children", () => {
    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchBooleanFilter
          query={query}
          readOnly={true}
          selectedQueryId="91"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const list = wrapper.find(".advanced-search-boolean-filter > ul");
    const filters = list.find(AdvancedSearchFilter);

    expect(filters).to.have.length(2);

    expect(filters.at(0).prop("readOnly")).to.equal(true);
    expect(filters.at(1).prop("readOnly")).to.equal(true);
  });

  it('should separate child filters with "and" when the boolean operator is AND', () => {
    const separators = wrapper.find(
      ".advanced-search-boolean-filter > ul > li > span"
    );

    expect(separators).to.have.length(1);

    expect(separators.at(0).text()).to.equal("and");
  });

  it('should separate child filters with "or" when the boolean operator is OR', () => {
    query = {
      id: "90",
      or: [
        {
          id: "91",
          key: "title",
          value: "foo",
        },
        {
          id: "92",
          key: "title",
          value: "bar",
        },
      ],
    };

    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchBooleanFilter
          query={query}
          selectedQueryId="91"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const separators = wrapper.find(
      ".advanced-search-boolean-filter > ul > li > span"
    );

    expect(separators).to.have.length(1);

    expect(separators.at(0).text()).to.equal("or");
  });

  it("should apply the selected class when the query id equals the selectedQueryId", () => {
    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchBooleanFilter
          query={query}
          selectedQueryId="90"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    expect(
      wrapper.find(".advanced-search-boolean-filter").hasClass("selected")
    ).to.equal(true);
  });

  it("should not apply the selected class when readOnly is true", () => {
    wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchBooleanFilter
          query={query}
          readOnly={true}
          selectedQueryId="90"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    expect(
      wrapper.find(".advanced-search-boolean-filter").hasClass("selected")
    ).to.equal(false);
  });
});

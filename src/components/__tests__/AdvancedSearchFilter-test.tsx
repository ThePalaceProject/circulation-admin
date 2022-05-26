import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { mount } from "enzyme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchBooleanFilter from "../AdvancedSearchBooleanFilter";
import AdvancedSearchValueFilter from "../AdvancedSearchValueFilter";
import AdvancedSearchFilter from "../AdvancedSearchFilter";

describe("AdvancedSearchFilter", () => {
  let onBooleanChange;
  let onMove;
  let onSelect;
  let onRemove;

  beforeEach(() => {
    onBooleanChange = stub();
    onMove = stub();
    onSelect = stub();
    onRemove = stub();
  });

  it("should render an AdvancedSearchBooleanFilter if the query is a boolean AND", () => {
    const query = {
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

    const wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilter
          query={query}
          selectedQueryId="90"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const filter = wrapper.find(AdvancedSearchBooleanFilter);

    expect(filter.length).to.equal(1);

    expect(filter.prop("query")).to.equal(query);
    expect(filter.prop("selectedQueryId")).to.equal("90");
    expect(filter.prop("onBooleanChange")).to.equal(onBooleanChange);
    expect(filter.prop("onMove")).to.equal(onMove);
    expect(filter.prop("onSelect")).to.equal(onSelect);
    expect(filter.prop("onRemove")).to.equal(onRemove);
  });

  it("should render an AdvancedSearchBooleanFilter if the query is a boolean OR", () => {
    const query = {
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

    const wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilter
          query={query}
          selectedQueryId="90"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const filter = wrapper.find(AdvancedSearchBooleanFilter);

    expect(filter.length).to.equal(1);

    expect(filter.prop("query")).to.equal(query);
    expect(filter.prop("selectedQueryId")).to.equal("90");
    expect(filter.prop("onBooleanChange")).to.equal(onBooleanChange);
    expect(filter.prop("onMove")).to.equal(onMove);
    expect(filter.prop("onSelect")).to.equal(onSelect);
    expect(filter.prop("onRemove")).to.equal(onRemove);
  });

  it("should render an AdvancedSearchValueFilter if the query is a not a boolean", () => {
    const query = {
      id: "91",
      key: "title",
      value: "foo",
    };

    const wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilter
          query={query}
          selectedQueryId="90"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const filter = wrapper.find(AdvancedSearchValueFilter);

    expect(filter.length).to.equal(1);

    expect(filter.prop("query")).to.equal(query);
    expect(filter.prop("selected")).to.equal(false);
    expect(filter.prop("onMove")).to.equal(onMove);
    expect(filter.prop("onSelect")).to.equal(onSelect);
    expect(filter.prop("onRemove")).to.equal(onRemove);
  });

  it("should select the AdvancedSearchValueFilter if the query is a not a boolean and selectedQueryId is the id of the query", () => {
    const query = {
      id: "91",
      key: "title",
      value: "foo",
    };

    const wrapper = mount(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilter
          query={query}
          selectedQueryId="91"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    const filter = wrapper.find(AdvancedSearchValueFilter);

    expect(filter.prop("selected")).to.equal(true);
  });
});

import * as React from "react";
import { render } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchFilter from "../../../src/components/lists/AdvancedSearchFilter";

const andQuery = {
  id: "90",
  and: [
    { id: "91", key: "title", value: "foo" },
    { id: "92", key: "title", value: "bar" },
  ],
};

const orQuery = {
  id: "90",
  or: [
    { id: "91", key: "title", value: "foo" },
    { id: "92", key: "title", value: "bar" },
  ],
};

const valueQuery = {
  id: "91",
  key: "title",
  value: "foo",
};

function renderFilter(props = {}) {
  const defaultProps = {
    query: andQuery,
    selectedQueryId: "90",
    onBooleanChange: jest.fn(),
    onMove: jest.fn(),
    onSelect: jest.fn(),
    onRemove: jest.fn(),
  };
  return render(
    <DndProvider backend={HTML5Backend}>
      <AdvancedSearchFilter {...defaultProps} {...props} />
    </DndProvider>
  );
}

describe("AdvancedSearchFilter", () => {
  it("renders an AdvancedSearchBooleanFilter if the query is a boolean AND", () => {
    const { container } = renderFilter({ query: andQuery });
    // Root element is a boolean filter
    expect(
      container.querySelector(".advanced-search-boolean-filter")
    ).not.toBeNull();
    // The root element is NOT a value filter (it may contain children that are)
    expect(
      container.firstElementChild.classList.contains(
        "advanced-search-value-filter"
      )
    ).toBe(false);
  });

  it("renders an AdvancedSearchBooleanFilter if the query is a boolean OR", () => {
    const { container } = renderFilter({ query: orQuery, readOnly: true });
    expect(
      container.querySelector(".advanced-search-boolean-filter")
    ).not.toBeNull();
    expect(
      container.firstElementChild.classList.contains(
        "advanced-search-value-filter"
      )
    ).toBe(false);
  });

  it("renders an AdvancedSearchValueFilter if the query is not a boolean", () => {
    const { container } = renderFilter({
      query: valueQuery,
      readOnly: true,
      selectedQueryId: "90",
    });
    expect(
      container.querySelector(".advanced-search-value-filter")
    ).not.toBeNull();
    expect(
      container.querySelector(".advanced-search-boolean-filter")
    ).toBeNull();
  });

  it("selects the AdvancedSearchValueFilter when the selectedQueryId matches the query id", () => {
    const { container } = renderFilter({
      query: valueQuery,
      selectedQueryId: "91",
    });
    const valueFilter = container.querySelector(
      ".advanced-search-value-filter"
    );
    expect(valueFilter).not.toBeNull();
    expect(valueFilter.classList.contains("selected")).toBe(true);
  });

  it("does not select the AdvancedSearchValueFilter when the selectedQueryId does not match", () => {
    const { container } = renderFilter({
      query: valueQuery,
      selectedQueryId: "90",
    });
    const valueFilter = container.querySelector(
      ".advanced-search-value-filter"
    );
    expect(valueFilter).not.toBeNull();
    expect(valueFilter.classList.contains("selected")).toBe(false);
  });
});

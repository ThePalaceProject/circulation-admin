import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchValueFilter from "../../../src/components/lists/AdvancedSearchValueFilter";
import {
  fields,
  operators,
} from "../../../src/components/lists/AdvancedSearchBuilder";

const query = {
  id: "91",
  key: "title",
  op: "eq",
  value: "foo",
};

const defaultProps = {
  query,
  onMove: jest.fn(),
  onRemove: jest.fn(),
  onSelect: jest.fn(),
};

const renderFilter = (props = {}) =>
  render(
    <DndProvider backend={HTML5Backend}>
      <AdvancedSearchValueFilter {...defaultProps} {...props} />
    </DndProvider>
  );

describe("AdvancedSearchValueFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the field label, operator symbol, and value of the query", () => {
    renderFilter();
    const expectedField = fields.find((f) => f.value === "title")?.label;
    const expectedOp = operators.find((o) => o.value === "eq")?.symbol;
    const el = document.querySelector(".advanced-search-value-filter > span");
    expect(el.textContent).toEqual(`${expectedField} ${expectedOp} foo`);
  });

  it("applies the selected class when selected is true", () => {
    renderFilter({ selected: true });
    const filter = document.querySelector(".advanced-search-value-filter");
    expect(filter.classList.contains("selected")).toBe(true);
  });

  it("does not apply the selected class when readOnly is true", () => {
    renderFilter({ readOnly: true, selected: true });
    const filter = document.querySelector(".advanced-search-value-filter");
    expect(filter.classList.contains("selected")).toBe(false);
  });

  it("renders a remove button", () => {
    renderFilter();
    const buttons = document.querySelectorAll(
      ".advanced-search-value-filter > button"
    );
    expect(buttons.length).toEqual(1);
    expect(buttons[0].textContent).toEqual("×");
  });

  it("does not render a remove button when readOnly is true", () => {
    renderFilter({ readOnly: true });
    const buttons = document.querySelectorAll(
      ".advanced-search-value-filter > button"
    );
    expect(buttons.length).toEqual(0);
  });

  it("calls onRemove when the remove button is clicked", () => {
    renderFilter();
    const button = document.querySelector(
      ".advanced-search-value-filter > button"
    );
    fireEvent.click(button);
    expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
    expect(defaultProps.onRemove).toHaveBeenCalledWith("91");
  });

  it("calls onSelect when clicked", () => {
    renderFilter();
    const filter = document.querySelector(".advanced-search-value-filter");
    fireEvent.click(filter);
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("91");
  });

  it("calls onSelect when the space bar is pressed", () => {
    renderFilter();
    const filter = document.querySelector(".advanced-search-value-filter");
    fireEvent.keyDown(filter, { key: " " });
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).toHaveBeenCalledWith("91");
  });
});

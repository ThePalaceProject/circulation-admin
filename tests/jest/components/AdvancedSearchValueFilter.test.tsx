import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchValueFilter from "../../../src/components/AdvancedSearchValueFilter";
import {
  fields,
  operators,
} from "../../../src/components/AdvancedSearchBuilder";

describe("AdvancedSearchValueFilter", () => {
  let onMove;
  let onRemove;
  let onSelect;
  let query;

  const renderFilter = (props = {}) =>
    render(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchValueFilter
          query={query}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
          {...props}
        />
      </DndProvider>
    );

  beforeEach(() => {
    onMove = jest.fn();
    onRemove = jest.fn();
    onSelect = jest.fn();

    query = {
      id: "91",
      key: "title",
      op: "eq",
      value: "foo",
    };
  });

  it("should render the field label, operator symbol, and value of the query", () => {
    renderFilter();

    const expectedField = `${
      fields.find((field) => field.value === "title")?.label
    }`;
    const expectedOperator = `${
      operators.find((op) => op.value === "eq")?.symbol
    }`;
    const filterLabelText = `${expectedField} ${expectedOperator} foo`;

    expect(screen.getByText(filterLabelText)).toBeInTheDocument();
  });

  it("should apply the selected class when selected is true", () => {
    const { container } = renderFilter({ selected: true });

    expect(
      container.querySelector(".advanced-search-value-filter")
    ).toHaveClass("selected");
  });

  it("should not apply the selected class when readOnly is true", () => {
    const { container } = renderFilter({ readOnly: true, selected: true });

    expect(
      container.querySelector(".advanced-search-value-filter")
    ).not.toHaveClass("selected");
  });

  it("should render a remove button", () => {
    renderFilter();

    const button = screen.getByRole("button");

    expect(button).toHaveTextContent("×");
  });

  it("should not render a remove button when readOnly is true", () => {
    renderFilter({ readOnly: true });

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should call onRemove when the remove button is clicked", async () => {
    const user = userEvent.setup();
    renderFilter();

    await user.click(screen.getByRole("button"));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("91");
  });

  it("should call onSelect when clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderFilter();

    await user.click(container.querySelector(".advanced-search-value-filter"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("91");
  });

  it("should call onSelect when the space bar is depressed", async () => {
    const user = userEvent.setup();
    const { container } = renderFilter();

    // The filter is a focusable treeitem; focus it and press space, as a
    // keyboard user would.
    const item = container.querySelector(
      ".advanced-search-value-filter"
    ) as HTMLElement;
    item.focus();
    await user.keyboard(" ");

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("91");
  });
});

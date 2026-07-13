import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchBooleanFilter from "../../../src/components/AdvancedSearchBooleanFilter";

describe("AdvancedSearchBooleanFilter", () => {
  let onBooleanChange;
  let onMove;
  let onRemove;
  let onSelect;
  let query;

  const renderFilter = (props = {}) =>
    render(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchBooleanFilter
          query={query}
          selectedQueryId="91"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
          {...props}
        />
      </DndProvider>
    );

  beforeEach(() => {
    onBooleanChange = jest.fn();
    onMove = jest.fn();
    onRemove = jest.fn();
    onSelect = jest.fn();

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
  });

  it("should render a select containing an option for each boolean operator, with the current operator selected", () => {
    renderFilter();

    const select = screen.getByRole("combobox");
    const options = screen.getAllByRole("option");

    expect(options).toHaveLength(2);

    expect(options[0]).toHaveValue("and");
    expect(options[0]).toHaveTextContent(
      "All of these filters must be matched:"
    );

    expect(options[1]).toHaveValue("or");
    expect(options[1]).toHaveTextContent(
      "Any of these filters may be matched:"
    );

    expect(select).toHaveValue("and");
  });

  it("should disable the boolean operator select when readOnly is true", () => {
    renderFilter({ readOnly: true });

    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("should call onBooleanChange when the boolean operator changes", async () => {
    const user = userEvent.setup();
    renderFilter();

    await user.selectOptions(screen.getByRole("combobox"), "or");

    expect(onBooleanChange).toHaveBeenCalledTimes(1);
    expect(onBooleanChange).toHaveBeenCalledWith("90", "or");
  });

  it("should render a remove button", () => {
    const { container } = renderFilter();

    const button = container.querySelector(
      ".advanced-search-boolean-filter > header button"
    );

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("×");
  });

  it("should not render a remove button when readOnly is true", () => {
    const { container } = renderFilter({ readOnly: true });

    // readOnly propagates to all descendants, so there are no remove buttons at all.
    expect(
      container.querySelector(".advanced-search-boolean-filter > header button")
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should call onRemove when the remove button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderFilter();

    await user.click(
      container.querySelector(".advanced-search-boolean-filter > header button")
    );

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("90");
  });

  it("should call onSelect when clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderFilter();

    await user.click(
      container.querySelector(".advanced-search-boolean-filter")
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("90");
  });

  it("should call onSelect when the space bar is depressed", async () => {
    const user = userEvent.setup();
    const { container } = renderFilter();

    // The filter is a focusable treeitem; focus it and press space, as a
    // keyboard user would.
    const item = container.querySelector(
      ".advanced-search-boolean-filter"
    ) as HTMLElement;
    item.focus();
    await user.keyboard(" ");

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("90");
  });

  it("should render an AdvancedSearchFilter for each child", () => {
    const { container } = renderFilter();

    // Each child value query renders an AdvancedSearchValueFilter showing its label.
    const childFilters = container.querySelectorAll(
      ".advanced-search-value-filter"
    );

    expect(childFilters).toHaveLength(2);
    expect(screen.getByText("Title foo")).toBeInTheDocument();
    expect(screen.getByText("Title bar")).toBeInTheDocument();
  });

  it("should propagate the readOnly prop to AdvancedSearchFilter children", () => {
    const { container } = renderFilter({ readOnly: true });

    // The two children still render, but readOnly means none of them (or the
    // parent) render a remove button.
    expect(
      container.querySelectorAll(".advanced-search-value-filter")
    ).toHaveLength(2);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it('should separate child filters with "and" when the boolean operator is AND', () => {
    const { container } = renderFilter();

    const separators = container.querySelectorAll(
      ".advanced-search-boolean-filter > ul > li > span"
    );

    expect(separators).toHaveLength(1);
    expect(separators[0]).toHaveTextContent("and");
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

    const { container } = renderFilter();

    const separators = container.querySelectorAll(
      ".advanced-search-boolean-filter > ul > li > span"
    );

    expect(separators).toHaveLength(1);
    expect(separators[0]).toHaveTextContent("or");
  });

  it("should apply the selected class when the query id equals the selectedQueryId", () => {
    const { container } = renderFilter({ selectedQueryId: "90" });

    expect(
      container.querySelector(".advanced-search-boolean-filter")
    ).toHaveClass("selected");
  });

  it("should not apply the selected class when readOnly is true", () => {
    const { container } = renderFilter({
      readOnly: true,
      selectedQueryId: "90",
    });

    expect(
      container.querySelector(".advanced-search-boolean-filter")
    ).not.toHaveClass("selected");
  });
});

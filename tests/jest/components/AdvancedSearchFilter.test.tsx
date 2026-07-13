import * as React from "react";
import { render, screen } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchFilter from "../../../src/components/AdvancedSearchFilter";

describe("AdvancedSearchFilter", () => {
  let onBooleanChange;
  let onMove;
  let onSelect;
  let onRemove;

  const renderFilter = (props) =>
    render(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilter
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
    onSelect = jest.fn();
    onRemove = jest.fn();
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

    const { container } = renderFilter({ query, selectedQueryId: "90" });

    // The boolean filter is the only thing with a select (the operator picker),
    // and it renders one value filter per child.
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("and");
    expect(
      container.querySelectorAll(".advanced-search-value-filter")
    ).toHaveLength(2);
    expect(screen.getByText("Title foo")).toBeInTheDocument();
    expect(screen.getByText("Title bar")).toBeInTheDocument();

    // selectedQueryId matches the boolean query, so it is selected.
    expect(
      container.querySelector(".advanced-search-boolean-filter")
    ).toHaveClass("selected");
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

    renderFilter({ query, readOnly: true, selectedQueryId: "90" });

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("or");
    // readOnly disables the operator select and removes all remove buttons.
    expect(select).toBeDisabled();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should render an AdvancedSearchValueFilter if the query is a not a boolean", () => {
    const query = {
      id: "91",
      key: "title",
      value: "foo",
    };

    renderFilter({
      query,
      readOnly: true,
      selectedQueryId: "90",
    });

    // A value filter has no operator select; readOnly removes its remove button.
    expect(screen.getByText("Title foo")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should not select the AdvancedSearchValueFilter when selectedQueryId does not match the query id", () => {
    const query = {
      id: "91",
      key: "title",
      value: "foo",
    };

    // Not readOnly, so selection is driven purely by the id comparison:
    // selectedQueryId ("90") does not match the query id ("91").
    const { container } = renderFilter({ query, selectedQueryId: "90" });

    expect(
      container.querySelector(".advanced-search-value-filter")
    ).not.toHaveClass("selected");
  });

  it("should select the AdvancedSearchValueFilter if the query is a not a boolean and selectedQueryId is the id of the query", () => {
    const query = {
      id: "91",
      key: "title",
      value: "foo",
    };

    const { container } = renderFilter({ query, selectedQueryId: "91" });

    expect(
      container.querySelector(".advanced-search-value-filter")
    ).toHaveClass("selected");
  });
});

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchFilterViewer from "../../../src/components/AdvancedSearchFilterViewer";

describe("AdvancedSearchFilterViewer", () => {
  let onBooleanChange;
  let onMove;
  let onSelect;
  let onRemove;
  let query;

  beforeEach(() => {
    onBooleanChange = jest.fn();
    onMove = jest.fn();
    onSelect = jest.fn();
    onRemove = jest.fn();

    query = {
      id: "0",
      key: "genre",
      value: "Horror",
    };
  });

  it("should render an AdvancedSearchFilter", () => {
    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilterViewer
          query={query}
          readOnly={false}
          selectedQueryId="0"
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </DndProvider>
    );

    // The viewer wraps its filter in a tree container and passes the query through,
    // so the value filter renders inside it.
    expect(screen.getByRole("tree")).toBeInTheDocument();
    expect(screen.getByText("Genre Horror")).toBeInTheDocument();

    // readOnly is false and selectedQueryId matches the query id, so it is selected.
    expect(
      container.querySelector(".advanced-search-value-filter")
    ).toHaveClass("selected");
  });
});

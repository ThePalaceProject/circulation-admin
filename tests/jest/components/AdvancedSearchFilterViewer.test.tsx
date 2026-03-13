import * as React from "react";
import { render } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchFilterViewer from "../../../src/components/lists/AdvancedSearchFilterViewer";

const query = {
  id: "0",
  key: "genre",
  value: "Horror",
};

describe("AdvancedSearchFilterViewer", () => {
  it("renders the filter tree with the query", () => {
    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilterViewer
          query={query}
          readOnly={false}
          selectedQueryId="0"
          onBooleanChange={jest.fn()}
          onMove={jest.fn()}
          onSelect={jest.fn()}
          onRemove={jest.fn()}
        />
      </DndProvider>
    );
    expect(
      container.querySelector(".advanced-search-filter-tree")
    ).toBeInTheDocument();
  });

  it("renders the filter content (genre and value)", () => {
    const { container } = render(
      <DndProvider backend={HTML5Backend}>
        <AdvancedSearchFilterViewer
          query={query}
          readOnly={false}
          selectedQueryId="0"
          onBooleanChange={jest.fn()}
          onMove={jest.fn()}
          onSelect={jest.fn()}
          onRemove={jest.fn()}
        />
      </DndProvider>
    );
    // The filter renders a treeitem with the genre and value
    const treeitem = container.querySelector("[role='treeitem']");
    expect(treeitem).toBeInTheDocument();
    expect(treeitem!.textContent).toContain("Horror");
  });
});

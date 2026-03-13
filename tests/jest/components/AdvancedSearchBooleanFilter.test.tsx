import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdvancedSearchBooleanFilter from "../../../src/components/lists/AdvancedSearchBooleanFilter";

const andQuery = {
  id: "90",
  and: [
    { id: "91", key: "title", value: "foo" },
    { id: "92", key: "title", value: "bar" },
  ],
};

function renderBooleanFilter(props = {}) {
  const defaultProps = {
    query: andQuery,
    selectedQueryId: "91",
    onBooleanChange: jest.fn(),
    onMove: jest.fn(),
    onSelect: jest.fn(),
    onRemove: jest.fn(),
  };
  return render(
    <DndProvider backend={HTML5Backend}>
      <AdvancedSearchBooleanFilter {...defaultProps} {...props} />
    </DndProvider>
  );
}

describe("AdvancedSearchBooleanFilter", () => {
  it("renders a select with boolean operator options, with the current operator selected", () => {
    const { container } = renderBooleanFilter();
    const select = container.querySelector(
      ".advanced-search-boolean-filter > header select"
    ) as HTMLSelectElement;
    const options = select.querySelectorAll("option");

    expect(options.length).toBe(2);
    expect((options[0] as HTMLOptionElement).value).toBe("and");
    expect(options[0].textContent).toBe(
      "All of these filters must be matched:"
    );
    expect(select.value).toBe("and");

    expect((options[1] as HTMLOptionElement).value).toBe("or");
    expect(options[1].textContent).toBe("Any of these filters may be matched:");
  });

  it("disables the boolean operator select when readOnly is true", () => {
    const { container } = renderBooleanFilter({ readOnly: true });
    const select = container.querySelector(
      ".advanced-search-boolean-filter > header select"
    ) as HTMLSelectElement;
    expect(select.disabled).toBe(true);
  });

  it("calls onBooleanChange when the boolean operator changes", () => {
    const onBooleanChange = jest.fn();
    const { container } = renderBooleanFilter({ onBooleanChange });
    const select = container.querySelector(
      ".advanced-search-boolean-filter > header select"
    ) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "or" } });
    expect(onBooleanChange).toHaveBeenCalledTimes(1);
    expect(onBooleanChange).toHaveBeenCalledWith("90", "or");
  });

  it("renders a remove button", () => {
    const { container } = renderBooleanFilter();
    const button = container.querySelector(
      ".advanced-search-boolean-filter > header button"
    );
    expect(button).not.toBeNull();
    expect(button.textContent).toBe("×");
  });

  it("does not render a remove button when readOnly is true", () => {
    const { container } = renderBooleanFilter({ readOnly: true });
    const button = container.querySelector(
      ".advanced-search-boolean-filter > header button"
    );
    expect(button).toBeNull();
  });

  it("calls onRemove when the remove button is clicked", () => {
    const onRemove = jest.fn();
    const { container } = renderBooleanFilter({ onRemove });
    const button = container.querySelector(
      ".advanced-search-boolean-filter > header button"
    );
    fireEvent.click(button);
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith("90");
  });

  it("calls onSelect when clicked", () => {
    const onSelect = jest.fn();
    const { container } = renderBooleanFilter({ onSelect });
    const filter = container.querySelector(".advanced-search-boolean-filter");
    fireEvent.click(filter);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("90");
  });

  it("calls onSelect when the space bar is pressed", () => {
    const onSelect = jest.fn();
    const { container } = renderBooleanFilter({ onSelect });
    const filter = container.querySelector(".advanced-search-boolean-filter");
    fireEvent.keyDown(filter, { key: " " });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("90");
  });

  it("renders an AdvancedSearchFilter for each child query", () => {
    const { container } = renderBooleanFilter();
    const list = container.querySelector(
      ".advanced-search-boolean-filter > ul"
    );
    const items = list.querySelectorAll("li");
    // 2 children → 2 list items
    expect(items.length).toBe(2);
    // Each contains a nested filter (value filter for leaf nodes)
    expect(
      items[0].querySelector(".advanced-search-value-filter")
    ).not.toBeNull();
    expect(
      items[1].querySelector(".advanced-search-value-filter")
    ).not.toBeNull();
  });

  it('separates child filters with "and" when the boolean operator is AND', () => {
    const { container } = renderBooleanFilter();
    const separators = container.querySelectorAll(
      ".advanced-search-boolean-filter > ul > li > span"
    );
    expect(separators.length).toBe(1);
    expect(separators[0].textContent).toBe("and");
  });

  it('separates child filters with "or" when the boolean operator is OR', () => {
    const orQuery = {
      id: "90",
      or: [
        { id: "91", key: "title", value: "foo" },
        { id: "92", key: "title", value: "bar" },
      ],
    };
    const { container } = renderBooleanFilter({ query: orQuery });
    const separators = container.querySelectorAll(
      ".advanced-search-boolean-filter > ul > li > span"
    );
    expect(separators.length).toBe(1);
    expect(separators[0].textContent).toBe("or");
  });

  it("applies the selected class when the query id equals the selectedQueryId", () => {
    const { container } = renderBooleanFilter({ selectedQueryId: "90" });
    expect(
      container
        .querySelector(".advanced-search-boolean-filter")
        .classList.contains("selected")
    ).toBe(true);
  });

  it("does not apply the selected class when readOnly is true", () => {
    const { container } = renderBooleanFilter({
      readOnly: true,
      selectedQueryId: "90",
    });
    expect(
      container
        .querySelector(".advanced-search-boolean-filter")
        .classList.contains("selected")
    ).toBe(false);
  });

  it("propagates the readOnly prop to AdvancedSearchFilter children", () => {
    const { container } = renderBooleanFilter({ readOnly: true });
    const list = container.querySelector(
      ".advanced-search-boolean-filter > ul"
    );
    const items = list.querySelectorAll("li");
    // In readOnly mode, child value filters should also be read-only (no remove buttons)
    items.forEach((item) => {
      expect(item.querySelector("button")).toBeNull();
    });
  });
});

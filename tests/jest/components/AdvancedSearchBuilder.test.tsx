import * as React from "react";
import { render, screen } from "@testing-library/react";

// AdvancedSearchBuilder is a pure forwarding component: it renders an
// AdvancedSearchFilterInput and an AdvancedSearchFilterViewer and threads their
// callbacks up to the builder's handlers, prefixed with the builder `name`. Mock
// both children to markers that capture the props they receive, so those
// forwarding closures can be exercised directly — including `onMove`, which is
// otherwise only reachable through a real react-dnd drag that jsdom can't perform.
let inputProps: any;
let viewerProps: any;
jest.mock("../../../src/components/AdvancedSearchFilterInput", () => ({
  __esModule: true,
  default: (props: any) => {
    inputProps = props;
    return <div data-testid="filter-input" data-name={props.name} />;
  },
}));
jest.mock("../../../src/components/AdvancedSearchFilterViewer", () => ({
  __esModule: true,
  default: (props: any) => {
    viewerProps = props;
    return (
      <div
        data-testid="filter-viewer"
        data-read-only={String(props.readOnly)}
      />
    );
  },
}));

import AdvancedSearchBuilder from "../../../src/components/AdvancedSearchBuilder";

describe("AdvancedSearchBuilder", () => {
  const query = { id: "0", key: "genre", value: "Horror" };

  const renderBuilder = (overrides: Record<string, unknown> = {}) => {
    const handlers = {
      addQuery: jest.fn(),
      updateClearFiltersFlag: jest.fn(),
      updateQueryBoolean: jest.fn(),
      moveQuery: jest.fn(),
      removeQuery: jest.fn(),
      selectQuery: jest.fn(),
    };
    render(
      <AdvancedSearchBuilder
        isOwner
        name="include"
        query={query as any}
        selectedQueryId="0"
        {...handlers}
        {...overrides}
      />
    );
    return handlers;
  };

  beforeEach(() => {
    inputProps = undefined;
    viewerProps = undefined;
  });

  it("renders the filter input and the viewer", () => {
    renderBuilder();

    expect(screen.getByTestId("filter-input")).toHaveAttribute(
      "data-name",
      "include"
    );
    expect(screen.getByTestId("filter-viewer")).toBeInTheDocument();
    expect(viewerProps.query).toBe(query);
    expect(viewerProps.selectedQueryId).toBe("0");
  });

  it("hides the filter input and marks the viewer read-only when not the owner", () => {
    renderBuilder({ isOwner: false });

    expect(screen.queryByTestId("filter-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("filter-viewer")).toHaveAttribute(
      "data-read-only",
      "true"
    );
  });

  it("forwards the input's onAdd and clear-filters callbacks with the builder name", () => {
    const { addQuery, updateClearFiltersFlag } = renderBuilder();

    const newQuery = { key: "title", value: "The Shining" };
    inputProps.onAdd(newQuery);
    inputProps.onClearFiltersFlagChange(true);

    expect(addQuery).toHaveBeenCalledWith("include", newQuery);
    expect(updateClearFiltersFlag).toHaveBeenCalledWith("include", true);
  });

  it("forwards the viewer's callbacks to their handlers with the builder name", () => {
    const { updateQueryBoolean, moveQuery, removeQuery, selectQuery } =
      renderBuilder();

    viewerProps.onBooleanChange("2", "or");
    viewerProps.onMove("2", "33");
    viewerProps.onRemove("2");
    viewerProps.onSelect("2");

    expect(updateQueryBoolean).toHaveBeenCalledWith("include", "2", "or");
    expect(moveQuery).toHaveBeenCalledWith("include", "2", "33");
    expect(removeQuery).toHaveBeenCalledWith("include", "2");
    expect(selectQuery).toHaveBeenCalledWith("include", "2");
  });
});

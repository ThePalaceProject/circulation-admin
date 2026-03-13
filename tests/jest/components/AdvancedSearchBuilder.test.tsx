import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdvancedSearchBuilder from "../../../src/components/lists/AdvancedSearchBuilder";

// Mock heavy children to capture prop passing
jest.mock("../../../src/components/lists/AdvancedSearchFilterInput", () => {
  const Mock = (props: any) => (
    <button
      data-testid="filter-input"
      data-name={props.name}
      onClick={() => props.onAdd && props.onAdd({ key: "title", value: "X" })}
    />
  );
  Mock.displayName = "MockAdvancedSearchFilterInput";
  return { __esModule: true, default: Mock };
});

jest.mock("../../../src/components/lists/AdvancedSearchFilterViewer", () => {
  const Mock = (props: any) => (
    <div
      data-testid="filter-viewer"
      data-readonly={String(props.readOnly)}
      data-selectedqueryid={props.selectedQueryId}
    >
      <button
        data-testid="boolean-btn"
        onClick={() =>
          props.onBooleanChange && props.onBooleanChange("2", "or")
        }
      />
      <button
        data-testid="move-btn"
        onClick={() => props.onMove && props.onMove("2", "33")}
      />
      <button
        data-testid="remove-btn"
        onClick={() => props.onRemove && props.onRemove("2")}
      />
      <button
        data-testid="select-btn"
        onClick={() => props.onSelect && props.onSelect("2")}
      />
    </div>
  );
  Mock.displayName = "MockAdvancedSearchFilterViewer";
  return { __esModule: true, default: Mock };
});

const query = {
  id: "0",
  key: "genre",
  value: "Horror",
};

const makeMockProps = () => ({
  isOwner: true as boolean,
  name: "include",
  query,
  selectedQueryId: "0",
  addQuery: jest.fn(),
  updateQueryBoolean: jest.fn(),
  moveQuery: jest.fn(),
  removeQuery: jest.fn(),
  selectQuery: jest.fn(),
});

describe("AdvancedSearchBuilder", () => {
  it("renders AdvancedSearchFilterInput and AdvancedSearchFilterViewer", () => {
    const props = makeMockProps();
    render(<AdvancedSearchBuilder {...props} />);
    expect(screen.getByTestId("filter-input")).toBeInTheDocument();
    expect(screen.getByTestId("filter-input")).toHaveAttribute(
      "data-name",
      "include"
    );
    expect(screen.getByTestId("filter-viewer")).toBeInTheDocument();
  });

  it("does not render AdvancedSearchFilterInput when isOwner is false", () => {
    const props = makeMockProps();
    render(<AdvancedSearchBuilder {...props} isOwner={false} />);
    expect(screen.queryByTestId("filter-input")).not.toBeInTheDocument();
  });

  it("sets readOnly to true on AdvancedSearchFilterViewer when isOwner is false", () => {
    const props = makeMockProps();
    render(<AdvancedSearchBuilder {...props} isOwner={false} />);
    expect(screen.getByTestId("filter-viewer")).toHaveAttribute(
      "data-readonly",
      "true"
    );
  });

  it("calls addQuery with correct name when a query is added", () => {
    const props = makeMockProps();
    render(<AdvancedSearchBuilder {...props} />);
    fireEvent.click(screen.getByTestId("filter-input"));
    expect(props.addQuery).toHaveBeenCalledTimes(1);
    expect(props.addQuery).toHaveBeenCalledWith("include", {
      key: "title",
      value: "X",
    });
  });

  it("calls updateQueryBoolean with correct name when boolean operator is changed", () => {
    const props = makeMockProps();
    render(<AdvancedSearchBuilder {...props} />);
    fireEvent.click(screen.getByTestId("boolean-btn"));
    expect(props.updateQueryBoolean).toHaveBeenCalledTimes(1);
    expect(props.updateQueryBoolean).toHaveBeenCalledWith("include", "2", "or");
  });

  it("calls moveQuery with correct name when a query is moved", () => {
    const props = makeMockProps();
    render(<AdvancedSearchBuilder {...props} />);
    fireEvent.click(screen.getByTestId("move-btn"));
    expect(props.moveQuery).toHaveBeenCalledTimes(1);
    expect(props.moveQuery).toHaveBeenCalledWith("include", "2", "33");
  });

  it("calls removeQuery with correct name when a query is removed", () => {
    const props = makeMockProps();
    render(<AdvancedSearchBuilder {...props} />);
    fireEvent.click(screen.getByTestId("remove-btn"));
    expect(props.removeQuery).toHaveBeenCalledTimes(1);
    expect(props.removeQuery).toHaveBeenCalledWith("include", "2");
  });

  it("calls selectQuery with correct name when a query is selected", () => {
    const props = makeMockProps();
    render(<AdvancedSearchBuilder {...props} />);
    fireEvent.click(screen.getByTestId("select-btn"));
    expect(props.selectQuery).toHaveBeenCalledTimes(1);
    expect(props.selectQuery).toHaveBeenCalledWith("include", "2");
  });
});

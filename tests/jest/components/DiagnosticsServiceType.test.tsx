import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DiagnosticsServiceType from "../../../src/components/diagnostics/DiagnosticsServiceType";

const ts1 = {
  service: "test_service_1",
  id: "1",
  start: "start_time_string_1",
  duration: "0",
  collection_name: "collection1",
};
const ts2 = {
  service: "test_service_2",
  id: "2",
  start: "start_time_string_2",
  duration: "0",
  collection_name: "collection2",
};

const services = {
  test_service_1: { collection1: [ts1] },
  test_service_2: { collection2: [ts2] },
} as any;

jest.mock("../../../src/components/diagnostics/DiagnosticsServiceTabs", () => {
  const MockTabs = (props: any) => (
    <div data-testid="diagnostics-service-tabs" data-tab={props.tab} />
  );
  MockTabs.displayName = "MockDiagnosticsServiceTabs";
  return { __esModule: true, default: MockTabs };
});

describe("DiagnosticsServiceType", () => {
  it("renders with config and services classes", () => {
    const { container } = render(
      <DiagnosticsServiceType type="monitor" services={services} />
    );
    expect(container.querySelector(".config.services")).toBeInTheDocument();
  });

  it("renders service tabs with initial tab", () => {
    const { getByTestId } = render(
      <DiagnosticsServiceType type="monitor" services={services} />
    );
    const tabs = getByTestId("diagnostics-service-tabs");
    expect(tabs).toBeInTheDocument();
    expect(tabs.getAttribute("data-tab")).toBe("test_service_1");
  });

  it("displays a message if there are no services", () => {
    const { container } = render(
      <DiagnosticsServiceType type="monitor" services={null} />
    );
    expect(container.querySelector(".config.services")).toBeInTheDocument();
    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span.textContent).toBe("There are currently no monitor services.");
  });
});

import * as React from "react";
import { render } from "@testing-library/react";
import DebugResult from "../../../src/components/DebugResult";
import { PatronDebugResult } from "../../../src/api/patronDebug";

describe("DebugResult", () => {
  const renderResult = (result: PatronDebugResult, sequence = 0) => {
    return render(<DebugResult result={result} sequence={sequence} />);
  };

  it("renders success result with string details", () => {
    const result: PatronDebugResult = {
      label: "SIP2 Connection",
      success: true,
      details: "Connected to server:6001",
    };
    const { getByText } = renderResult(result);
    expect(getByText("SIP2 Connection")).toBeInTheDocument();
    expect(getByText("passed")).toBeInTheDocument();
    expect(getByText("Connected to server:6001")).toBeInTheDocument();
  });

  it("renders failure result with string details", () => {
    const result: PatronDebugResult = {
      label: "Password Validation",
      success: false,
      details: "Password does not match",
    };
    const { getByText, container } = renderResult(result);
    expect(getByText("Password Validation")).toBeInTheDocument();
    expect(getByText("failed")).toBeInTheDocument();
    const li = container.querySelector("li");
    expect(li).toHaveClass("failure");
  });

  it("renders success result with CSS class", () => {
    const result: PatronDebugResult = {
      label: "Step 1",
      success: true,
      details: null,
    };
    const { container } = renderResult(result);
    const li = container.querySelector("li");
    expect(li).toHaveClass("success");
  });

  it("renders null details without detail section", () => {
    const result: PatronDebugResult = {
      label: "Step 1",
      success: true,
      details: null,
    };
    const { container } = renderResult(result);
    expect(container.querySelector(".debug-result-detail")).toBeNull();
    expect(container.querySelector(".debug-result-table")).toBeNull();
    expect(container.querySelector(".debug-result-list")).toBeNull();
  });

  it("renders list details as ordered list in panel", () => {
    const result: PatronDebugResult = {
      label: "Multi Result",
      success: true,
      details: ["item one", "item two", "item three"],
    };
    const { getByText, container } = renderResult(result);
    expect(getByText("item one")).toBeInTheDocument();
    expect(getByText("item two")).toBeInTheDocument();
    expect(getByText("item three")).toBeInTheDocument();
    const ol = container.querySelector(".debug-result-list");
    expect(ol).toBeInTheDocument();
  });

  it("renders dict details as key-value table in panel", () => {
    const result: PatronDebugResult = {
      label: "Patron Data",
      success: true,
      details: {
        username: "jdoe",
        barcode: "12345",
        fines: "0.00",
      },
    };
    const { getByText, container } = renderResult(result);
    expect(getByText("username")).toBeInTheDocument();
    expect(getByText("jdoe")).toBeInTheDocument();
    expect(getByText("barcode")).toBeInTheDocument();
    expect(getByText("12345")).toBeInTheDocument();
    const table = container.querySelector(".debug-result-table");
    expect(table).toBeInTheDocument();
  });

  it("renders dict details with nested object values as JSON", () => {
    const result: PatronDebugResult = {
      label: "SirsiDynix Data",
      success: true,
      details: {
        patronType: { key: "testtype", label: "Test Type" },
        name: "Jane Doe",
      },
    };
    const { getByText, container } = renderResult(result);
    expect(getByText("patronType")).toBeInTheDocument();
    // Nested object should render as pretty-printed JSON inside a <code> tag
    const codeEl = container.querySelector(
      "td.debug-result-value code"
    ) as HTMLElement;
    expect(codeEl).toBeInTheDocument();
    expect(codeEl.textContent).toBe(
      JSON.stringify({ key: "testtype", label: "Test Type" }, null, 2)
    );
    expect(getByText("name")).toBeInTheDocument();
    expect(getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders top-level number details as text content", () => {
    const result: PatronDebugResult = {
      label: "Retry Count",
      success: true,
      details: 3,
    };
    const { getByText, container } = renderResult(result);
    expect(getByText("Retry Count")).toBeInTheDocument();
    expect(getByText("3")).toBeInTheDocument();
    expect(container.querySelector(".debug-result-table")).toBeNull();
  });

  it("renders top-level boolean details as text content", () => {
    const result: PatronDebugResult = {
      label: "Eligibility",
      success: false,
      details: false,
    };
    const { getByText, container } = renderResult(result);
    expect(getByText("Eligibility")).toBeInTheDocument();
    expect(getByText("false")).toBeInTheDocument();
    expect(container.querySelector(".debug-result-table")).toBeNull();
  });

  it("renders dict details with mixed value types (number, boolean, null)", () => {
    const result: PatronDebugResult = {
      label: "Mixed Data",
      success: true,
      details: {
        username: "jdoe",
        fines: 2.5,
        active: true,
        block_reason: null,
      },
    };
    const { getByText, container } = renderResult(result);
    expect(getByText("username")).toBeInTheDocument();
    expect(getByText("jdoe")).toBeInTheDocument();
    expect(getByText("fines")).toBeInTheDocument();
    expect(getByText("2.5")).toBeInTheDocument();
    expect(getByText("active")).toBeInTheDocument();
    expect(getByText("true")).toBeInTheDocument();
    expect(getByText("block_reason")).toBeInTheDocument();
    expect(getByText("null")).toBeInTheDocument();
    const table = container.querySelector(".debug-result-table");
    expect(table).toBeInTheDocument();
  });
});

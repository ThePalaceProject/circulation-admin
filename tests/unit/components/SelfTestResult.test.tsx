import * as React from "react";
import { render, screen } from "@testing-library/react";

import SelfTestResult from "../../../src/components/SelfTestResult";
import { SelfTestsResult } from "../../../src/interfaces";

const stringResult: SelfTestsResult = {
  duration: 0,
  end: "",
  name: "Test Result",
  result: "abc",
  start: "",
  success: true,
};

describe("SelfTestResult", () => {
  it("displays a result with a string", () => {
    const { container } = render(
      <SelfTestResult result={stringResult} isFetching={false} />
    );

    expect(container.querySelector("li")).toHaveClass("success");

    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
      "Test Result"
    );

    const testResult = container.querySelector("pre");
    expect(testResult).toHaveClass("result-description");
    expect(testResult).toHaveTextContent("abc");

    expect(screen.getByText("success: true")).toHaveClass(
      "success-description"
    );

    // A single-line string result is not shown in a collapsible panel.
    expect(container.querySelector(".panel")).not.toBeInTheDocument();
  });

  it("displays a result with a multi-line string", () => {
    const longStringResult: SelfTestsResult = {
      ...stringResult,
      result: "abc \n def",
    };
    const { container } = render(
      <SelfTestResult result={longStringResult} isFetching={false} />
    );

    const panel = container.querySelector(".panel");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveClass("panel-success");
    expect(screen.getByText("Results")).toBeInTheDocument();

    expect(container.querySelector("pre")?.textContent).toBe("abc \n def");
  });

  it("displays a result with an array", () => {
    const arrayResult: SelfTestsResult = {
      ...stringResult,
      result: ["Thing 1", "Thing 2"],
    };
    const { container } = render(
      <SelfTestResult result={arrayResult} isFetching={false} />
    );

    const panel = container.querySelector(".panel");
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveClass("panel-success");
    expect(screen.getByText("Results (2)")).toBeInTheDocument();

    const items = container.querySelectorAll("ol li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Thing 1");
    expect(items[1]).toHaveTextContent("Thing 2");
  });

  it("displays a result with an empty array", () => {
    const emptyArrayResult: SelfTestsResult = { ...stringResult, result: [] };
    const { container } = render(
      <SelfTestResult result={emptyArrayResult} isFetching={false} />
    );

    expect(container.querySelector(".panel")).not.toBeInTheDocument();
    expect(
      screen.getByText("The test ran successfully, but no results were found.")
    ).toHaveClass("warning");
  });

  it("displays a result with an exception", () => {
    const exceptionResult: SelfTestsResult = {
      ...stringResult,
      success: false,
      exception: { class: "IntegrationException", message: "Problem!" },
    };
    const { container } = render(
      <SelfTestResult result={exceptionResult} isFetching={false} />
    );

    expect(container.querySelector("li")).toHaveClass("failure");
    expect(screen.getByText("success: false")).toHaveClass(
      "success-description"
    );
    expect(screen.getByText("exception: Problem!")).toHaveClass(
      "exception-description"
    );
  });

  it("displays debug_message when present", () => {
    const exceptionResult: SelfTestsResult = {
      ...stringResult,
      success: false,
      exception: {
        class: "IntegrationException",
        debug_message: "debug message...",
        message: "Problem!",
      },
    };
    render(<SelfTestResult result={exceptionResult} isFetching={false} />);

    expect(screen.getByText("debug: debug message...")).toHaveClass(
      "debug-description"
    );
  });

  it("does not display debug_message when it is empty", () => {
    const exceptionResult: SelfTestsResult = {
      ...stringResult,
      success: false,
      exception: {
        class: "IntegrationException",
        debug_message: "",
        message: "Problem!",
      },
    };
    const { container } = render(
      <SelfTestResult result={exceptionResult} isFetching={false} />
    );

    expect(
      container.querySelector(".exception-description")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".debug-description")
    ).not.toBeInTheDocument();
  });

  it("does not display debug_message when it is absent", () => {
    const exceptionResult: SelfTestsResult = {
      ...stringResult,
      success: false,
      exception: { class: "IntegrationException", message: "Problem!" },
    };
    const { container } = render(
      <SelfTestResult result={exceptionResult} isFetching={false} />
    );

    expect(
      container.querySelector(".exception-description")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".debug-description")
    ).not.toBeInTheDocument();
  });
});

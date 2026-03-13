import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SelfTestResult from "../../../src/components/config/SelfTestResult";

const stringResult = {
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
    expect(container.firstChild).toHaveClass("success");

    const testName = container.querySelector("h4");
    expect(testName).not.toBeNull();
    expect(testName.textContent).toEqual("Test Result");

    const testResult = container.querySelector("pre");
    expect(testResult).not.toBeNull();
    expect(testResult.classList.contains("result-description")).toBe(true);
    expect(testResult.textContent).toEqual("abc");

    const successP = container.querySelector("p.success-description");
    expect(successP).not.toBeNull();
    expect(successP.textContent).toEqual("success: true");

    expect(container.querySelector(".collapsible")).not.toBeInTheDocument();
  });

  it("displays a result with a multi-line string inside a collapsible panel", () => {
    const longStringResult = { ...stringResult, result: "abc \n def" };
    const { container } = render(
      <SelfTestResult result={longStringResult} isFetching={false} />
    );

    const panel = container.querySelector(".panel");
    expect(panel).toBeInTheDocument();
    expect(panel.classList.contains("panel-success")).toBe(true);

    // Expand the panel
    fireEvent.click(panel.querySelector("button"));

    const spans = panel.querySelectorAll("span");
    expect(spans[0].textContent).toEqual("Results");

    expect(container.querySelector("pre").textContent).toEqual("abc \n def");
  });

  it("displays a result with an array inside a collapsible panel", () => {
    const arrayResult = {
      ...stringResult,
      result: ["Thing 1", "Thing 2"],
    };
    const { container } = render(
      <SelfTestResult result={arrayResult} isFetching={false} />
    );

    const panel = container.querySelector(".panel");
    expect(panel).toBeInTheDocument();
    expect(panel.classList.contains("panel-success")).toBe(true);

    // Expand the panel
    fireEvent.click(panel.querySelector("button"));

    const spans = panel.querySelectorAll("span");
    expect(spans[0].textContent).toEqual("Results (2)");

    const list = container.querySelector("ol");
    expect(list).toBeInTheDocument();
    const items = list.querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toEqual("Thing 1");
    expect(items[1].textContent).toEqual("Thing 2");
  });

  it("displays a result with an empty array", () => {
    const emptyArrayResult = { ...stringResult, result: [] };
    const { container } = render(
      <SelfTestResult result={emptyArrayResult} isFetching={false} />
    );

    expect(container.querySelector(".collapsible")).not.toBeInTheDocument();
    const warning = container.querySelector(".warning");
    expect(warning).toBeInTheDocument();
    expect(warning.textContent).toEqual(
      "The test ran successfully, but no results were found."
    );
  });

  it("displays a result with an exception", () => {
    const exceptionResult = {
      ...stringResult,
      success: false,
      exception: {
        class: "IntegrationException",
        message: "Problem!",
      },
    };
    const { container } = render(
      <SelfTestResult result={exceptionResult} isFetching={false} />
    );

    expect(container.firstChild).toHaveClass("failure");
    expect(container.querySelector(".success-description").textContent).toEqual(
      "success: false"
    );
    const testException = container.querySelector(".exception-description");
    expect(testException).not.toBeNull();
    expect(testException.textContent).toEqual("exception: Problem!");
  });

  it("displays debug_message when present", () => {
    const exceptionResult = {
      ...stringResult,
      success: false,
      exception: {
        class: "IntegrationException",
        debug_message: "debug message...",
        message: "Problem!",
      },
    };
    const { container } = render(
      <SelfTestResult result={exceptionResult} isFetching={false} />
    );

    const debugMessage = container.querySelector(".debug-description");
    expect(debugMessage).not.toBeNull();
    expect(debugMessage.textContent).toEqual("debug: debug message...");
  });

  it("does not display debug_message when it is empty", () => {
    const exceptionResult = {
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

    expect(container.querySelector(".exception-description")).not.toBeNull();
    expect(
      container.querySelector(".debug-description")
    ).not.toBeInTheDocument();
  });

  it("does not display debug_message when absent", () => {
    const exceptionResult = {
      ...stringResult,
      success: false,
      exception: {
        class: "IntegrationException",
        message: "Problem!",
      },
    };
    const { container } = render(
      <SelfTestResult result={exceptionResult} isFetching={false} />
    );

    expect(container.querySelector(".exception-description")).not.toBeNull();
    expect(
      container.querySelector(".debug-description")
    ).not.toBeInTheDocument();
  });
});

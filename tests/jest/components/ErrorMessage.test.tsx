import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorMessage from "../../../src/components/shared/ErrorMessage";

describe("ErrorMessage", () => {
  it("shows logged out message for 401 error", () => {
    const error = { status: 401, response: "", url: "" };
    const { container } = render(<ErrorMessage error={error} />);
    expect(
      container.querySelector(".alert-destructive, [role='alert']").textContent
    ).toContain("logged out");
  });

  it("shows detail for problem detail JSON response", () => {
    const error = {
      status: 500,
      response: JSON.stringify({ status: 500, detail: "detail" }),
      url: "",
    };
    const { container } = render(<ErrorMessage error={error} />);
    expect(container.querySelector("[role='alert']").textContent).toContain(
      "detail"
    );
  });

  it("shows response for non-JSON response", () => {
    const error = { status: 500, response: "response", url: "" };
    const { container } = render(<ErrorMessage error={error} />);
    expect(container.querySelector("[role='alert']").textContent).toContain(
      "response"
    );
  });

  it("shows try again button and calls callback on click", () => {
    const error = { status: 500, response: "response", url: "" };
    const tryAgain = jest.fn();
    render(<ErrorMessage error={error} tryAgain={tryAgain} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(tryAgain).toHaveBeenCalledTimes(1);
  });
});

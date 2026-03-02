import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import PasswordInput from "../../../src/components/PasswordInput";

describe("PasswordInput", () => {
  it("defaults to type='password'", () => {
    const { getByLabelText } = render(
      <label>
        PIN
        <PasswordInput />
      </label>
    );
    expect(getByLabelText("PIN")).toHaveAttribute("type", "password");
  });

  it("toggles to type='text' when show button is clicked", () => {
    const { getByLabelText } = render(
      <label>
        PIN
        <PasswordInput />
      </label>
    );
    const input = getByLabelText("PIN");
    const toggleBtn = getByLabelText("Show password");

    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute("type", "text");

    fireEvent.click(getByLabelText("Hide password"));
    expect(input).toHaveAttribute("type", "password");
  });

  it("has correct aria-label on toggle button", () => {
    const { getByLabelText, queryByLabelText } = render(
      <label>
        PIN
        <PasswordInput />
      </label>
    );

    expect(getByLabelText("Show password")).toBeInTheDocument();
    expect(queryByLabelText("Hide password")).not.toBeInTheDocument();

    fireEvent.click(getByLabelText("Show password"));

    expect(getByLabelText("Hide password")).toBeInTheDocument();
    expect(queryByLabelText("Show password")).not.toBeInTheDocument();
  });

  it("passes through standard input props", () => {
    const handleChange = jest.fn();
    const { getByLabelText } = render(
      <label>
        PIN
        <PasswordInput
          id="test-pw"
          className="form-control"
          value="secret"
          onChange={handleChange}
          autoComplete="off"
        />
      </label>
    );

    const input = getByLabelText("PIN");
    expect(input).toHaveAttribute("id", "test-pw");
    expect(input).toHaveClass("form-control");
    expect(input).toHaveAttribute("value", "secret");
    expect(input).toHaveAttribute("autoComplete", "off");

    fireEvent.change(input, { target: { value: "new-value" } });
    expect(handleChange).toHaveBeenCalled();
  });

  it("renders the wrapper div with password-input-wrapper class", () => {
    const { container } = render(<PasswordInput />);
    expect(
      container.querySelector(".password-input-wrapper")
    ).toBeInTheDocument();
  });
});

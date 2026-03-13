import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import SaveButton from "../../../src/components/shared/SaveButton";

describe("SaveButton", () => {
  it("should say 'Save' if no text prop has been passed in", () => {
    const { getByRole } = render(<SaveButton disabled={false} />);
    expect(getByRole("button")).toHaveTextContent("Save");
  });

  it("should display text from the text prop, if there is one", () => {
    const { getByRole } = render(
      <SaveButton disabled={false} text="some other string" />
    );
    expect(getByRole("button")).toHaveTextContent("some other string");
  });

  it("should call submit when clicked", () => {
    const submit = jest.fn();
    const { getByRole } = render(
      <SaveButton disabled={false} submit={submit} />
    );
    fireEvent.click(getByRole("button"));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("should not call submit when disabled", () => {
    const submit = jest.fn();
    const { getByRole } = render(
      <SaveButton disabled={true} submit={submit} />
    );
    fireEvent.click(getByRole("button"));
    expect(submit).not.toHaveBeenCalled();
  });
});

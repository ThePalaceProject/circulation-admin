import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SaveButton from "../../../src/components/SaveButton";

describe("SaveButton", () => {
  it("says 'Save' when given no text", () => {
    render(<SaveButton disabled={false} submit={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("displays the text it is given", () => {
    render(
      <SaveButton
        disabled={false}
        submit={jest.fn()}
        text="some other string"
      />
    );

    expect(
      screen.getByRole("button", { name: "some other string" })
    ).toBeInTheDocument();
  });

  it("submits when clicked", async () => {
    const submit = jest.fn();
    render(<SaveButton disabled={false} submit={submit} />);

    await userEvent.click(screen.getByRole("button"));

    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", async () => {
    const submit = jest.fn();
    render(<SaveButton disabled={true} submit={submit} />);

    await userEvent.click(screen.getByRole("button"));

    expect(submit).not.toHaveBeenCalled();
  });
});

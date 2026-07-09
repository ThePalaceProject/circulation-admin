import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WithEditButton from "../../../src/components/WithEditButton";

describe("WithEditButton", () => {
  it("shows children", () => {
    render(
      <WithEditButton disabled={false} onEdit={jest.fn()}>
        child
      </WithEditButton>
    );

    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("shows an edit button", () => {
    render(
      <WithEditButton disabled={false} onEdit={jest.fn()}>
        child
      </WithEditButton>
    );

    expect(screen.getByRole("button")).toHaveClass("edit-btn");
  });

  it("calls onEdit when clicked", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    render(
      <WithEditButton disabled={false} onEdit={onEdit}>
        child
      </WithEditButton>
    );

    await user.click(screen.getByRole("button"));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    render(
      <WithEditButton disabled={true} onEdit={onEdit}>
        child
      </WithEditButton>
    );

    await user.click(screen.getByRole("button"));

    expect(onEdit).not.toHaveBeenCalled();
  });
});

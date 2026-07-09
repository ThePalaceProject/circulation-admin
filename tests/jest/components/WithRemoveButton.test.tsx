import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WithRemoveButton from "../../../src/components/WithRemoveButton";

describe("WithRemoveButton", () => {
  it("shows children", () => {
    render(
      <WithRemoveButton disabled={false} onRemove={jest.fn()}>
        child
      </WithRemoveButton>
    );

    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("shows a remove button", () => {
    render(
      <WithRemoveButton disabled={false} onRemove={jest.fn()}>
        child
      </WithRemoveButton>
    );

    expect(screen.getByRole("button")).toHaveClass("remove-btn");
  });

  it("calls onRemove when clicked", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    render(
      <WithRemoveButton disabled={false} onRemove={onRemove}>
        child
      </WithRemoveButton>
    );

    await user.click(screen.getByRole("button"));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("does nothing when disabled", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    render(
      <WithRemoveButton disabled={true} onRemove={onRemove}>
        child
      </WithRemoveButton>
    );

    await user.click(screen.getByRole("button"));

    expect(onRemove).not.toHaveBeenCalled();
  });

  it("calls onRemove when confirmation returns true", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    const confirmRemoval = jest.fn().mockReturnValue(true);
    render(
      <WithRemoveButton
        disabled={false}
        onRemove={onRemove}
        confirmRemoval={confirmRemoval}
      >
        child
      </WithRemoveButton>
    );

    await user.click(screen.getByRole("button"));

    expect(confirmRemoval).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("does not call onRemove when confirmation returns false", async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();
    const confirmRemoval = jest.fn().mockReturnValue(false);
    render(
      <WithRemoveButton
        disabled={false}
        onRemove={onRemove}
        confirmRemoval={confirmRemoval}
      >
        child
      </WithRemoveButton>
    );

    await user.click(screen.getByRole("button"));

    expect(confirmRemoval).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });
});

import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "../../../../src/components/compat";

describe("compat Button", () => {
  it("renders a submit button with the default content", () => {
    render(<Button />);
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("class", "btn");
    expect(button).toBeEnabled();
  });

  it("renders the given content, type, and class", () => {
    render(<Button content="Save" type="button" className="left-align" />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("class", "btn left-align");
  });

  it("disables the button", () => {
    render(<Button disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("passes other props to the button", () => {
    render(<Button aria-label="Close the dialog" title="Close" />);
    const button = screen.getByRole("button", { name: "Close the dialog" });
    expect(button).toHaveAttribute("title", "Close");
  });

  it("calls the callback on a click", async () => {
    const user = userEvent.setup();
    const callback = vi.fn();
    render(<Button callback={callback} type="button" />);

    await user.click(screen.getByRole("button"));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls the callback on a mouse down, not on the click, with `mouseDown`", async () => {
    const user = userEvent.setup();
    const callback = vi.fn();
    render(<Button callback={callback} mouseDown={true} type="button" />);
    const button = screen.getByRole("button");

    await user.pointer({ keys: "[MouseLeft>]", target: button });
    expect(callback).toHaveBeenCalledTimes(1);
    await user.pointer({ keys: "[/MouseLeft]", target: button });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("lets an `onClick` prop replace the callback", async () => {
    const user = userEvent.setup();
    const callback = vi.fn();
    const onClick = vi.fn();
    render(<Button callback={callback} onClick={onClick} type="button" />);

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
  });

  it("lets an `onMouseDown` prop replace the callback with `mouseDown`", async () => {
    const user = userEvent.setup();
    const callback = vi.fn();
    const onMouseDown = vi.fn();
    render(
      <Button
        callback={callback}
        onMouseDown={onMouseDown}
        mouseDown={true}
        type="button"
      />
    );

    await user.pointer({
      keys: "[MouseLeft>]",
      target: screen.getByRole("button"),
    });

    expect(onMouseDown).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
  });
});

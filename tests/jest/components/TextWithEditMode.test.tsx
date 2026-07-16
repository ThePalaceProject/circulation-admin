import * as React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextWithEditMode from "../../../src/components/TextWithEditMode";

describe("TextWithEditMode", () => {
  it("renders text", () => {
    const { rerender } = render(
      <TextWithEditMode
        text="test"
        placeholder="editable thing"
        aria-label="label"
      />
    );
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Edit editable thing/ })
    ).toBeInTheDocument();

    rerender(
      <TextWithEditMode
        text="other text"
        placeholder="editable thing"
        aria-label="label"
      />
    );
    expect(screen.queryByText("test")).not.toBeInTheDocument();
    expect(screen.getByText("other text")).toBeInTheDocument();
  });

  it("starts in edit mode if there's no text", () => {
    render(
      <TextWithEditMode placeholder="editable thing" aria-label="label" />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "editable thing");
    expect(input).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /Save editable thing/ })
    ).toBeInTheDocument();
  });

  it("switches to edit mode", async () => {
    const user = userEvent.setup();
    render(
      <TextWithEditMode
        text="test"
        placeholder="editable thing"
        aria-label="label"
      />
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Edit editable thing/ })
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "editable thing");
    expect(input).toHaveValue("test");
    expect(screen.getByRole("button", { name: /Save/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Edit/ })
    ).not.toBeInTheDocument();
  });

  it("switches out of edit mode", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    render(
      <TextWithEditMode
        placeholder="editable thing"
        onUpdate={onUpdate}
        aria-label="label"
      />
    );
    // Type the new value into the field; the component reads the real input
    // value back through its ref on save (no prototype stubbing).
    await user.type(screen.getByRole("textbox"), "new value");
    await user.click(
      screen.getByRole("button", { name: /Save editable thing/ })
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith("new value");
    expect(screen.getByText("new value")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Edit/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Save/ })
    ).not.toBeInTheDocument();
  });

  it("gets text via the ref API", async () => {
    const user = userEvent.setup();
    // In display mode, getText() returns the current text.
    const displayRef = React.createRef<TextWithEditMode>();
    const { unmount } = render(
      <TextWithEditMode
        text="test"
        placeholder="editable thing"
        aria-label="label"
        ref={displayRef}
      />
    );
    expect(displayRef.current!.getText()).toBe("test");
    unmount();

    // From edit mode, getText() returns the current input value and exits edit mode.
    const editRef = React.createRef<TextWithEditMode>();
    render(
      <TextWithEditMode
        placeholder="editable thing"
        aria-label="label"
        ref={editRef}
      />
    );
    await user.type(screen.getByRole("textbox"), "new value");
    let value = "";
    act(() => {
      value = editRef.current!.getText();
    });
    expect(value).toBe("new value");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("resets via the ref API", async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();

    // With no text prop, reset() returns to a blank edit mode.
    const blankRef = React.createRef<TextWithEditMode>();
    const { unmount } = render(
      <TextWithEditMode
        placeholder="editable thing"
        onUpdate={onUpdate}
        aria-label="label"
        ref={blankRef}
      />
    );
    await user.type(screen.getByRole("textbox"), "new value");
    await user.click(
      screen.getByRole("button", { name: /Save editable thing/ })
    );
    expect(screen.getByText("new value")).toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledTimes(1);

    act(() => {
      blankRef.current!.reset();
    });
    expect(screen.queryByText("new value")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(onUpdate.mock.calls[1][0]).toBeUndefined();
    unmount();

    // With a text prop, reset() returns to displaying that text.
    const textRef = React.createRef<TextWithEditMode>();
    render(
      <TextWithEditMode
        text="test"
        placeholder="editable thing"
        onUpdate={onUpdate}
        aria-label="label"
        ref={textRef}
      />
    );
    await user.click(
      screen.getByRole("button", { name: /Edit editable thing/ })
    );
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "new value");
    await user.click(
      screen.getByRole("button", { name: /Save editable thing/ })
    );
    expect(screen.queryByText("test")).not.toBeInTheDocument();
    expect(screen.getByText("new value")).toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledTimes(3);

    act(() => {
      textRef.current!.reset();
    });
    expect(screen.queryByText("new value")).not.toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledTimes(4);
    expect(onUpdate.mock.calls[3][0]).toBe("test");
  });

  it("optionally disables the save button if the text is blank", async () => {
    const user = userEvent.setup();
    render(
      <TextWithEditMode
        placeholder="editable thing"
        aria-label="label"
        disableIfBlank
      />
    );
    const saveButton = screen.getByRole("button", {
      name: /Save editable thing/,
    });
    expect(saveButton).toBeDisabled();

    await user.type(screen.getByRole("textbox"), "test");
    expect(saveButton).toBeEnabled();
  });

  it("updates the displayed value as the user types", async () => {
    const user = userEvent.setup();
    render(
      <TextWithEditMode placeholder="editable thing" aria-label="label" />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");
    await user.type(input, "test");
    expect(input).toHaveValue("test");
  });
});

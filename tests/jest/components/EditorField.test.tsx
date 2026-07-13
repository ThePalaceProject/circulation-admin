import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import { RichUtils } from "draft-js";

import EditorField from "../../../src/components/EditorField";

describe("EditorField", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the three inline-style buttons and toggles the matching style on mouse-down", () => {
    // There is no DOM-observable effect of toggling an inline style over a
    // collapsed (unfocused) selection, so we drive the real mouse-down interaction
    // and observe the actual `RichUtils.toggleInlineStyle` call the button triggers.
    const toggleSpy = jest.spyOn(RichUtils, "toggleInlineStyle");

    const { container } = render(
      <EditorField content="This is a summary." disabled={false} />
    );

    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons).toHaveLength(3);
    const [bold, italic, underline] = buttons;

    expect(bold).toHaveTextContent("Bold");
    expect(bold.querySelector("b")).toBeInTheDocument();
    expect(italic).toHaveTextContent("Italic");
    expect(italic.querySelector("i")).toBeInTheDocument();
    expect(underline).toHaveTextContent("Underline");
    expect(underline.querySelector("u")).toBeInTheDocument();

    expect(toggleSpy).not.toHaveBeenCalled();

    fireEvent.mouseDown(bold);
    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(toggleSpy.mock.calls[0][1]).toBe("BOLD");

    fireEvent.mouseDown(italic);
    expect(toggleSpy).toHaveBeenCalledTimes(2);
    expect(toggleSpy.mock.calls[1][1]).toBe("ITALIC");

    fireEvent.mouseDown(underline);
    expect(toggleSpy).toHaveBeenCalledTimes(3);
    expect(toggleSpy.mock.calls[2][1]).toBe("UNDERLINE");
  });

  it("exposes the current content as HTML through getValue()", () => {
    // `getValue()` is EditorField's real imperative API (BookEditForm reads it via a
    // ref), so mirror that: render with a ref and call it.
    const ref = React.createRef<EditorField>();
    render(
      <EditorField ref={ref} content="This is a summary." disabled={false} />
    );
    expect(ref.current?.getValue()).toBe("<p>This is a summary.</p>");
  });

  it("falls back to the default content when the content is empty", () => {
    const expected = "<p>Update the content for this field.</p>";

    const emptyParagraphRef = React.createRef<EditorField>();
    render(
      <EditorField ref={emptyParagraphRef} content="<p></p>" disabled={false} />
    );
    expect(emptyParagraphRef.current?.getValue()).toBe(expected);

    const emptyStringRef = React.createRef<EditorField>();
    render(<EditorField ref={emptyStringRef} content="" disabled={false} />);
    expect(emptyStringRef.current?.getValue()).toBe(expected);

    const undefinedRef = React.createRef<EditorField>();
    render(
      <EditorField ref={undefinedRef} content={undefined} disabled={false} />
    );
    expect(undefinedRef.current?.getValue()).toBe(expected);
  });

  it("disables the toolbar buttons and the editor when disabled", () => {
    const { container, rerender } = render(
      <EditorField content="This is a summary." disabled={false} />
    );

    const buttons = () => Array.from(container.querySelectorAll("button"));
    const editable = () => container.querySelector("[contenteditable]");

    expect(buttons()).toHaveLength(3);
    buttons().forEach((button) => expect(button).not.toBeDisabled());
    expect(editable()).toHaveAttribute("contenteditable", "true");

    rerender(<EditorField content="This is a summary." disabled={true} />);

    buttons().forEach((button) => expect(button).toBeDisabled());
    expect(editable()).toHaveAttribute("contenteditable", "false");
  });
});

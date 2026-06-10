import * as React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import JsonField, { JsonFieldHandle } from "../../../src/components/JsonField";

const setting = {
  key: "my_json",
  label: "JSON Setting",
  description: "<p>A JSON field</p>",
};

const requiredSetting = { ...setting, required: true };

describe("JsonField", () => {
  it("renders textarea with label and description", () => {
    render(<JsonField setting={setting} />);
    expect(screen.getByLabelText("JSON Setting")).toBeInstanceOf(
      HTMLTextAreaElement
    );
    expect(screen.getByText("A JSON field")).toBeInTheDocument();
  });

  it("shows empty textarea for null value", () => {
    render(<JsonField setting={setting} value={null} />);
    const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
    expect(ta.value).toBe("");
  });

  it("shows empty textarea when no value prop provided", () => {
    render(<JsonField setting={setting} />);
    const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
    expect(ta.value).toBe("");
  });

  it("displays pretty-printed JSON for an object value", () => {
    const obj = { foo: "bar", baz: 42 };
    render(<JsonField setting={setting} value={obj} />);
    const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
    expect(ta.value).toBe(JSON.stringify(obj, null, 2));
  });

  it("displays pretty-printed JSON for an array value", () => {
    const arr = [1, "two", { three: 3 }];
    render(<JsonField setting={setting} value={arr} />);
    const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
    expect(ta.value).toBe(JSON.stringify(arr, null, 2));
  });

  it("resets textarea when value prop changes externally", () => {
    const { rerender } = render(
      <JsonField setting={setting} value={{ a: 1 }} />
    );
    const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
    expect(ta.value).toBe(JSON.stringify({ a: 1 }, null, 2));

    rerender(<JsonField setting={setting} value={{ b: 2 }} />);
    expect(ta.value).toBe(JSON.stringify({ b: 2 }, null, 2));
  });

  it("shows inline error for invalid JSON input", () => {
    render(<JsonField setting={setting} />);
    const ta = screen.getByLabelText("JSON Setting");
    fireEvent.change(ta, { target: { value: "not valid json" } });
    expect(screen.getByText(/unexpected token|expected/i)).toBeInTheDocument();
  });

  it("clears the error when input becomes valid JSON", () => {
    render(<JsonField setting={setting} />);
    const ta = screen.getByLabelText("JSON Setting");

    fireEvent.change(ta, { target: { value: "{invalid" } });
    expect(screen.getByText(/unexpected token|expected/i)).toBeInTheDocument();

    fireEvent.change(ta, { target: { value: '{"key":"value"}' } });
    expect(
      screen.queryByText(/unexpected token|expected/i)
    ).not.toBeInTheDocument();
  });

  it("clears the error when textarea is emptied", () => {
    render(<JsonField setting={setting} />);
    const ta = screen.getByLabelText("JSON Setting");

    fireEvent.change(ta, { target: { value: "bad" } });
    expect(screen.getByText(/unexpected token|expected/i)).toBeInTheDocument();

    fireEvent.change(ta, { target: { value: "" } });
    expect(
      screen.queryByText(/unexpected token|expected/i)
    ).not.toBeInTheDocument();
  });

  it("shows the Required badge for required settings", () => {
    render(<JsonField setting={requiredSetting} />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("disables the textarea when disabled prop is true", () => {
    render(<JsonField setting={setting} disabled={true} />);
    expect(screen.getByLabelText("JSON Setting")).toBeDisabled();
  });

  it("calls onChange with parsed value on valid input", () => {
    const onChange = jest.fn();
    render(<JsonField setting={setting} onChange={onChange} />);
    const ta = screen.getByLabelText("JSON Setting");

    fireEvent.change(ta, { target: { value: '{"x":1}' } });
    expect(onChange).toHaveBeenCalledWith({ x: 1 });
  });

  it("does not call onChange when JSON is invalid", () => {
    const onChange = jest.fn();
    render(<JsonField setting={setting} onChange={onChange} />);
    const ta = screen.getByLabelText("JSON Setting");

    fireEvent.change(ta, { target: { value: "{bad" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  describe("error message visibility", () => {
    it("is absent before the field is focused and there is no error", () => {
      render(<JsonField setting={setting} />);
      expect(
        document.querySelector(".json-field-error-msg")
      ).not.toBeInTheDocument();
    });

    it("appears (empty) when the field is focused with no error", () => {
      render(<JsonField setting={setting} />);
      const ta = screen.getByLabelText("JSON Setting");
      fireEvent.focus(ta);
      const el = document.querySelector(".json-field-error-msg");
      expect(el).toBeInTheDocument();
      expect(el!.textContent).toBe("");
    });

    it("disappears on blur when there is no error", () => {
      render(<JsonField setting={setting} />);
      const ta = screen.getByLabelText("JSON Setting");
      fireEvent.focus(ta);
      fireEvent.blur(ta);
      expect(
        document.querySelector(".json-field-error-msg")
      ).not.toBeInTheDocument();
    });

    it("stays visible after blur when there is an error", () => {
      render(<JsonField setting={setting} />);
      const ta = screen.getByLabelText("JSON Setting");
      fireEvent.focus(ta);
      fireEvent.change(ta, { target: { value: "bad json" } });
      fireEvent.blur(ta);
      expect(
        screen.getByText(/unexpected token|expected/i)
      ).toBeInTheDocument();
    });

    it("sets aria-invalid on the textarea when JSON is invalid", () => {
      render(<JsonField setting={setting} />);
      const ta = screen.getByLabelText("JSON Setting");
      expect(ta).not.toHaveAttribute("aria-invalid", "true");
      fireEvent.change(ta, { target: { value: "bad json" } });
      expect(ta).toHaveAttribute("aria-invalid", "true");
      fireEvent.change(ta, { target: { value: '{"x":1}' } });
      expect(ta).not.toHaveAttribute("aria-invalid", "true");
    });

    it("adds the error element id to aria-describedby when invalid", () => {
      render(<JsonField setting={setting} />);
      const ta = screen.getByLabelText("JSON Setting");
      expect(ta.getAttribute("aria-describedby") ?? "").not.toContain(
        "json-error-"
      );
      fireEvent.change(ta, { target: { value: "bad" } });
      expect(ta.getAttribute("aria-describedby")).toContain("json-error-");
    });

    it("includes the description element id in aria-describedby when description is present", () => {
      render(<JsonField setting={setting} />);
      const ta = screen.getByLabelText("JSON Setting");
      expect(ta.getAttribute("aria-describedby")).toContain("json-desc-");
    });
  });

  describe("getValue()", () => {
    it("returns null for empty textarea", () => {
      const ref = React.createRef<JsonFieldHandle>();
      render(<JsonField setting={setting} ref={ref} />);
      expect(ref.current!.getValue()).toBeNull();
    });

    it("returns parsed object for valid JSON", () => {
      const ref = React.createRef<JsonFieldHandle>();
      render(<JsonField setting={setting} ref={ref} />);
      const ta = screen.getByLabelText("JSON Setting");

      fireEvent.change(ta, { target: { value: '{"a":1}' } });
      expect(ref.current!.getValue()).toEqual({ a: 1 });
    });

    it("returns undefined for invalid JSON", () => {
      const ref = React.createRef<JsonFieldHandle>();
      render(<JsonField setting={setting} ref={ref} />);
      const ta = screen.getByLabelText("JSON Setting");

      fireEvent.change(ta, { target: { value: "not json" } });
      expect(ref.current!.getValue()).toBeUndefined();
    });
  });

  describe("Copy button", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        writable: true,
        configurable: true,
      });
    });

    it("is disabled when textarea is empty", () => {
      render(<JsonField setting={setting} />);
      expect(
        screen.getByRole("button", { name: "Copy to clipboard" })
      ).toBeDisabled();
    });

    it("is enabled when textarea has content", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      expect(
        screen.getByRole("button", { name: "Copy to clipboard" })
      ).not.toBeDisabled();
    });

    it("copies textarea text to clipboard", () => {
      const obj = { a: 1 };
      render(<JsonField setting={setting} value={obj} />);
      fireEvent.click(
        screen.getByRole("button", { name: "Copy to clipboard" })
      );
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify(obj, null, 2)
      );
    });

    it("shows Copied! text briefly after click then hides it", async () => {
      jest.useFakeTimers();
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: "Copy to clipboard" })
        );
      });
      expect(screen.getByText("Copied!")).toBeInTheDocument();
      act(() => jest.advanceTimersByTime(2000));
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
      jest.useRealTimers();
    });

    it("shows 'Copy failed.' when navigator.clipboard is unavailable", () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      fireEvent.click(
        screen.getByRole("button", { name: "Copy to clipboard" })
      );
      expect(screen.getByText("Copy failed.")).toBeInTheDocument();
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });

    it("shows 'Copy failed.' when clipboard write fails", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: jest.fn().mockRejectedValue(new Error("denied")),
        },
        writable: true,
        configurable: true,
      });
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: "Copy to clipboard" })
        );
      });
      const msg = screen.getByText("Copy failed.");
      expect(msg).toBeInTheDocument();
      expect(msg).toHaveAttribute("aria-live", "assertive");
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });
  });

  describe("Clear button", () => {
    it("is disabled when textarea is empty", () => {
      render(<JsonField setting={setting} />);
      expect(
        screen.getByRole("button", { name: "Clear field" })
      ).toBeDisabled();
    });

    it("is disabled when field is disabled", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} disabled={true} />);
      expect(
        screen.getByRole("button", { name: "Clear field" })
      ).toBeDisabled();
    });

    it("is disabled when field is readOnly", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} readOnly={true} />);
      expect(
        screen.getByRole("button", { name: "Clear field" })
      ).toBeDisabled();
    });

    it("clears the textarea when clicked", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
      expect(ta.value).not.toBe("");
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(ta.value).toBe("");
    });

    it("calls onChange with null when clicked", () => {
      const onChange = jest.fn();
      render(
        <JsonField setting={setting} value={{ a: 1 }} onChange={onChange} />
      );
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("clears inline JSON error when clicked", () => {
      render(<JsonField setting={setting} />);
      const ta = screen.getByLabelText("JSON Setting");
      fireEvent.change(ta, { target: { value: "bad json" } });
      expect(
        screen.queryByText(/unexpected token|expected/i)
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(
        screen.queryByText(/unexpected token|expected/i)
      ).not.toBeInTheDocument();
    });

    it("shows 'Cleared! Ctrl-Z / Cmd-Z to recover.' message after clicking", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      expect(screen.queryByText(/Cleared!/i)).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(
        screen.getByText("Cleared! Ctrl-Z / Cmd-Z to recover.")
      ).toBeInTheDocument();
    });

    it("hides 'Cleared!' message after timeout", () => {
      jest.useFakeTimers();
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(
        screen.getByText("Cleared! Ctrl-Z / Cmd-Z to recover.")
      ).toBeInTheDocument();
      act(() => jest.advanceTimersByTime(5000));
      expect(screen.queryByText(/Cleared!/i)).not.toBeInTheDocument();
      jest.useRealTimers();
    });

    it("hides 'Cleared!' message when user starts typing", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      const ta = screen.getByLabelText("JSON Setting");
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(
        screen.getByText("Cleared! Ctrl-Z / Cmd-Z to recover.")
      ).toBeInTheDocument();
      fireEvent.change(ta, { target: { value: "42" } });
      expect(screen.queryByText(/Cleared!/i)).not.toBeInTheDocument();
    });
  });

  describe("undo after clear (Ctrl+Z)", () => {
    it("restores content after clicking Clear then pressing Ctrl+Z", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
      const original = ta.value;

      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(ta.value).toBe("");

      fireEvent.keyDown(ta, { key: "z", ctrlKey: true });
      expect(ta.value).toBe(original);
    });

    it("hides 'Cleared!' message on undo", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      const ta = screen.getByLabelText("JSON Setting");
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(
        screen.getByText("Cleared! Ctrl-Z / Cmd-Z to recover.")
      ).toBeInTheDocument();
      fireEvent.keyDown(ta, { key: "z", ctrlKey: true });
      expect(screen.queryByText(/Cleared!/i)).not.toBeInTheDocument();
    });

    it("restores content using Cmd+Z (macOS)", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
      const original = ta.value;

      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      fireEvent.keyDown(ta, { key: "z", metaKey: true });
      expect(ta.value).toBe(original);
    });

    it("calls onChange with restored value on undo", () => {
      const onChange = jest.fn();
      const obj = { a: 1 };
      render(<JsonField setting={setting} value={obj} onChange={onChange} />);
      const ta = screen.getByLabelText("JSON Setting");

      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      onChange.mockClear();
      fireEvent.keyDown(ta, { key: "z", ctrlKey: true });
      expect(onChange).toHaveBeenCalledWith(obj);
    });

    it("does not undo when no clear has occurred", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;
      const original = ta.value;

      fireEvent.keyDown(ta, { key: "z", ctrlKey: true });
      expect(ta.value).toBe(original);
    });

    it("discards undo state once the user starts typing after a clear", () => {
      render(<JsonField setting={setting} value={{ a: 1 }} />);
      const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;

      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      fireEvent.change(ta, { target: { value: "42" } });
      fireEvent.keyDown(ta, { key: "z", ctrlKey: true });
      // Should stay at "42", not jump back to original
      expect(ta.value).toBe("42");
    });

    it("restores partial/invalid JSON text on undo without throwing", () => {
      render(<JsonField setting={setting} />);
      const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;

      fireEvent.change(ta, { target: { value: '{"partial":' } });
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      expect(ta.value).toBe("");

      fireEvent.keyDown(ta, { key: "z", ctrlKey: true });
      expect(ta.value).toBe('{"partial":');
      expect(
        screen.queryByText(/unexpected token|expected/i)
      ).toBeInTheDocument();
    });

    it("does not call onChange when restored text is invalid JSON", () => {
      const onChange = jest.fn();
      render(<JsonField setting={setting} onChange={onChange} />);
      const ta = screen.getByLabelText("JSON Setting");

      fireEvent.change(ta, { target: { value: '{"partial":' } });
      fireEvent.click(screen.getByRole("button", { name: "Clear field" }));
      onChange.mockClear();

      fireEvent.keyDown(ta, { key: "z", ctrlKey: true });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("clear()", () => {
    it("resets text and clears parse error", () => {
      const ref = React.createRef<JsonFieldHandle>();
      render(<JsonField setting={setting} ref={ref} value={{ a: 1 }} />);
      const ta = screen.getByLabelText("JSON Setting") as HTMLTextAreaElement;

      expect(ta.value).toBe(JSON.stringify({ a: 1 }, null, 2));

      fireEvent.change(ta, { target: { value: "bad json" } });
      expect(
        screen.queryByText(/unexpected token|expected/i)
      ).toBeInTheDocument();

      act(() => {
        ref.current!.clear();
      });

      expect(ta.value).toBe("");
      expect(
        screen.queryByText(/unexpected token|expected/i)
      ).not.toBeInTheDocument();
    });

    it("calls onChange with null when cleared programmatically", () => {
      const onChange = jest.fn();
      const ref = React.createRef<JsonFieldHandle>();
      render(
        <JsonField
          setting={setting}
          ref={ref}
          value={{ a: 1 }}
          onChange={onChange}
        />
      );

      act(() => {
        ref.current!.clear();
      });

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });
});

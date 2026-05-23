import * as React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JsonField from "../../../src/components/JsonField";

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

  describe("getValue()", () => {
    it("returns null for empty textarea", () => {
      const ref = React.createRef<JsonField>();
      render(<JsonField setting={setting} ref={ref} />);
      expect(ref.current!.getValue()).toBeNull();
    });

    it("returns parsed object for valid JSON", () => {
      const ref = React.createRef<JsonField>();
      render(<JsonField setting={setting} ref={ref} />);
      const ta = screen.getByLabelText("JSON Setting");

      fireEvent.change(ta, { target: { value: '{"a":1}' } });
      expect(ref.current!.getValue()).toEqual({ a: 1 });
    });

    it("returns undefined for invalid JSON", () => {
      const ref = React.createRef<JsonField>();
      render(<JsonField setting={setting} ref={ref} />);
      const ta = screen.getByLabelText("JSON Setting");

      fireEvent.change(ta, { target: { value: "not json" } });
      expect(ref.current!.getValue()).toBeUndefined();
    });
  });

  describe("clear()", () => {
    it("resets text and clears parse error", () => {
      const ref = React.createRef<JsonField>();
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
  });
});

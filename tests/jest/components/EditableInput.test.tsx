import * as React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditableInput from "../../../src/components/EditableInput";

describe("EditableInput", () => {
  it("renders an accessible description if a description prop is supplied and a label prop is supplied", () => {
    const label = "input1";
    const description = "this is a field";

    render(
      <EditableInput
        label={label}
        optionalText={false}
        description={description}
      />
    );

    const textbox = screen.getByRole("textbox", { name: label });

    expect(textbox).toHaveAccessibleDescription(description);
  });

  it("renders an accessible description if a description prop is supplied and a label prop is not supplied", () => {
    const description = "this is a field";

    render(<EditableInput optionalText={false} description={description} />);

    const textbox = screen.getByRole("textbox");

    expect(textbox).toHaveAccessibleDescription(description);
  });

  it("renders an accessible description if optionalText is true", () => {
    render(<EditableInput optionalText={true} />);

    const textbox = screen.getByRole("textbox");

    expect(textbox).toHaveAccessibleDescription(/optional/i);
  });

  it("associates accessible descriptions with the correct inputs when multiple instances are present", () => {
    const descriptions = ["desc 1", "desc 2", "desc 3"];

    render(
      <div>
        <EditableInput optionalText={false} description={descriptions[0]} />
        <EditableInput optionalText={false} />
        <EditableInput optionalText={false} />
        <EditableInput optionalText={false} description={descriptions[1]} />
        <EditableInput optionalText={false} description={descriptions[2]} />
        <EditableInput optionalText={false} />
      </div>
    );

    const textboxes = screen.getAllByRole("textbox");

    expect(textboxes[0]).toHaveAccessibleDescription(descriptions[0]);
    expect(textboxes[1]).toHaveAccessibleDescription("");
    expect(textboxes[2]).toHaveAccessibleDescription("");
    expect(textboxes[3]).toHaveAccessibleDescription(descriptions[1]);
    expect(textboxes[4]).toHaveAccessibleDescription(descriptions[2]);
    expect(textboxes[5]).toHaveAccessibleDescription("");
  });
});

// Value/change handling, the prop-sync in componentWillReceiveProps, and the
// imperative ref API (getValue/getChecked/setValue/clear) that parents like
// ProtocolFormField use.
describe("EditableInput - value, change, and imperative API", () => {
  it("updates as the user types and reports the value via getValue()", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const ref = React.createRef<EditableInput>();
    render(
      <EditableInput ref={ref} label="Field" value="" onChange={onChange} />
    );

    const input = screen.getByRole("textbox", { name: "Field" });
    await user.type(input, "hello");

    expect(input).toHaveValue("hello");
    expect(ref.current?.getValue()).toBe("hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("toggles a checkbox and reports it via getChecked()", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<EditableInput>();
    render(
      <EditableInput ref={ref} type="checkbox" label="Check" checked={false} />
    );

    const box = screen.getByRole("checkbox", { name: "Check" });
    await user.click(box);

    expect(box).toBeChecked();
    expect(ref.current?.getChecked()).toBe(true);
  });

  it("does not fire onChange when readOnly", () => {
    const onChange = jest.fn();
    render(<EditableInput label="RO" value="x" readOnly onChange={onChange} />);

    // `userEvent.type` honors the DOM's read-only semantics and never dispatches
    // a change event, so it would never reach handleChange. Dispatch directly, so
    // the component's own readOnly guard is what stops onChange.
    fireEvent.change(screen.getByRole("textbox", { name: "RO" }), {
      target: { value: "y" },
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("syncs its value when the value prop changes", () => {
    const { rerender } = render(<EditableInput label="F" value="a" />);
    const input = screen.getByRole("textbox", { name: "F" });
    expect(input).toHaveValue("a");

    rerender(<EditableInput label="F" value="b" />);
    expect(input).toHaveValue("b");
  });

  it("syncs its checked state when the checked prop changes", () => {
    const { rerender } = render(
      <EditableInput type="checkbox" label="C" checked={false} />
    );
    const box = screen.getByRole("checkbox", { name: "C" });
    expect(box).not.toBeChecked();

    rerender(<EditableInput type="checkbox" label="C" checked={true} />);
    expect(box).toBeChecked();
  });

  it("setValue and clear update the value imperatively", () => {
    const ref = React.createRef<EditableInput>();
    render(<EditableInput ref={ref} label="F" value="a" />);
    const input = screen.getByRole("textbox", { name: "F" });

    act(() => ref.current?.setValue("z"));
    expect(input).toHaveValue("z");

    act(() => ref.current?.clear());
    expect(input).toHaveValue("");
  });

  it("clear also resets a checked box", () => {
    const ref = React.createRef<EditableInput>();
    render(
      <EditableInput ref={ref} type="checkbox" label="C" checked={true} />
    );
    const box = screen.getByRole("checkbox", { name: "C" });
    expect(box).toBeChecked();

    act(() => ref.current?.clear());
    expect(box).not.toBeChecked();
  });

  // A falsy-but-valid value must survive: this is what defaultValueIfMissing
  // guards, and what a naive `props.value || ""` would silently break.
  it("keeps a zero value rather than falling back to the empty default", () => {
    const { rerender } = render(<EditableInput label="F" value={0} />);
    const input = screen.getByRole("textbox", { name: "F" });
    expect(input).toHaveValue("0");

    rerender(<EditableInput label="F" value="a" />);
    expect(input).toHaveValue("a");

    rerender(<EditableInput label="F" value={0} />);
    expect(input).toHaveValue("0");
  });
});

describe("EditableInput - labels, children, and pass-through props", () => {
  it("labels a radio input and toggles it", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<EditableInput>();
    render(
      <EditableInput
        ref={ref}
        type="radio"
        label="Radio label"
        name="r"
        checked={false}
      />
    );

    const radio = screen.getByRole("radio", { name: "Radio label" });
    expect(radio).not.toBeChecked();

    await user.click(radio);

    expect(radio).toBeChecked();
    expect(ref.current?.getChecked()).toBe(true);
  });

  it("renders children into the element", () => {
    render(
      <EditableInput elementType="select" label="S" name="s" value="b">
        <option value="a">option a</option>
        <option value="b">option b</option>
      </EditableInput>
    );

    const select = screen.getByRole("combobox", { name: "S" });
    expect(select).toHaveValue("b");
    expect(
      Array.from(select.querySelectorAll("option")).map((o) => o.textContent)
    ).toEqual(["option a", "option b"]);
  });

  it("forwards the disabled prop to the element", () => {
    render(<EditableInput label="F" name="name" disabled={true} value="v" />);
    expect(screen.getByRole("textbox", { name: "F" })).toBeDisabled();
  });

  // renderDescription uses dangerouslySetInnerHTML, and callers pass markup.
  it("renders the description as HTML", () => {
    const { container } = render(
      <EditableInput
        label="F"
        optionalText={false}
        description="<p>description</p>"
      />
    );

    const description = container.querySelector(".description");
    expect(description.innerHTML).toContain("<p>description</p>");
  });

  it("shows extra content in an add-on wrapper only when supplied", () => {
    const { container, rerender } = render(
      <EditableInput label="F" name="name" value="v" />
    );
    expect(container.querySelector(".with-add-on")).toBeNull();

    rerender(
      <EditableInput
        label="F"
        name="name"
        value="v"
        extraContent={<span>Extra content!</span>}
      />
    );

    const extra = container.querySelector(".with-add-on");
    expect(extra).not.toBeNull();
    expect(extra).toHaveTextContent("Extra content!");
  });
});

// The error styling is a compound predicate:
//   clientError || (error && error.status >= 400 && !value && required)
describe("EditableInput - error styling", () => {
  const formGroup = (container: HTMLElement) =>
    container.querySelector(".form-group");

  it("applies no error class by default", () => {
    const { container } = render(
      <EditableInput label="F" name="name" value="initial value" />
    );
    expect(formGroup(container)).not.toHaveClass("field-error");
  });

  it("applies the error class on a client error", () => {
    const { container } = render(
      <EditableInput
        label="F"
        name="name"
        value="initial value"
        clientError={true}
      />
    );
    expect(formGroup(container)).toHaveClass("field-error");
  });

  it("applies the error class for a blank required field after a server error", () => {
    const { container } = render(
      <EditableInput
        label="F"
        name="name"
        error={{ status: 400, response: "", url: "" }}
        required={true}
      />
    );
    expect(formGroup(container)).toHaveClass("field-error");
  });

  it("does not apply the error class when the required field has a value", () => {
    const { container } = render(
      <EditableInput
        label="F"
        name="name"
        value="a value"
        error={{ status: 400, response: "", url: "" }}
        required={true}
      />
    );
    expect(formGroup(container)).not.toHaveClass("field-error");
  });

  it("does not apply the error class for a server error on an optional field", () => {
    const { container } = render(
      <EditableInput
        label="F"
        name="name"
        error={{ status: 400, response: "", url: "" }}
        required={false}
      />
    );
    expect(formGroup(container)).not.toHaveClass("field-error");
  });
});

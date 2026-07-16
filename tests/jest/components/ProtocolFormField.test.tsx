import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProtocolFormField from "../../../src/components/ProtocolFormField";
import { MONOSPACE_FONT_STACK } from "../../../src/fonts";

describe("ProtocolFormField — json type", () => {
  const jsonSetting = {
    key: "config",
    label: "Config JSON",
    description: "<p>JSON configuration</p>",
    type: "json",
  };

  it("renders a textarea (not an input) for json type", () => {
    const value = { enabled: true, count: 3 };
    render(
      <ProtocolFormField setting={jsonSetting} disabled={false} value={value} />
    );
    const ta = screen.getByLabelText("Config JSON") as HTMLTextAreaElement;
    expect(ta.tagName).toBe("TEXTAREA");
    expect(ta.value).toBe(JSON.stringify(value, null, 2));
  });

  it("renders empty textarea for null value", () => {
    render(
      <ProtocolFormField setting={jsonSetting} disabled={false} value={null} />
    );
    const ta = screen.getByLabelText("Config JSON") as HTMLTextAreaElement;
    expect(ta.value).toBe("");
  });

  it("getValue() returns parsed object", () => {
    const ref = React.createRef<ProtocolFormField>();
    render(
      <ProtocolFormField setting={jsonSetting} disabled={false} ref={ref} />
    );
    const ta = screen.getByLabelText("Config JSON");
    fireEvent.change(ta, { target: { value: '{"x":42}' } });
    expect(ref.current!.getValue()).toEqual({ x: 42 });
  });

  it("clear() resets the textarea", () => {
    const ref = React.createRef<ProtocolFormField>();
    render(
      <ProtocolFormField
        setting={jsonSetting}
        disabled={false}
        ref={ref}
        value={{ x: 42 }}
      />
    );
    const ta = screen.getByLabelText("Config JSON") as HTMLTextAreaElement;
    expect(ta.value).not.toBe("");
    act(() => {
      ref.current!.clear();
    });
    expect(ta.value).toBe("");
  });
});

describe("ProtocolFormField — use_monospace_font", () => {
  (
    [
      { id: "text-input", use_monospace_font: true, hasStyle: true },
      {
        id: "textarea",
        type: "textarea",
        use_monospace_font: true,
        hasStyle: true,
      },
      { id: "absent", hasStyle: false },
    ] as {
      id: string;
      type?: string;
      use_monospace_font?: boolean;
      hasStyle: boolean;
    }[]
  ).forEach(({ id, type, use_monospace_font, hasStyle }) => {
    it(id, () => {
      render(
        <ProtocolFormField
          setting={{ key: "f", label: "My Field", type, use_monospace_font }}
          disabled={false}
        />
      );
      const el = screen.getByLabelText("My Field");
      if (hasStyle) {
        expect(el).toHaveStyle({ fontFamily: MONOSPACE_FONT_STACK });
      } else {
        expect(el).not.toHaveStyle({ fontFamily: MONOSPACE_FONT_STACK });
      }
    });
  });
});

describe("ProtocolFormField", () => {
  it("renders date-picker setting", async () => {
    const user = userEvent.setup();
    const emptyValue = "";
    const testDate = "2022-01-01";
    const datePickerLabel = "A date setting field";
    const fieldDescription = "Description of the setting";
    const setting = {
      key: "setting",
      label: datePickerLabel,
      description: `<p>${fieldDescription}</p>`,
      type: "date-picker",
    };

    render(<ProtocolFormField setting={setting} disabled={false} />);
    const input = screen.getByLabelText(datePickerLabel) as HTMLInputElement;

    expect(input.value).toBe(emptyValue);

    // Enter a date.
    await user.click(input);
    await user.keyboard(`${testDate}{enter}`);

    expect(input.value).toBe(testDate);
  });
});

// These render each setting `type` and assert the rendered control via the DOM,
// reading uncontrolled values through the component's real ref-based `getValue()`
// / `clear()` API (the same API production calls), like the json-type tests above.
describe("ProtocolFormField — setting types", () => {
  const baseSetting = {
    key: "setting",
    label: "label",
    description: "<p>description</p>",
  };

  const menuOptions = ["A", "B", "C"].map((x) => (
    <option key={x} value={x} aria-selected={false}>
      {x}
    </option>
  ));

  it("renders a text setting and reads/clears its value via ref", () => {
    const ref = React.createRef<ProtocolFormField>();
    render(
      <ProtocolFormField
        setting={baseSetting}
        disabled={false}
        value="test"
        ref={ref}
      />
    );
    const input = screen.getByLabelText("label") as HTMLInputElement;
    expect(input.tagName).toBe("INPUT");
    expect(input.value).toBe("test");
    expect(ref.current!.getValue()).toBe("test");

    act(() => {
      ref.current!.clear();
    });
    expect(input.value).toBe("");
  });

  it("shows an (Optional) prefix on the description of a non-required field", () => {
    const { container } = render(
      <ProtocolFormField setting={baseSetting} disabled={false} />
    );
    expect(container.querySelector(".description")).toHaveTextContent(
      "(Optional) description"
    );
  });

  it("renders a setting with a default value", () => {
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, default: "default" }}
        disabled={false}
      />
    );
    expect((screen.getByLabelText("label") as HTMLInputElement).value).toBe(
      "default"
    );
  });

  it("renders a number setting", () => {
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "number" }}
        disabled={false}
        value="42"
      />
    );
    expect((screen.getByLabelText("label") as HTMLInputElement).value).toBe(
      "42"
    );
  });

  it("renders a textarea setting", () => {
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "textarea" }}
        disabled={false}
        value="test"
      />
    );
    const ta = screen.getByLabelText("label") as HTMLTextAreaElement;
    expect(ta.tagName).toBe("TEXTAREA");
    expect(ta.value).toBe("test");
  });

  it("renders a select setting with its options", () => {
    render(
      <ProtocolFormField
        setting={{
          ...baseSetting,
          type: "select",
          options: [
            { key: "option1", label: "option 1" },
            { key: "option2", label: "option 2" },
          ],
        }}
        disabled={false}
      />
    );
    const select = screen.getByLabelText("label") as HTMLSelectElement;
    const options = within(select).getAllByRole(
      "option"
    ) as HTMLOptionElement[];
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe("option1");
    expect(options[0]).toHaveTextContent("option 1");
    expect(options[1].value).toBe("option2");
    expect(options[1]).toHaveTextContent("option 2");
  });

  it("renders a randomizable setting whose button generates a 32-char value", async () => {
    const user = userEvent.setup();
    const ref = React.createRef<ProtocolFormField>();
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, randomizable: true }}
        disabled={false}
        ref={ref}
      />
    );
    const button = screen.getByRole("button", { name: /random/i });
    await user.click(button);
    const value = ref.current!.getValue();
    expect(value).toHaveLength(32);
  });

  it("renders an image setting with a preview img", () => {
    const { container } = render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "image" }}
        disabled={false}
        value="image data"
      />
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toBe("image data");
  });

  it("renders a color-picker setting with its label and default value", () => {
    const { container } = render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "color-picker", default: "#aaaaaa" }}
        disabled={false}
      />
    );
    expect(screen.getByText("label")).toBeInTheDocument();
    const hidden = container.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement;
    expect(hidden.value).toBe("#aaaaaa");
  });

  it("renders a list setting and reads its value via ref", () => {
    const ref = React.createRef<ProtocolFormField>();
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "list" }}
        disabled={false}
        value={["item 1", "item 2"]}
        ref={ref}
      />
    );
    // The InputList renders an "Add" button.
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    expect(ref.current!.getValue()).toEqual(["item 1", "item 2"]);
  });

  it("optionally renders instructions for a list setting", () => {
    const { container } = render(
      <ProtocolFormField
        setting={{
          ...baseSetting,
          type: "list",
          instructions: "<ul><li>Step 1</li></ul>",
        }}
        disabled={false}
      />
    );
    const instructions = container.querySelector(".well");
    expect(instructions).not.toBeNull();
    expect(instructions).toHaveClass("description");
    expect(instructions).toHaveTextContent("Step 1");
  });

  it("renders a menu setting as a select", () => {
    const ref = React.createRef<ProtocolFormField>();
    const { container } = render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "menu", menuOptions }}
        disabled={false}
        value={[]}
        altValue="Alternate"
        ref={ref}
      />
    );
    expect(container.querySelector("select")).not.toBeNull();
    expect(ref.current!.getValue()).toEqual([]);
    // With no items selected, the InputList shows the alt text in their place.
    expect(screen.getByText("Alternate")).toBeInTheDocument();
  });

  it("renders a hidden setting inside an invisible wrapper and reads its value via ref", () => {
    const ref = React.createRef<ProtocolFormField>();
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, hidden: true }}
        disabled={false}
        value="test"
        ref={ref}
      />
    );
    // The hidden element is wrapped in a visually-hidden div.
    const wrapper = screen.getByLabelText("label").closest("div[style]");
    expect(wrapper).toHaveStyle({ visibility: "hidden" });
    expect(ref.current!.getValue()).toBe("test");
  });

  it("reads the value of a hidden list setting via ref", () => {
    const ref = React.createRef<ProtocolFormField>();
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, hidden: true, type: "list" }}
        disabled={false}
        value={["item 1", "item 2"]}
        ref={ref}
      />
    );
    expect(ref.current!.getValue()).toEqual(["item 1", "item 2"]);
  });

  it("resolves a hidden select value: first option, then default, then explicit value", () => {
    const options = [
      { key: "option1", label: "option 1" },
      { key: "option2", label: "option 2" },
      { key: "option3", label: "option 3" },
    ];
    const selectValue = (extra: Record<string, unknown>, value?: string) => {
      const ref = React.createRef<ProtocolFormField>();
      render(
        <ProtocolFormField
          setting={
            {
              ...baseSetting,
              hidden: true,
              type: "select",
              options,
              ...extra,
            } as any
          }
          disabled={false}
          value={value}
          ref={ref}
        />
      );
      return ref.current!.getValue();
    };

    // No value and no default -> the first option.
    expect(selectValue({})).toBe("option1");
    // A default with no value -> the default.
    expect(selectValue({ default: "option3" })).toBe("option3");
    // An explicit value -> that value, overriding the default.
    expect(selectValue({ default: "option3" }, "option2")).toBe("option2");
  });

  // Hidden settings render the same element inside an invisible wrapper, so each
  // variant must still surface its value through its ref (elementRef for the
  // scalar inputs, colorPickerRef for the color picker, inputListRef for the
  // menu; hidden text and hidden list are covered above).
  it.each([
    {
      name: "date-picker",
      extra: { type: "date-picker" },
      value: "2020-06-01",
    },
    { name: "number", extra: { type: "number" }, value: "42" },
    { name: "textarea", extra: { type: "textarea" }, value: "some text" },
    { name: "color-picker", extra: { type: "color-picker" }, value: "#123456" },
    { name: "randomizable", extra: { randomizable: true }, value: "test" },
    { name: "menu", extra: { type: "menu", menuOptions }, value: ["A"] },
  ])(
    "reads a hidden $name setting's value back via its ref",
    ({ extra, value }) => {
      const ref = React.createRef<ProtocolFormField>();
      render(
        <ProtocolFormField
          setting={{ ...baseSetting, hidden: true, ...extra } as any}
          disabled={false}
          value={value as any}
          ref={ref}
        />
      );
      expect(ref.current!.getValue()).toEqual(value);
    }
  );

  it("falls back to the setting's default for a hidden setting with no value", () => {
    const ref = React.createRef<ProtocolFormField>();
    render(
      <ProtocolFormField
        setting={
          { ...baseSetting, hidden: true, default: "the default" } as any
        }
        disabled={false}
        ref={ref}
      />
    );
    expect(ref.current!.getValue()).toBe("the default");
  });

  it("does not submit a stale value through a hidden image setting", () => {
    const ref = React.createRef<ProtocolFormField>();
    const { container } = render(
      <ProtocolFormField
        setting={{ ...baseSetting, hidden: true, type: "image" } as any}
        disabled={false}
        value="data:image/png;base64,abc"
        ref={ref}
      />
    );
    // An image setting is a file input whose value is forced to undefined, so it
    // submits nothing; the current value is surfaced as a preview instead.
    expect(ref.current!.getValue()).toBe("");
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "data:image/png;base64,abc"
    );
  });

  it("forwards onChange to the underlying EditableInput", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <ProtocolFormField
        setting={baseSetting}
        disabled={false}
        onChange={onChange}
      />
    );
    await user.type(screen.getByLabelText("label"), "x");
    expect(onChange).toHaveBeenCalled();
  });

  it("forwards onChange to the InputList (a list setting reports add/remove)", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "list" }}
        disabled={false}
        value={[]}
        onChange={onChange}
      />
    );
    await user.type(screen.getByRole("textbox"), "new item");
    await user.click(screen.getByRole("button", { name: /add/i }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it("forwards readOnly to the InputList (list item inputs are read-only)", () => {
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "list" }}
        disabled={false}
        value={["item 1"]}
        readOnly
      />
    );
    expect(
      (screen.getByDisplayValue("item 1") as HTMLInputElement).readOnly
    ).toBe(true);
  });

  // A `menu` setting also goes through InputList, but its add-control is built by
  // InputList.renderMenu(), which does not restate onChange/readOnly — it relies
  // on them arriving through createEditableInput. That is a different path from
  // the `list` add-control above, so it needs its own coverage.
  it("forwards onChange to the InputList menu control", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "menu", menuOptions } as any}
        disabled={false}
        value={[]}
        onChange={onChange}
      />
    );

    await user.selectOptions(screen.getByRole("combobox"), "B");

    expect(onChange).toHaveBeenCalled();
  });

  it("forwards readOnly to the InputList menu control", () => {
    const onChange = jest.fn();
    render(
      <ProtocolFormField
        setting={{ ...baseSetting, type: "menu", menuOptions } as any}
        disabled={false}
        value={[]}
        readOnly
        onChange={onChange}
      />
    );

    // A <select> ignores the readonly attribute, so dispatch the change directly:
    // the component's own readOnly guard is what must stop onChange from firing.
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "B" } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards disableButton to the InputList (the Add button is disabled)", () => {
    // Use a menu: for the other types InputList also disables Add whenever its
    // text input is empty, which would mask whether disableButton was forwarded.
    const renderMenu = (extra: Record<string, unknown> = {}) =>
      render(
        <ProtocolFormField
          setting={{ ...baseSetting, type: "menu", menuOptions } as any}
          disabled={false}
          value={[]}
          {...extra}
        />
      );

    const { unmount } = renderMenu();
    expect(screen.getByRole("button", { name: /add/i })).not.toBeDisabled();
    unmount();

    renderMenu({ disableButton: true });
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });
});

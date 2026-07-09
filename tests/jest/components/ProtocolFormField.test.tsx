import * as React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
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

// Behaviors migrated from the legacy enzyme suite
// (`src/components/__tests__/ProtocolFormField-test.tsx`). These render each
// setting `type` and assert the rendered control via the DOM, reading uncontrolled
// values through the component's real ref-based `getValue()` / `clear()` API
// (the same API production calls), mirroring the existing json-type tests above.
describe("ProtocolFormField — legacy setting types", () => {
  const baseSetting = {
    key: "setting",
    label: "label",
    description: "<p>description</p>",
  };

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
    const menuOptions = ["A", "B", "C"].map((x) => (
      <option key={x} aria-selected={false}>
        {x}
      </option>
    ));
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
  });

  it("renders a hidden setting inside an invisible wrapper and reads its value via ref", () => {
    const ref = React.createRef<ProtocolFormField>();
    const { container } = render(
      <ProtocolFormField
        setting={{ ...baseSetting, hidden: true }}
        disabled={false}
        value="test"
        ref={ref}
      />
    );
    // The hidden element is wrapped in a visually-hidden div.
    const wrapper = container.querySelector('div[style*="hidden"]');
    expect(wrapper).not.toBeNull();
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
});

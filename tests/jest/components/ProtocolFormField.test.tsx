import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProtocolFormField from "../../../src/components/ProtocolFormField";

// NB: This file adds / duplicates existing tests from:
// - `src/components/__tests__/ProtocolFormField-test.tsx`.
//
// Those tests should eventually be migrated here and
// adapted to the Jest/React Testing Library paradigm.

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

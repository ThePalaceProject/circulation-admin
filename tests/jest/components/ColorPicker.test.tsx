import * as React from "react";
import { render } from "@testing-library/react";
import ColorPicker from "../../../src/components/shared/ColorPicker";

// Mock react-color's CompactPicker with a simple test-friendly button
jest.mock("react-color", () => ({
  CompactPicker: ({
    color,
    onChangeComplete,
  }: {
    color: string;
    onChangeComplete: (color: { hex: string }, e: null) => void;
  }) => (
    <button
      data-testid="compact-picker"
      data-color={color}
      onClick={() => onChangeComplete({ hex: "#abcdef" }, null)}
    >
      Pick Color
    </button>
  ),
}));

const setting = { key: "key", label: "label" };

describe("ColorPicker", () => {
  it("shows the compact picker with the initial color", () => {
    const { getByTestId } = render(
      <ColorPicker setting={setting} value="#123456" />
    );
    const picker = getByTestId("compact-picker");
    expect(picker).toBeInTheDocument();
    expect(picker).toHaveAttribute("data-color", "#123456");
  });

  it("has a hidden input with the initial value", () => {
    const { container } = render(
      <ColorPicker setting={setting} value="#123456" />
    );
    const input = container.querySelector<HTMLInputElement>(
      "input[type='hidden']"
    );
    expect(input).toBeInTheDocument();
    expect(input!.name).toBe("key");
    expect(input!.value).toBe("#123456");
  });

  it("updates the hidden input value when a color is selected", () => {
    const { container, getByTestId } = render(
      <ColorPicker setting={setting} value="#123456" />
    );
    const input = container.querySelector<HTMLInputElement>(
      "input[type='hidden']"
    );
    expect(input!.value).toBe("#123456");

    // Clicking the mock picker triggers onChangeComplete with #abcdef
    getByTestId("compact-picker").click();

    expect(input!.value).toBe("#abcdef");
  });
});

import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ColorPicker from "../../../src/components/ColorPicker";

describe("ColorPicker", () => {
  const setting = {
    key: "key",
    label: "label",
  };

  it("should show the compact picker", () => {
    const { container } = render(
      <ColorPicker setting={setting} value="#123456" />
    );

    // The react-color CompactPicker renders a `.compact-picker` container whose
    // hex field reflects the color it was given.
    expect(container.querySelector(".compact-picker")).toBeInTheDocument();
    expect(screen.getByLabelText("hex")).toHaveValue("#123456");
  });

  it("should have a hidden input with the value", () => {
    const { container } = render(
      <ColorPicker setting={setting} value="#123456" />
    );

    const input = container.querySelector<HTMLInputElement>(
      'input[type="hidden"]'
    );
    expect(input).toHaveAttribute("name", "key");
    expect(input).toHaveValue("#123456");
  });

  it("should change the value", async () => {
    const user = userEvent.setup();
    // getValue() is the imperative API ProtocolFormField calls via a ref in
    // production, so exercise it through a real ref here.
    const ref = React.createRef<ColorPicker>();
    const { container } = render(
      <ColorPicker ref={ref} setting={setting} value="#123456" />
    );
    const hiddenInput = container.querySelector<HTMLInputElement>(
      'input[type="hidden"]'
    );

    expect(ref.current.getValue()).toBe("#123456");
    expect(hiddenInput).toHaveValue("#123456");

    // Clicking a palette swatch fires the picker's onChangeComplete, which
    // updates the component's value (react-color debounces that callback).
    await user.click(screen.getByTitle("#FE9200"));

    await waitFor(() => expect(ref.current.getValue()).toBe("#fe9200"));
    expect(hiddenInput).toHaveValue("#fe9200");
  });
});

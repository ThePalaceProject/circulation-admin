import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProtocolFormField from "../../../src/components/ProtocolFormField";

// NB: This file adds / duplicates existing tests from:
// - `src/components/__tests__/ProtocolFormField-test.tsx`.
//
// Those tests should eventually be migrated here and
// adapted to the Jest/React Testing Library paradigm.

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
    screen.debug();
  });
});

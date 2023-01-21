import * as React from "react";
import { render, screen } from "@testing-library/react";
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

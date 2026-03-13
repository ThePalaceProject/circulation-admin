import * as React from "react";
import { render, screen } from "@testing-library/react";
import EditorField from "../../../src/components/shared/EditorField";

describe("EditorField", () => {
  it("renders Bold, Italic, and Underline buttons", () => {
    render(<EditorField content="This is a summary." disabled={false} />);
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /underline/i })
    ).toBeInTheDocument();
  });

  it("renders buttons with styled text (b, i, u tags)", () => {
    const { container } = render(
      <EditorField content="This is a summary." disabled={false} />
    );
    expect(container.querySelector("b")).toBeInTheDocument();
    expect(container.querySelector("i")).toBeInTheDocument();
    expect(container.querySelector("u")).toBeInTheDocument();
  });

  it("disables all buttons when disabled=true", () => {
    render(<EditorField content="This is a summary." disabled={true} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});

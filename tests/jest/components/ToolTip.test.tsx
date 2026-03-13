import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import ToolTip from "../../../src/components/shared/ToolTip";

describe("ToolTip", () => {
  const trigger = <h1>Hover</h1>;

  it("renders the trigger element", () => {
    const { getByRole } = render(
      <ToolTip trigger={trigger} text="ToolTip Content" />
    );
    expect(getByRole("heading", { name: "Hover" })).toBeInTheDocument();
  });

  it("renders the tooltip with the provided text", () => {
    const { container } = render(
      <ToolTip trigger={trigger} text="ToolTip Content" />
    );
    const tooltip = container.querySelector(".tool-tip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip!.innerHTML).toContain("ToolTip Content");
  });

  it("initially hides the tooltip with the 'hide' class", () => {
    const { container } = render(
      <ToolTip trigger={trigger} text="ToolTip Content" />
    );
    expect(container.querySelector(".tool-tip")).toHaveClass("hide");
  });

  it("shows the tooltip on mouseEnter", () => {
    const { container } = render(
      <ToolTip trigger={trigger} text="ToolTip Content" />
    );
    const tooltipContainer = container.querySelector(".tool-tip-container")!;
    fireEvent.mouseEnter(tooltipContainer);
    expect(container.querySelector(".tool-tip")).not.toHaveClass("hide");
  });

  it("hides the tooltip on mouseLeave", () => {
    const { container } = render(
      <ToolTip trigger={trigger} text="ToolTip Content" />
    );
    const tooltipContainer = container.querySelector(".tool-tip-container")!;
    fireEvent.mouseEnter(tooltipContainer);
    expect(container.querySelector(".tool-tip")).not.toHaveClass("hide");

    fireEvent.mouseLeave(tooltipContainer);
    expect(container.querySelector(".tool-tip")).toHaveClass("hide");
  });
});

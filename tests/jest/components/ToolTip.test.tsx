import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToolTip from "../../../src/components/ToolTip";

describe("ToolTip", () => {
  const renderToolTip = () =>
    render(<ToolTip trigger={<h1>Hover</h1>} text="ToolTip Content" />);

  it("renders the trigger element", () => {
    renderToolTip();
    expect(screen.getByRole("heading", { name: "Hover" })).toBeInTheDocument();
  });

  it("renders the tooltip", () => {
    const { container } = renderToolTip();
    const tooltip = container.querySelector<HTMLElement>(".tool-tip")!;
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("ToolTip Content");
    expect(tooltip.innerHTML).toContain("ToolTip Content");
  });

  it("initially hides the tooltip", () => {
    const { container } = renderToolTip();
    expect(container.querySelector(".tool-tip")).toHaveClass("hide");
  });

  it("shows the tooltip on mouseEnter", async () => {
    const user = userEvent.setup();
    const { container } = renderToolTip();
    await user.hover(screen.getByRole("tooltip"));
    expect(container.querySelector(".tool-tip")).not.toHaveClass("hide");
  });

  it("hides the tooltip on mouseLeave", async () => {
    const user = userEvent.setup();
    const { container } = renderToolTip();
    const toolTipContainer = screen.getByRole("tooltip");

    await user.hover(toolTipContainer);
    expect(container.querySelector(".tool-tip")).not.toHaveClass("hide");

    await user.unhover(toolTipContainer);
    expect(container.querySelector(".tool-tip")).toHaveClass("hide");
  });
});

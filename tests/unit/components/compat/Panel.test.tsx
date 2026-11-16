import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Panel } from "../../../../src/components/compat";

const bodyOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("section.panel-body");

describe("compat Panel", () => {
  it("starts closed, with a header button that controls the body", () => {
    const { container } = render(
      <Panel id="info" headerText="Information" content={<p>Details</p>} />
    );
    // An exact name, so the hidden icon must stay out of it.
    const header = screen.getByRole("button", { name: "Information" });
    const body = bodyOf(container);

    expect(container.firstChild).not.toHaveClass("static-panel");
    expect(header).toHaveAttribute("type", "button");
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(header).toHaveAttribute("aria-controls", "info-panel");
    expect(body).toHaveAttribute("id", "info-panel");
    expect(body).toHaveClass("collapse");
    expect(body).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("svg.icon.down-icon")).toBeInTheDocument();
  });

  it("opens and closes when the header is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Panel id="info" headerText="Information" content={<p>Details</p>} />
    );
    const header = screen.getByRole("button", { name: "Information" });

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(bodyOf(container)).not.toHaveClass("collapse");
    expect(bodyOf(container)).toHaveAttribute("aria-hidden", "false");
    expect(container.querySelector("svg.icon.up-icon")).toBeInTheDocument();

    await user.click(header);
    expect(header).toHaveAttribute("aria-expanded", "false");
    expect(bodyOf(container)).toHaveClass("collapse");
  });

  it("starts open with `openByDefault`", () => {
    const { container } = render(
      <Panel
        id="info"
        headerText="Information"
        content={<p>Details</p>}
        openByDefault={true}
      />
    );
    expect(screen.getByRole("button", { name: "Information" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(bodyOf(container)).not.toHaveClass("collapse");
  });

  it("is always open, with a plain header, when it is not collapsible", () => {
    const { container } = render(
      <Panel
        id="info"
        headerText="Information"
        content={<p>Details</p>}
        collapsible={false}
      />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("div.panel-heading")).toHaveTextContent(
      "Information"
    );
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass("static-panel");
    expect(bodyOf(container)).not.toHaveAttribute("aria-hidden");
    expect(bodyOf(container)).not.toHaveClass("collapse");
  });

  it.each([
    { style: undefined, className: "panel-default" },
    { style: "instruction", className: "panel-instruction" },
  ])("gets the class $className for style $style", ({ style, className }) => {
    const { container } = render(
      <Panel id="info" headerText="Information" content="" style={style} />
    );
    expect(container.firstChild).toHaveClass("panel", className);
  });

  it("renders string content as HTML", () => {
    const { container } = render(
      <Panel
        id="info"
        headerText="Information"
        content="<strong>Bold</strong> text"
      />
    );
    expect(bodyOf(container).querySelector("strong")).toHaveTextContent("Bold");
  });

  it("calls `onEnter` when a form inside the body is submitted", () => {
    const onEnter = vi.fn();
    render(
      <Panel
        id="info"
        headerText="Information"
        openByDefault={true}
        onEnter={onEnter}
        content={
          <form aria-label="Inner">
            <input name="q" />
          </form>
        }
      />
    );

    fireEvent.submit(screen.getByRole("form", { name: "Inner" }));

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("does not call `onEnter` when Enter submits a form around the panel", async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();
    const onOuterSubmit = vi.fn((event: React.FormEvent) =>
      event.preventDefault()
    );
    render(
      <form onSubmit={onOuterSubmit}>
        <Panel
          id="info"
          headerText="Information"
          openByDefault={true}
          onEnter={onEnter}
          content={<input aria-label="Query" name="q" />}
        />
      </form>
    );

    await user.type(screen.getByRole("textbox", { name: "Query" }), "{Enter}");

    expect(onOuterSubmit).toHaveBeenCalledTimes(1);
    expect(onEnter).not.toHaveBeenCalled();
  });
});

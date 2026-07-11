import * as React from "react";
import { render, screen } from "@testing-library/react";

import SingleStatListItem, {
  SingleStatListItemProps,
} from "../../../src/components/SingleStatListItem";

describe("SingleStatListItem", () => {
  const statWithTooltip: SingleStatListItemProps = {
    label: "Number of Widgets",
    value: 357892,
    tooltip: "Total Widget Count",
  };
  const humanReadableValue = "357.9k";
  const formattedValue = "357,892";

  it("renders a top-level <li>, with or without a tooltip", () => {
    const { container, rerender } = render(
      <SingleStatListItem {...statWithTooltip} />
    );
    expect(container.firstElementChild?.tagName).toBe("LI");
    expect(container.firstElementChild).toHaveClass("single-stat");

    // Without a tooltip the <li> is still the top-level element.
    rerender(
      <SingleStatListItem
        label={statWithTooltip.label}
        value={statWithTooltip.value}
      />
    );
    expect(container.firstElementChild?.tagName).toBe("LI");
    expect(container.firstElementChild).toHaveClass("single-stat");
  });

  it("shows a tooltip wrapping the value and label when one is provided", () => {
    const { container } = render(<SingleStatListItem {...statWithTooltip} />);

    const tooltip = container.querySelector('[data-toggle="tooltip"]');
    expect(tooltip).not.toBeNull();

    const title = tooltip?.getAttribute("title") ?? "";
    expect(title).toContain(statWithTooltip.tooltip);
    expect(title).toContain(formattedValue);

    // When there's a tooltip, it wraps the (rounded) value and the label.
    expect(tooltip).toHaveTextContent(humanReadableValue);
    expect(tooltip).toHaveTextContent(statWithTooltip.label);
  });

  it("omits the tooltip when none is provided, showing value and label directly", () => {
    const { container } = render(
      <SingleStatListItem
        label={statWithTooltip.label}
        value={statWithTooltip.value}
      />
    );

    expect(container.querySelector('[data-toggle="tooltip"]')).toBeNull();
    expect(screen.getByText(humanReadableValue)).toBeInTheDocument();
    expect(screen.getByText(statWithTooltip.label)).toBeInTheDocument();
  });
});

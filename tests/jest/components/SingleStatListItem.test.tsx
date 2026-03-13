import * as React from "react";
import { render } from "@testing-library/react";
import SingleStatListItem from "../../../src/components/dashboard/SingleStatListItem";

describe("SingleStatListItem", () => {
  const props = {
    label: "Number of Widgets",
    value: 357892,
    tooltip: "Total Widget Count",
  };

  it("renders a list item", () => {
    const { container } = render(<SingleStatListItem {...props} />);
    expect(container.querySelector("li")).toBeInTheDocument();
  });

  it("renders the rounded value", () => {
    const { container } = render(<SingleStatListItem {...props} />);
    expect(container.querySelector(".stat-value")!.textContent).toBe("357.9k");
  });

  it("renders the label", () => {
    const { getByText } = render(<SingleStatListItem {...props} />);
    expect(getByText("Number of Widgets")).toBeInTheDocument();
  });

  it("shows a tooltip span when tooltip is provided", () => {
    const { container } = render(<SingleStatListItem {...props} />);
    const tooltipEl = container.querySelector("[data-toggle='tooltip']");
    expect(tooltipEl).toBeInTheDocument();
    expect(tooltipEl!.getAttribute("title")).toContain("Total Widget Count");
    expect(tooltipEl!.getAttribute("title")).toContain("357,892");
  });

  it("omits the tooltip element when tooltip is not specified", () => {
    const { container } = render(
      <SingleStatListItem label={props.label} value={props.value} />
    );
    expect(container.querySelector("[data-toggle='tooltip']")).toBeNull();
  });
});

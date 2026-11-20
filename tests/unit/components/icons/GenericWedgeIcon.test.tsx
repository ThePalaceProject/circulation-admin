import * as React from "react";
import { render } from "@testing-library/react";

import GenericWedgeIcon from "../../../../src/components/icons/GenericWedgeIcon";

describe("GenericWedgeIcon", () => {
  it("renders a hidden icon with the default class and title", () => {
    const { container } = render(<GenericWedgeIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("class", "GenericWedgeIcon svgIcon");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg.querySelector("title")).toHaveTextContent(
      "NYPL Wedge Down Icon"
    );
  });

  it("uses the given class and title", () => {
    const { container } = render(
      <GenericWedgeIcon className="up-icon icon" title="Open" />
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("class", "up-icon icon svgIcon");
    expect(svg.querySelector("title")).toHaveTextContent("Open");
  });
});

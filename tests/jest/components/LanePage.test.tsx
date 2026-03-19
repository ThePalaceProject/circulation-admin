import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import LanePage from "../../../src/components/lanes/LanePage";

const defaultParams = {
  library: "library",
  editOrCreate: "edit",
  identifier: "5",
};

describe("LanePage", () => {
  it("renders the lane-page container", () => {
    const { container } = renderWithProviders(
      <LanePage params={defaultParams} />
    );
    expect(container.querySelector(".lane-page")).toBeInTheDocument();
  });

  it("renders header but not footer", () => {
    const { container } = renderWithProviders(
      <LanePage params={defaultParams} />
    );
    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("footer")).not.toBeInTheDocument();
  });
});

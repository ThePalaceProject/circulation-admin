import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import ConfigPage from "../../../src/components/config/ConfigPage";

const defaultParams = {
  tab: "libraries",
  editOrCreate: "edit",
  identifier: "identifier",
};

describe("ConfigPage", () => {
  it("renders the config page container", () => {
    const { container } = renderWithProviders(
      <ConfigPage params={defaultParams} />
    );
    expect(container.querySelector(".config")).toBeInTheDocument();
  });

  it("renders header but not footer", () => {
    const { container } = renderWithProviders(
      <ConfigPage params={defaultParams} />
    );
    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("footer")).not.toBeInTheDocument();
  });
});

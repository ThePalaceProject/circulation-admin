import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import TroubleshootingCategoryPage from "../../../src/components/diagnostics/TroubleshootingCategoryPage";

describe("TroubleshootingCategoryPage", () => {
  it("renders the diagnostics-page container for type='diagnostics'", () => {
    const { container } = renderWithProviders(
      <TroubleshootingCategoryPage type="diagnostics" />
    );
    expect(container.querySelector(".diagnostics-page")).toBeInTheDocument();
  });

  it("renders the self-tests-page container for type='self-tests'", () => {
    const { container } = renderWithProviders(
      <TroubleshootingCategoryPage type="self-tests" />
    );
    expect(container.querySelector(".self-tests-page")).toBeInTheDocument();
  });
});

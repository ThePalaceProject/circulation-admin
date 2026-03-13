import * as React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/withProviders";
import TroubleshootingPage from "../../../src/components/diagnostics/TroubleshootingPage";

describe("TroubleshootingPage", () => {
  const defaultProps = {
    params: { tab: "", subtab: "" },
  };

  it("renders a heading", () => {
    renderWithProviders(<TroubleshootingPage {...defaultProps} />);
    expect(
      screen.getByRole("heading", { name: "Troubleshooting" })
    ).toBeInTheDocument();
  });

  it("renders the troubleshooting tab container", () => {
    const { container } = renderWithProviders(
      <TroubleshootingPage {...defaultProps} />
    );
    expect(
      container.querySelector(".troubleshooting-page")
    ).toBeInTheDocument();
  });

  it("sets the document title", () => {
    renderWithProviders(<TroubleshootingPage {...defaultProps} />);
    expect(document.title).toContain("Troubleshooting");
  });
});

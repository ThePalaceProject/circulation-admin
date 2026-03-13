import * as React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/withProviders";
import SetupPage from "../../../src/components/layout/SetupPage";

describe("SetupPage", () => {
  it("renders the individual admins setup container", () => {
    const { container } = renderWithProviders(<SetupPage />);
    // SetupPage renders IndividualAdmins which has class="set-up" in setup mode
    expect(container.querySelector(".set-up")).toBeInTheDocument();
  });

  it("renders a welcome heading from IndividualAdmins", () => {
    renderWithProviders(<SetupPage />);
    expect(
      screen.getByRole("heading", { name: /welcome/i })
    ).toBeInTheDocument();
  });
});

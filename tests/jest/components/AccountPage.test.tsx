import * as React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/withProviders";
import AccountPage from "../../../src/components/patrons/AccountPage";

describe("AccountPage", () => {
  it("renders the Change Password heading", () => {
    renderWithProviders(<AccountPage />);
    expect(screen.getByText("Change Password")).toBeInTheDocument();
  });

  it("renders a header landmark", () => {
    const { container } = renderWithProviders(<AccountPage />);
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("does not render a footer landmark (footer removed)", () => {
    const { container } = renderWithProviders(<AccountPage />);
    expect(container.querySelector("footer")).not.toBeInTheDocument();
  });
});

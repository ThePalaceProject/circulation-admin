import * as React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/withProviders";
import WelcomePage from "../../../src/components/layout/WelcomePage";

describe("WelcomePage", () => {
  it("shows the welcome message", () => {
    renderWithProviders(<WelcomePage />);
    expect(
      screen.getByText("Welcome to the Circulation Admin Interface!")
    ).toBeInTheDocument();
  });

  it("shows a link to the library creation form", () => {
    const { container } = renderWithProviders(<WelcomePage />);
    const link = container.querySelector(
      "a[href='/admin/web/config/libraries/create']"
    );
    expect(link).toBeInTheDocument();
  });

  it("renders a header landmark", () => {
    const { container } = renderWithProviders(<WelcomePage />);
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("renders a footer landmark", () => {
    const { container } = renderWithProviders(<WelcomePage />);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});

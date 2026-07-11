import * as React from "react";
import { render, screen } from "@testing-library/react";

// Header pulls in the react-router v3 context a plain render does not supply, and
// both Header and Footer are page chrome with no behavior worth exercising here.
// Mock them to markers so the test stays about what WelcomePage composes.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));
jest.mock("../../../src/components/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

import WelcomePage from "../../../src/components/WelcomePage";

describe("WelcomePage", () => {
  it("shows the header", () => {
    render(<WelcomePage />);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("shows the welcome message", () => {
    render(<WelcomePage />);
    expect(
      screen.getByRole("heading", {
        name: "Welcome to the Circulation Admin Interface!",
      })
    ).toBeInTheDocument();
  });

  it("shows a link to the library create form", () => {
    render(<WelcomePage />);
    const link = screen.getByRole("link", { name: /create a new library/i });
    expect(link).toHaveAttribute("href", "/admin/web/config/libraries/create");
  });

  it("shows the footer", () => {
    render(<WelcomePage />);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});

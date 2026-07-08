import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";

// Header and Footer are page chrome with no behavior worth exercising here, and
// Header pulls in the react-router v3 context that `renderWithProviders` does not
// supply. Mock them to markers so the test stays about what AccountPage composes.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));
jest.mock("../../../src/components/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

import AccountPage from "../../../src/components/AccountPage";

describe("AccountPage", () => {
  it("renders the header and footer chrome", () => {
    renderWithProviders(<AccountPage />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders the change-password form", () => {
    renderWithProviders(<AccountPage />);

    // ChangePasswordForm is connected; its heading and fields appearing proves
    // it received a working store and csrf token from context. EditableInput
    // renders its label and input as siblings with no htmlFor, so there is no
    // accessible label association to query — assert the label text instead.
    expect(
      screen.getByRole("heading", { name: "Change Password" })
    ).toBeInTheDocument();
    expect(screen.getByText("New Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm New Password")).toBeInTheDocument();
  });
});

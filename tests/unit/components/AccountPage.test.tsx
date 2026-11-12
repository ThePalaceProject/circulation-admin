import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { renderWithProviders } from "../testUtils/withProviders";
import { setupMswServer } from "../testUtils/mswServer";

// Header and Footer are page chrome with no behavior worth exercising here, and
// Header reads the legacy `router` context and fetches on mount. Mock them to
// markers so the test stays about what AccountPage composes.
vi.mock("../../../src/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));
vi.mock("../../../src/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

import AccountPage from "../../../src/components/AccountPage";

describe("AccountPage", () => {
  const { requests } = setupMswServer(
    http.post("*/admin/change_password", () => HttpResponse.text("ok"))
  );

  it("renders the header and footer chrome", () => {
    renderWithProviders(<AccountPage />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders the change-password form", () => {
    renderWithProviders(<AccountPage />);

    expect(
      screen.getByRole("heading", { name: "Change Password" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm New Password/)).toBeInTheDocument();
  });

  it("sends the CSRF token from the app config with the password change", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountPage />, {
      appConfigSettings: { csrfToken: "token" },
    });

    await user.type(screen.getByLabelText(/^New Password/), "newPassword");
    await user.type(
      screen.getByLabelText(/^Confirm New Password/),
      "newPassword"
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("Password changed successfully")
    ).toBeInTheDocument();
    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get("X-CSRF-Token")).toBe("token");
  });
});

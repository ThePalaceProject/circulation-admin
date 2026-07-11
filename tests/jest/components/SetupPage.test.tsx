import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";
import SetupPage from "../../../src/components/SetupPage";

describe("SetupPage", () => {
  beforeEach(() => {
    // SetupPage renders the connected IndividualAdmins list, which fetches the
    // admin list on mount. Stub fetch so mounting does not hit the network.
    jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ individualAdmins: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows the individual-admins setup (create) form", async () => {
    renderWithProviders(<SetupPage />);

    // SetupPage wires IndividualAdmins with settingUp + editOrCreate="create".
    // That combination renders the "Welcome!" heading and the
    // "Set up your system admin account" create-form heading; their presence in
    // the real DOM proves the child received those props (the original shallow
    // test asserted the props directly). No identifier is passed, so there is no
    // per-item "Edit ..." heading — only the create form shows.
    expect(
      await screen.findByRole("heading", { name: "Welcome!" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Set up your system admin account",
      })
    ).toBeInTheDocument();
  });
});

import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";
import SetupPage from "../../../src/components/SetupPage";

describe("SetupPage", () => {
  beforeEach(() => {
    // SetupPage renders the connected IndividualAdmins list, which fetches on
    // mount. Stub fetch so mounting does not hit the network; a Response body
    // can only be read once, so build one per call.
    jest.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ individualAdmins: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
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

    // settingUp skips the libraries request, which cannot succeed before an
    // admin exists. The positive check keeps the negative one honest.
    const urls = (globalThis.fetch as jest.Mock).mock.calls.map((call) =>
      String(call[0])
    );
    expect(urls).toEqual(
      expect.arrayContaining([
        expect.stringContaining("/admin/individual_admins"),
      ])
    );
    expect(urls).not.toEqual(
      expect.arrayContaining([expect.stringContaining("/admin/libraries")])
    );
  });
});

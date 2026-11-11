import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";
import SetupPage from "../../../src/components/SetupPage";
import { http, HttpResponse } from "msw";
import { setupMswServer } from "../testUtils/mswServer";

describe("SetupPage", () => {
  // SetupPage renders the connected IndividualAdmins list, which fetches on
  // mount. Answer that request so mounting does not hit the network.
  const { requests } = setupMswServer(
    http.get("*/admin/individual_admins", () =>
      HttpResponse.json({ individualAdmins: [] })
    )
  );

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
    const paths = requests.map((r) => new URL(r.url).pathname);
    expect(paths).toContain("/admin/individual_admins");
    expect(paths).not.toContain("/admin/libraries");
  });
});

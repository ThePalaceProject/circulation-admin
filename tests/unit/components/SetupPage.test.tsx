import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../testUtils/withProviders";
import SetupPage from "../../../src/components/SetupPage";
import { http, HttpResponse } from "msw";
import { setupMswServer } from "../testUtils/mswServer";

describe("SetupPage", () => {
  // SetupPage renders the connected IndividualAdmins list, which fetches on
  // mount. Answer that request so mounting does not hit the network.
  const { server, requests } = setupMswServer(
    http.get("*/admin/individual_admins", () =>
      HttpResponse.json({ individualAdmins: [] })
    )
  );

  afterEach(() => {
    vi.restoreAllMocks();
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
    const paths = requests.map((r) => new URL(r.url).pathname);
    expect(paths).toContain("/admin/individual_admins");
    expect(paths).not.toContain("/admin/libraries");
  });

  it("sends the system-admin create request with the CSRF token from the app config", async () => {
    // The form scrolls to the top when it saves, which jsdom cannot do.
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    // Answer with an error. After a successful save, the page reloads the
    // browser page, which jsdom cannot do. This test checks only the request.
    server.use(
      http.post("*/admin/individual_admins", () =>
        HttpResponse.text("error", { status: 500 })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<SetupPage />, {
      appConfigSettings: { csrfToken: "token", settingUp: true },
    });

    await user.type(
      await screen.findByRole("textbox", { name: /Email/i }),
      "admin@example.com"
    );
    await user.type(screen.getByLabelText(/Password/i), "password");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // Wait until the app has handled the error response.
    expect(await screen.findByText(/^Error/)).toBeInTheDocument();
    const posts = requests.filter((r) => r.method === "POST");
    expect(posts).toHaveLength(1);
    const post = posts[0];
    expect(post.headers.get("X-CSRF-Token")).toBe("token");
    // `settingUp` in the app config makes the edit form ask only for a
    // system admin.
    const body = await post.formData();
    expect(JSON.parse(body.get("roles") as string)).toEqual([
      { role: "system" },
    ]);
  });
});

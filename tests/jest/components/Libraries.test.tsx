import * as React from "react";
import { screen } from "@testing-library/react";

import Libraries from "../../../src/components/Libraries";
import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";

// The connected default export is what the app mounts, so render that rather
// than the bare component: it is the only thing that exercises Libraries'
// mapStateToProps/mapDispatchToProps.
describe("Libraries - connected wiring", () => {
  afterEach(() => jest.restoreAllMocks());

  it("wires mapStateToProps/mapDispatchToProps and renders the fetched list", async () => {
    jest.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            libraries: [
              {
                uuid: "uuid-nypl",
                short_name: "nypl",
                name: "New York Public Library",
                settings: {},
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
    );

    renderWithProviders(<Libraries csrfToken="token" />, {
      reduxProviderProps: { store: buildStore() },
      appConfigSettings: { roles: [{ role: "system" }] },
    });

    // The library and its edit control appear once the on-mount fetch resolves
    // and mapStateToProps feeds the fetched data back in as props.
    expect(
      await screen.findByText("New York Public Library")
    ).toBeInTheDocument();
    const editLink = await screen.findByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute(
      "href",
      "/admin/web/config/libraries/edit/uuid-nypl"
    );
  });
});

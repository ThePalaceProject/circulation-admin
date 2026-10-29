import * as React from "react";
import { screen } from "@testing-library/react";

import Libraries from "../../../src/components/Libraries";
import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
import { http, HttpResponse } from "msw";
import { setupMswServer } from "../testUtils/mswServer";

// The connected default export is what the app mounts, so render that rather
// than the bare component: it is the only thing that exercises Libraries'
// mapStateToProps/mapDispatchToProps.
describe("Libraries - connected wiring", () => {
  // The panel also fetches the language list on mount.
  const { server } = setupMswServer(
    http.get("*/admin/languages", () => HttpResponse.json({}))
  );

  it("wires mapStateToProps/mapDispatchToProps and renders the fetched list", async () => {
    server.use(
      http.get("*/admin/libraries", () =>
        HttpResponse.json({
          libraries: [
            {
              uuid: "uuid-nypl",
              short_name: "nypl",
              name: "New York Public Library",
              settings: {},
            },
          ],
        })
      )
    );

    renderWithProviders(<Libraries csrfToken="token" />, {
      reduxProviderProps: { store: buildStore() },
      appConfigSettings: { roles: [{ role: "system" }] },
    });

    // The library and its edit control appear once the on-mount fetch resolves
    // and mapStateToProps feeds the fetched data back in as props.
    expect(
      await screen.findByText("New York Public Library - nypl")
    ).toBeInTheDocument();
    const editLink = await screen.findByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute(
      "href",
      "/admin/web/config/libraries/edit/uuid-nypl"
    );
  });

  it("falls back to the uuid as the label for a library with no name and no short name", async () => {
    server.use(
      http.get("*/admin/libraries", () =>
        HttpResponse.json({
          libraries: [{ uuid: "uuid-anon", settings: {} }],
        })
      )
    );

    renderWithProviders(<Libraries csrfToken="token" />, {
      reduxProviderProps: { store: buildStore() },
      appConfigSettings: { roles: [{ role: "system" }] },
    });

    expect(await screen.findByText("uuid-anon")).toBeInTheDocument();
  });
});

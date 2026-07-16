import * as React from "react";
import { screen, waitFor } from "@testing-library/react";

import Libraries from "../../../src/components/Libraries";
import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";

// Libraries has no other test; the connected default export is what the app
// mounts, and its mapStateToProps/mapDispatchToProps were previously covered only
// by the ConfigTabContainer full-mount (now migrated to mock its panels). This
// renders the connected export so that wiring stays covered.
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

    const { container } = renderWithProviders(<Libraries csrfToken="token" />, {
      reduxProviderProps: { store: buildStore() },
      appConfigSettings: { roles: [{ role: "system" }] },
    });

    // The library and its edit control appear once the on-mount fetch resolves
    // and mapStateToProps feeds the fetched data back in as props.
    expect(
      await screen.findByText("New York Public Library")
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(container.querySelector(".edit-item")).toBeInTheDocument()
    );
  });
});

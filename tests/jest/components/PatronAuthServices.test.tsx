import * as React from "react";
import { screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
// Render the CONNECTED default export so that mapStateToProps / mapDispatchToProps
// are exercised: the panel fetches its data on mount, the fetch populates the
// Redux store, and mapStateToProps feeds it back in as props.
import PatronAuthServices from "../../../src/components/PatronAuthServices";

const listData = {
  patron_auth_services: [
    {
      id: 2,
      protocol: "test protocol",
      settings: { test_setting: "test setting" },
      libraries: [
        { short_name: "nypl", test_library_setting: "test library setting" },
      ],
      name: "nypl protocol",
    },
  ],
  protocols: [
    { name: "test protocol", label: "test protocol label", settings: [] },
  ],
  allLibraries: [{ short_name: "nypl" }],
};

/**
 * Stub `fetch` so the panel's on-mount fetch resolves with `body`. Returning a
 * fresh Response per call avoids "body already used" when several fetches run.
 */
const stubFetch = (body: unknown) =>
  jest.spyOn(globalThis, "fetch").mockImplementation(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
  );

// A fresh store per test keeps the fetched data isolated between tests.
const renderConnected = (element: React.ReactElement) =>
  renderWithProviders(element, {
    reduxProviderProps: { store: buildStore() },
  });

describe("PatronAuthServices", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows the patron auth service list", async () => {
    stubFetch(listData);
    const { container } = renderConnected(
      <PatronAuthServices csrfToken="token" />
    );

    // The list appears once the connected component's on-mount fetch resolves.
    // Its heading is the protocol-aware label built by PatronAuthServices.label().
    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: /nypl protocol: test protocol label/,
      })
    ).toBeInTheDocument();

    const editLink = container.querySelector("a.edit-item");
    expect(editLink).not.toBeNull();
    expect(editLink.getAttribute("href")).toBe(
      "/admin/web/config/patronAuth/edit/2"
    );

    // No neighborhood analytics panel is shown in list mode.
    expect(
      screen.queryByText("Patron Neighborhood Analytics: Disabled")
    ).not.toBeInTheDocument();
  });

  it("shows the neighborhood analytics panel when creating a service whose protocol has a neighborhood_mode setting", async () => {
    const neighborhoodSetting = {
      key: "neighborhood_mode",
      label: "Neighborhood Mode",
      description: "",
      options: [],
    };
    const createData = {
      patron_auth_services: [],
      protocols: [
        {
          name: "test protocol",
          label: "test protocol label",
          settings: [neighborhoodSetting],
        },
      ],
      allLibraries: [{ short_name: "nypl" }],
    };
    stubFetch(createData);

    const { container } = renderConnected(
      <PatronAuthServices csrfToken="token" editOrCreate="create" />
    );

    // Once the protocol data loads, the create form's extra section (the
    // NeighborhoodAnalyticsForm) renders because the selected protocol carries a
    // "neighborhood_mode" setting.
    await waitFor(() =>
      expect(container.querySelector("#neighborhood-panel")).toBeInTheDocument()
    );
    expect(
      screen.getByText("Patron Neighborhood Analytics: Disabled")
    ).toBeInTheDocument();
  });
});

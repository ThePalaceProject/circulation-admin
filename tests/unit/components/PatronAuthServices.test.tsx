import * as React from "react";
import { screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
import { http, HttpResponse } from "msw";
import { setupMswServer } from "../testUtils/mswServer";
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

// Every request the panel makes on mount, answered for the whole file. The
// services body is per test (see `stubServices`).
const { server, requests } = setupMswServer(
  http.get("*/admin/libraries", () =>
    HttpResponse.json({ libraries: [{ short_name: "nypl" }] })
  )
);

/** Answer the panel's on-mount services request with `body`. */
const stubServices = (body: Record<string, unknown>) =>
  server.use(
    http.get("*/admin/patron_auth_services", () => HttpResponse.json(body))
  );

// A fresh store per test keeps the fetched data isolated between tests.
const renderConnected = (element: React.ReactElement) =>
  renderWithProviders(element, {
    reduxProviderProps: { store: buildStore() },
  });

describe("PatronAuthServices", () => {
  it("shows the patron auth service list", async () => {
    stubServices(listData);
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

  it("fetches the libraries list along with the services on mount", async () => {
    stubServices(listData);
    renderConnected(<PatronAuthServices csrfToken="token" />);

    await waitFor(() => {
      const paths = requests.map((r) => new URL(r.url).pathname);
      expect(paths).toEqual(
        expect.arrayContaining([
          "/admin/patron_auth_services",
          "/admin/libraries",
        ])
      );
    });
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
    stubServices(createData);

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

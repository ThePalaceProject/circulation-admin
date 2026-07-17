import * as React from "react";
import { screen, within } from "@testing-library/react";
import CatalogServicesConnected, {
  CatalogServices,
} from "../../../src/components/CatalogServices";
import renderWithContext from "../testUtils/renderWithContext";
import { renderWithProviders } from "../testUtils/withProviders";
import buildStore from "../../../src/store";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

describe("CatalogServices", () => {
  const data = {
    catalog_services: [
      {
        id: 2,
        protocol: "test protocol",
        settings: {
          test_setting: "test setting",
        },
        libraries: [
          {
            short_name: "nypl",
            test_library_setting: "test library setting",
          },
        ],
        name: "nypl catalog",
      },
    ],
    protocols: [
      {
        name: "test protocol",
        label: "test protocol label",
        settings: [],
      },
    ],
    allLibraries: [
      {
        short_name: "nypl",
      },
    ],
  };

  const config = { csrfToken: "token", featureFlags: defaultFeatureFlags };

  it("shows catalog service list", () => {
    renderWithContext(
      <CatalogServices
        data={data}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />,
      config
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("nypl catalog: test protocol label");

    const editLink = within(items[0]).getByRole("link");
    expect(editLink).toHaveAttribute(
      "href",
      "/admin/web/config/catalogServices/edit/2"
    );
  });
});

describe("CatalogServices - connected wiring", () => {
  afterEach(() => jest.restoreAllMocks());

  it("wires mapStateToProps/mapDispatchToProps and renders the fetched list", async () => {
    jest.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            catalog_services: [
              { id: 2, protocol: "test protocol", name: "Test Catalog" },
            ],
            protocols: [{ name: "test protocol", label: "TP", settings: [] }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
    );
    const store = buildStore();

    renderWithProviders(<CatalogServicesConnected csrfToken="token" />, {
      reduxProviderProps: { store },
      appConfigSettings: { roles: [{ role: "system" }] },
    });

    // The edit link only appears once the on-mount fetch resolves and
    // mapStateToProps feeds the fetched service back in as props.
    const editLink = await screen.findByRole("link", { name: /edit/i });
    expect(editLink).toHaveAttribute(
      "href",
      "/admin/web/config/catalogServices/edit/2"
    );
  });
});

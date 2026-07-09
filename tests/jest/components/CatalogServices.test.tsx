import * as React from "react";
import { screen, within } from "@testing-library/react";
import { CatalogServices } from "../../../src/components/CatalogServices";
import renderWithContext from "../testUtils/renderWithContext";
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

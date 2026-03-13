import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import { CatalogServices } from "../../../src/components/config/CatalogServices";

const data = {
  catalog_services: [
    {
      id: 2,
      protocol: "test protocol",
      settings: { test_setting: "test setting" },
      libraries: [
        { short_name: "nypl", test_library_setting: "test library setting" },
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
  allLibraries: [{ short_name: "nypl" }],
};

describe("CatalogServices", () => {
  it("shows catalog service list with name and protocol label", () => {
    const { container } = renderWithProviders(
      <CatalogServices
        data={data}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />
    );
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].textContent).toContain("nypl catalog: test protocol label");
  });

  it("shows an edit link for the service", () => {
    const { container } = renderWithProviders(
      <CatalogServices
        data={data}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />
    );
    const editLink = container.querySelector(
      "a[href='/admin/web/config/catalogServices/edit/2']"
    );
    expect(editLink).toBeInTheDocument();
  });
});

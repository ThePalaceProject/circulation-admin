import * as React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../testUtils/withProviders";
import { MetadataServices } from "../../../src/components/config/MetadataServices";

const data = {
  metadata_services: [
    {
      id: 2,
      protocol: "test protocol",
      name: "sample name",
      settings: { test_setting: "test setting" },
      libraries: [{ short_name: "nypl" }],
    },
  ],
  protocols: [
    {
      name: "test protocol",
      label: "test protocol label",
      sitewide: false,
      settings: [],
    },
  ],
  allLibraries: [{ short_name: "nypl" }],
};

describe("MetadataServices", () => {
  it("shows metadata service list with name and protocol", () => {
    const { container } = renderWithProviders(
      <MetadataServices
        data={data}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />
    );
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].textContent).toContain("sample name: test protocol");
  });

  it("shows an edit link for the service", () => {
    const { container } = renderWithProviders(
      <MetadataServices
        data={data}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />
    );
    const editLink = container.querySelector(
      "a[href='/admin/web/config/metadata/edit/2']"
    );
    expect(editLink).toBeInTheDocument();
  });
});

import * as React from "react";
import { screen, within } from "@testing-library/react";
import { MetadataServices } from "../../../src/components/MetadataServices";
import renderWithContext from "../testUtils/renderWithContext";
import { defaultFeatureFlags } from "../../../src/utils/featureFlags";

describe("MetadataServices", () => {
  const data = {
    metadata_services: [
      {
        id: 2,
        protocol: "test protocol",
        name: "sample name",
        settings: {
          test_setting: "test setting",
        },
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
    allLibraries: [
      {
        short_name: "nypl",
      },
    ],
  };

  const config = { csrfToken: "token", featureFlags: defaultFeatureFlags };

  it("shows metadata service list", () => {
    renderWithContext(
      <MetadataServices
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
    expect(items[0]).toHaveTextContent("sample name: test protocol");

    const editLink = within(items[0]).getByRole("link");
    expect(editLink).toHaveAttribute(
      "href",
      "/admin/web/config/metadata/edit/2"
    );
  });
});

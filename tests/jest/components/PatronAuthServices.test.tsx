import * as React from "react";
import { renderWithProviders } from "../testUtils/withProviders";
import { PatronAuthServices } from "../../../src/components/config/PatronAuthServices";

const data = {
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
    {
      name: "test protocol",
      label: "test protocol label",
      settings: [],
    },
  ],
  allLibraries: [{ short_name: "nypl" }],
};

describe("PatronAuthServices", () => {
  it("shows patron auth service list with name and protocol label", () => {
    const { container } = renderWithProviders(
      <PatronAuthServices
        data={data}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />
    );
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].textContent).toContain(
      "nypl protocol: test protocol label"
    );
  });

  it("shows an edit link for the patron auth service", () => {
    const { container } = renderWithProviders(
      <PatronAuthServices
        data={data}
        fetchData={jest.fn()}
        editItem={jest.fn().mockResolvedValue(undefined)}
        csrfToken="token"
        isFetching={false}
      />
    );
    const editLink = container.querySelector(
      "a[href='/admin/web/config/patronAuth/edit/2']"
    );
    expect(editLink).toBeInTheDocument();
  });
});

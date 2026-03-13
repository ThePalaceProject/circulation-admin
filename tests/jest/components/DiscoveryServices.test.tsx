import * as React from "react";
import { DiscoveryServices } from "../../../src/components/config/DiscoveryServices";
import { renderWithProviders } from "../testUtils/withProviders";

describe("DiscoveryServices", () => {
  const registerLibrary = jest.fn(() => Promise.resolve<void>(undefined));
  const fetchLibraryRegistrations = jest.fn();

  const baseProps = {
    csrfToken: "token",
    editOrCreate: "edit" as const,
    data: {
      discovery_services: [{ id: "2", protocol: "test protocol" }],
      protocols: [],
    },
    identifier: "2",
    registerLibrary,
    fetchLibraryRegistrations,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches library registrations on mount", () => {
    renderWithProviders(<DiscoveryServices {...baseProps} />);
    expect(fetchLibraryRegistrations).toHaveBeenCalledTimes(1);
  });

  it("renders a heading for the discovery services section", () => {
    const { container } = renderWithProviders(
      <DiscoveryServices {...baseProps} />
    );
    // EditableConfigList renders an h2 heading
    const heading = container.querySelector("h2");
    expect(heading).toBeInTheDocument();
  });
});

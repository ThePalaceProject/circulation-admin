import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";

// Header and Footer are page chrome; Header reads the legacy `router` context
// and fetches on mount. Mock them to markers.
// The Header marker shows the library that the page gives through the page
// context.
vi.mock("../../../src/components/Header", async () => {
  const { usePageLibrary } = await vi.importActual<
    typeof import("../../../src/context/pageContext")
  >("../../../src/context/pageContext");
  const HeaderMock = () => (
    <div data-testid="header" data-library={usePageLibrary()} />
  );
  return { default: HeaderMock };
});
vi.mock("../../../src/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

// CustomLists is a connected component that fetches lists, collections, libraries,
// and languages over the network on mount. That is incidental to what
// CustomListPage composes — the page's job is to hand the editor the params and
// context it needs — so mock it to a marker that echoes the props it received.
vi.mock("../../../src/components/CustomLists", () => ({
  default: (props: any) => (
    <div
      data-testid="custom-lists"
      data-library={props.library}
      data-edit-or-create={props.editOrCreate}
      data-identifier={props.identifier}
      data-csrf-token={props.csrfToken}
    />
  ),
}));

import CustomListPage from "../../../src/components/CustomListPage";

describe("CustomListPage", () => {
  const params = {
    library: "library",
    editOrCreate: "edit",
    identifier: "identifier",
  };

  it("shows custom lists with info from params", () => {
    renderWithProviders(<CustomListPage params={params} />, {
      appConfigSettings: { csrfToken: "token" },
    });

    expect(screen.getByTestId("header")).toHaveAttribute(
      "data-library",
      "library"
    );
    const customLists = screen.getByTestId("custom-lists");
    expect(customLists).toHaveAttribute("data-library", "library");
    expect(customLists).toHaveAttribute("data-edit-or-create", "edit");
    expect(customLists).toHaveAttribute("data-identifier", "identifier");
    expect(customLists).toHaveAttribute("data-csrf-token", "token");
  });
});

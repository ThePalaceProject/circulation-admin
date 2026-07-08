import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";

// Header and Footer are page chrome; Header pulls in the react-router v3 context
// that `renderWithProviders` does not supply. Mock them to markers.
jest.mock("../../../src/components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));
jest.mock("../../../src/components/Footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer" />,
}));

// CustomLists is a connected component that fetches lists, collections, libraries,
// and languages over the network on mount. That is incidental to what
// CustomListPage composes — the page's job is to hand the editor the params and
// context it needs — so mock it to a marker that echoes the props it received.
jest.mock("../../../src/components/CustomLists", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="custom-lists"
      data-library={props.library}
      data-edit-or-create={props.editOrCreate}
      data-identifier={props.identifier}
      data-csrf-token={props.csrfToken}
      data-has-store={String(!!props.store)}
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

    const customLists = screen.getByTestId("custom-lists");
    expect(customLists).toHaveAttribute("data-library", "library");
    expect(customLists).toHaveAttribute("data-edit-or-create", "edit");
    expect(customLists).toHaveAttribute("data-identifier", "identifier");
    expect(customLists).toHaveAttribute("data-csrf-token", "token");
    // The redux store is forwarded from context; assert it was passed through.
    expect(customLists).toHaveAttribute("data-has-store", "true");
  });
});

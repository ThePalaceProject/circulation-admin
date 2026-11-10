import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";

// Header and Footer are page chrome; Header reads the legacy `router` context
// and fetches on mount. Mock them to markers.
vi.mock("../../../src/components/Header", () => ({
  default: () => <div data-testid="header" />,
}));
vi.mock("../../../src/components/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

// ConfigTabContainer mounts the connected configuration sections (Libraries,
// Collections, Individual Admins, ...) which fetch over the network on mount. That
// is incidental to what ConfigPage composes — the page's job is to hand the tab
// container the params and context it needs — so mock it to a marker that echoes
// the props it received.
vi.mock("../../../src/components/ConfigTabContainer", () => ({
  default: (props: any) => (
    <div
      data-testid="config-tab-container"
      data-tab={props.tab}
      data-edit-or-create={props.editOrCreate}
      data-identifier={props.identifier}
      data-csrf-token={props.csrfToken}
      data-has-store={String(!!props.store)}
    />
  ),
}));

import ConfigPage from "../../../src/components/ConfigPage";

describe("ConfigPage", () => {
  const params = {
    tab: "libraries",
    editOrCreate: "edit",
    identifier: "identifier",
  };

  it("shows a tab container with tab from params", () => {
    renderWithProviders(<ConfigPage params={params} />, {
      appConfigSettings: { csrfToken: "token" },
    });

    const tabContainer = screen.getByTestId("config-tab-container");
    expect(tabContainer).toHaveAttribute("data-tab", "libraries");
    expect(tabContainer).toHaveAttribute("data-edit-or-create", "edit");
    expect(tabContainer).toHaveAttribute("data-identifier", "identifier");
    expect(tabContainer).toHaveAttribute("data-csrf-token", "token");
    // The redux store is forwarded from context; assert it was passed through.
    expect(tabContainer).toHaveAttribute("data-has-store", "true");
  });
});

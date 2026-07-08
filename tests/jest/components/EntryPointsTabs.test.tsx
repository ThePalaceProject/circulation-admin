import * as React from "react";
import { screen } from "@testing-library/react";
import { FacetData } from "@thepalaceproject/web-opds-client/lib/interfaces";

import { renderWithProviders } from "../testUtils/withProviders";

// Each tab is a CatalogLink, which renders a React Router `Link`. Router `Link`
// needs router context that `renderWithProviders` does not supply, so mock it to
// a marker that exposes its navigation target and children (matching Lane.test.tsx).
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props) => (
    <div data-testid="Link" data-to={props.to}>
      {props.children}
    </div>
  ),
}));

import { EntryPointsTabs } from "../../../src/components/EntryPointsTabs";

const twoFacets: FacetData[] = [
  {
    label: "Ebooks",
    href: "http://circulation.librarysimplified.org/groups/?entrypoint=Book",
    active: true,
  },
  {
    label: "Audiobooks",
    href: "http://circulation.librarysimplified.org/groups/?entrypoint=Audio",
    active: false,
  },
];

describe("EntryPointsTabs", () => {
  it("should not generate any tabs", () => {
    const { container } = renderWithProviders(<EntryPointsTabs />);

    expect(container.querySelector(".nav-tabs")).toBeNull();
  });

  it("should generate two tabs with two entry points", () => {
    const { container } = renderWithProviders(
      <EntryPointsTabs facets={twoFacets} />
    );

    const list = container.querySelector("ul.nav-tabs");
    expect(list).toBeInTheDocument();

    const items = list.querySelectorAll("li");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("active");
    expect(items[1]).not.toHaveClass("active");

    expect(screen.getByText("Ebooks")).toBeInTheDocument();
    expect(screen.getByText("Audiobooks")).toBeInTheDocument();
  });

  it("uses router to navigate when a tab is clicked", () => {
    renderWithProviders(<EntryPointsTabs facets={twoFacets} />);

    const links = screen.getAllByTestId("Link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent("Ebooks");
    expect(links[1]).toHaveTextContent("Audiobooks");
    // Each tab links somewhere for the router to navigate to.
    expect(links[0]).toHaveAttribute("data-to");
    expect(links[1]).toHaveAttribute("data-to");
  });

  it("should generate one tab with an active entry point", () => {
    const oneFacet: FacetData[] = [
      {
        label: "Audiobooks",
        href: "http://circulation.librarysimplified.org/groups/?entrypoint=Audio",
        active: true,
      },
    ];
    const { container } = renderWithProviders(
      <EntryPointsTabs facets={oneFacet} />
    );

    const items = container.querySelectorAll("ul.nav-tabs li");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveClass("active");

    expect(screen.getByText("Audiobooks")).toBeInTheDocument();
  });
});

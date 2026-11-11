import * as React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { FacetData } from "@thepalaceproject/web-opds-client/lib/interfaces";

import { renderWithProviders } from "../testUtils/withProviders";

import { EntryPointsTabs } from "../../../src/components/EntryPointsTabs";

// Each tab is a web-opds-client CatalogLink, which needs the legacy `router`
// context, so render inside a router.
const route = "/admin/web";

const CurrentPath = () => (
  <div data-testid="path">{useLocation().pathname}</div>
);

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
    const { container } = renderWithProviders(<EntryPointsTabs />, { route });

    expect(container.querySelector(".nav-tabs")).toBeNull();
  });

  it("should generate two tabs with two entry points", () => {
    const { container } = renderWithProviders(
      <EntryPointsTabs facets={twoFacets} />,
      { route }
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

  it("links each tab to its collection and navigates on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <EntryPointsTabs facets={twoFacets} />
        <CurrentPath />
      </>,
      { route }
    );

    const collectionPath = (href: string) =>
      `/admin/web/collection/${encodeURIComponent(href)}`;
    const ebooks = screen.getByRole("link", { name: "Ebooks" });
    const audiobooks = screen.getByRole("link", { name: "Audiobooks" });
    expect(ebooks).toHaveAttribute("href", collectionPath(twoFacets[0].href));
    expect(audiobooks).toHaveAttribute(
      "href",
      collectionPath(twoFacets[1].href)
    );

    await user.click(audiobooks);
    expect(screen.getByTestId("path")).toHaveTextContent(
      collectionPath(twoFacets[1].href)
    );
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
      <EntryPointsTabs facets={oneFacet} />,
      { route }
    );

    const items = container.querySelectorAll("ul.nav-tabs li");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveClass("active");

    expect(screen.getByText("Audiobooks")).toBeInTheDocument();
  });
});

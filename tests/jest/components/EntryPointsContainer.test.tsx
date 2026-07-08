import * as React from "react";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "../testUtils/withProviders";

// The wrapped `Collection` (from web-opds-client) is incidental here — the
// container's job is to pull the "Formats" facets out and hand them to
// `EntryPointsTabs`. Mock Collection to a marker so we can render the real
// EntryPointsTabs and assert the tabs it produces.
jest.mock(
  "@thepalaceproject/web-opds-client/lib/components/Collection",
  () => ({
    __esModule: true,
    default: () => <div data-testid="collection" />,
  })
);

// EntryPointsTabs renders CatalogLink -> React Router `Link`, which needs router
// context renderWithProviders does not supply. Mock `Link` to a marker.
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  Link: (props) => (
    <div data-testid="Link" data-to={props.to}>
      {props.children}
    </div>
  ),
}));

import EntryPointsContainer from "../../../src/components/EntryPointsContainer";

// Stands in for the OPDS Collection child whose `collection` prop the container
// reads. It is never rendered by the container (only its props are inspected).
class CollectionChild extends React.Component<{ collection: unknown }> {
  render() {
    return null;
  }
}

describe("EntryPointsContainer", () => {
  it("should not render entry-point tabs if no facets were passed", () => {
    const collection = {
      facetGroups: [],
      lanes: [],
      books: [],
      navigationLinks: [],
    };

    const { container } = renderWithProviders(
      <EntryPointsContainer>
        <CollectionChild collection={collection} />
      </EntryPointsContainer>
    );

    expect(
      container.querySelector(".entry-points-tab-container")
    ).toBeInTheDocument();
    // EntryPointsTabs renders nothing when there are no format facets.
    expect(container.querySelector(".nav-tabs")).toBeNull();
  });

  it("shows a tab container with facets when the label is 'Formats'", () => {
    const facetGroups = [
      {
        facets: [],
        label: "Some other facets",
      },
      {
        facets: [
          {
            label: "Ebooks",
            href: "http://circulation.librarysimplified.org/groups/?entrypoint=Book",
            active: false,
          },
          {
            label: "Audiobooks",
            href: "http://circulation.librarysimplified.org/groups/?entrypoint=Audio",
            active: false,
          },
        ],
        label: "Formats",
      },
    ];
    const collection = { facetGroups };

    const { container } = renderWithProviders(
      <EntryPointsContainer>
        <CollectionChild collection={collection} />
      </EntryPointsContainer>
    );

    const list = container.querySelector("ul.nav-tabs");
    expect(list).toBeInTheDocument();
    expect(list.querySelectorAll("li")).toHaveLength(2);
    expect(screen.getByText("Ebooks")).toBeInTheDocument();
    expect(screen.getByText("Audiobooks")).toBeInTheDocument();
  });
});

import * as React from "react";
import { render } from "@testing-library/react";
import EntryPointsContainer from "../../../src/components/shared/EntryPointsContainer";

jest.mock("../../../src/components/shared/EntryPointsTabs", () => {
  const MockEntryPointsTabs = (props: any) => (
    <div
      data-testid="entry-points-tabs"
      data-facet-count={props.facets?.length ?? 0}
    />
  );
  MockEntryPointsTabs.displayName = "MockEntryPointsTabs";
  return { __esModule: true, default: MockEntryPointsTabs };
});

// web-opds-client Collection is complex — mock it
jest.mock("@thepalaceproject/web-opds-client/lib/components/Collection", () => {
  const MockCollection = (props: any) => <div data-testid="collection" />;
  MockCollection.displayName = "MockCollection";
  return { __esModule: true, default: MockCollection };
});

function makeChild(facetGroups: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ChildComponent: any = (props: any) => (
    <div data-testid="child-component" />
  );
  ChildComponent.displayName = "ChildComponent";

  const collection = {
    facetGroups,
    lanes: [],
    books: [],
    navigationLinks: [],
  };

  return <ChildComponent collection={collection} />;
}

describe("EntryPointsContainer", () => {
  it("renders with empty facets when no Formats facet group", () => {
    const child = makeChild([]);
    const { getByTestId } = render(
      <EntryPointsContainer>{child}</EntryPointsContainer>
    );
    const tabs = getByTestId("entry-points-tabs");
    expect(tabs.getAttribute("data-facet-count")).toBe("0");
  });

  it("passes Formats facets to EntryPointsTabs", () => {
    const facetGroups = [
      { facets: [], label: "Some other facets" },
      {
        facets: [
          {
            label: "Ebooks",
            href: "http://example.com/groups/?entrypoint=Book",
            active: false,
          },
          {
            label: "Audiobooks",
            href: "http://example.com/groups/?entrypoint=Audio",
            active: false,
          },
        ],
        label: "Formats",
      },
    ];
    const child = makeChild(facetGroups);
    const { getByTestId } = render(
      <EntryPointsContainer>{child}</EntryPointsContainer>
    );
    const tabs = getByTestId("entry-points-tabs");
    expect(tabs.getAttribute("data-facet-count")).toBe("2");
  });
});

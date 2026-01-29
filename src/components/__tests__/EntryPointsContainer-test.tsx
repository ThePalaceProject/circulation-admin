import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import buildStore from "../../store";
import EntryPointsContainer from "../EntryPointsContainer";
import EntryPointsTabs from "../EntryPointsTabs";
import { LinkData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { mockRouterContext } from "./routing";

class DefaultCollection extends React.Component<any, any> {
  render() {
    return <div></div>;
  }
}

describe("EntryPointsContainer", () => {
  let context;
  let path;
  let wrapper;

  beforeEach(() => {
    path = stub();
    context = mockRouterContext(path);
  });

  it("should not render the EntryPointsTabs component if no facets were passed", () => {
    const collection = {
      facetGroups: [],
      lanes: [],
      books: [],
      navigationLinks: [],
    };

    wrapper = shallow(
      <EntryPointsContainer>
        <DefaultCollection collection={collection} />
      </EntryPointsContainer>,
      { context }
    );
    const entryPointsTabs = wrapper.find(EntryPointsTabs);
    expect(entryPointsTabs.html()).to.equal("");
    expect(entryPointsTabs.props().facets).to.eql([]);
  });

  it("shows a tab container with facets when the label is 'Formats'", () => {
    const collection = { facetGroups: [] };
    const facetGroups = [
      {
        facets: [],
        label: "Some other facets",
      },
      {
        facets: [
          {
            label: "Ebooks",
            href:
              "http://circulation.librarysimplified.org/groups/?entrypoint=Book",
            active: false,
          },
          {
            label: "Audiobooks",
            href:
              "http://circulation.librarysimplified.org/groups/?entrypoint=Audio",
            active: false,
          },
        ],
        label: "Formats",
      },
    ];

    collection.facetGroups = facetGroups;

    wrapper = shallow(
      <EntryPointsContainer>
        <DefaultCollection collection={collection} />
      </EntryPointsContainer>,
      { context }
    );

    const entryPointsTabs = wrapper.find(EntryPointsTabs);
    expect(entryPointsTabs).to.be.ok;
    expect(entryPointsTabs.props().facets).to.eql(facetGroups[1].facets);
  });
});

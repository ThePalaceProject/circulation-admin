import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import buildStore from "../../store";
import EntryPointsContainer from "../EntryPointsContainer";
import EntryPointsTabs from "../EntryPointsTabs";
import { LinkData } from "opds-web-client/lib/interfaces";

describe("EntryPointsContainer", () => {
  let facetGroups;
  let wrapper;

  it("should not render if no facets were passed", () => {
    facetGroups = [];

    wrapper = shallow(<EntryPointsContainer facetGroups={facetGroups} />);
    expect(wrapper.html()).to.equal(null);
  });

  it("shows a tab container with facets when the label is 'Formats'", () => {
    facetGroups = [
      {
        facets: [],
        label: "Some other facets",
      },
      {
        facets: [
          { label: "Books", href: "http://circulation.librarysimplified.org/groups/?entrypoint=Book", active: false },
          { label: "Audio", href: "http://circulation.librarysimplified.org/groups/?entrypoint=Audio", active: false },
        ],
        label: "Formats",
      }
    ];

    wrapper = shallow(<EntryPointsContainer facetGroups={facetGroups} />);

    let entryPointsTabs = wrapper.find(EntryPointsTabs);
    expect(entryPointsTabs).to.be.ok;
    expect(entryPointsTabs.props().facets).to.equal(facetGroups[1].facets);
  });
});

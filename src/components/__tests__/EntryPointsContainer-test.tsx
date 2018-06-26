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

  it("shows a tab container with Audio selected value", () => {
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

    let entryPointsContainer = wrapper.find(EntryPointsTabs);
    expect(entryPointsContainer).to.be.ok;
    expect(entryPointsContainer.props().formats).to.equal(facetGroups[1]);
  });
});

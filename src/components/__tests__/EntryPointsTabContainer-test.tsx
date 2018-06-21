import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import buildStore from "../../store";
import { EntryPointsTabContainer } from "../EntryPointsTabContainer";

describe("EntryPointsTabContainer", () => {
  let wrapper;
  let context;
  let push;
  let store;
  let fetchLibraries = stub();

  beforeEach(() => {
    store = buildStore();
    wrapper = shallow(
      <EntryPointsTabContainer
        fetchLibraries={fetchLibraries}
        libraries={[{
            short_name: "library",
            settings: { enabled_entry_points: ["Book", "Audio"] }
          }]}
        collectionUrl="collection url"
        library={(a, b) => "library"}
        store={store}
        activeValue="Book"
        homeLink="home url"
      />,
      { context }
    );
  });

  it("should generate two tabs", () => {
    let details = wrapper.find(".nav-tabs");
    expect(details).to.be.ok;
    expect(details.find("li").length).to.equal(2);
    expect(details.find("li").at(0).text()).to.equal();
  });
});

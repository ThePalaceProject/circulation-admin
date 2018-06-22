import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import EntryPointsContainer from "../EntryPointsContainer";
import EntryPointsTabs from "../EntryPointsTabs";
import { LinkData } from "opds-web-client/lib/interfaces";

describe("EntryPointsContainer", () => {
  let breadcrumbsLinks: LinkData[];
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = {
      editorStore: store,
      library: stub()
    };
  });

  it("shows a tab container with default selected tab of Book", () => {
    breadcrumbsLinks = [{
      id: "1st id",
      text: "1st title",
      url: "1st url"
    }, {
      id: "last id",
      text: "last title",
      url: "last url"
    }];

    wrapper = shallow(
      <EntryPointsContainer
        breadcrumbsLinks={breadcrumbsLinks}
        collectionUrl="collection url"
      />,
      { context }
    );

    let entryPointsContainer = wrapper.find(EntryPointsTabs);
    expect(entryPointsContainer).to.be.ok;
    expect(entryPointsContainer.props().collectionUrl).to.equal("collection url");
    expect(entryPointsContainer.props().library).to.equal(context.library);
    expect(entryPointsContainer.props().store).to.equal(store);
    expect(entryPointsContainer.props().activeValue).to.equal("Book");
    expect(entryPointsContainer.props().homeLink).to.equal("1st url");
  });

  it("shows a tab container with Audio selected value", () => {
    breadcrumbsLinks = [{
      id: "1st id",
      text: "1st title",
      url: "1st url"
    }, {
      id: "last id",
      text: "last title",
      url: "last url"
    }];

    wrapper = shallow(
      <EntryPointsContainer
        breadcrumbsLinks={breadcrumbsLinks}
        collectionUrl="collectionUrl?entrypoint=Audio"
      />,
      { context }
    );

    let entryPointsContainer = wrapper.find(EntryPointsTabs);
    expect(entryPointsContainer).to.be.ok;
    expect(entryPointsContainer.props().collectionUrl).to.equal("collectionUrl?entrypoint=Audio");
    expect(entryPointsContainer.props().library).to.equal(context.library);
    expect(entryPointsContainer.props().store).to.equal(store);
    expect(entryPointsContainer.props().activeValue).to.equal("Audio");
    expect(entryPointsContainer.props().homeLink).to.equal("1st url");
  });
});

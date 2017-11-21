import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import ConfigPage from "../ConfigPage";
import ConfigTabContainer from "../ConfigTabContainer";

describe("ConfigPage", () => {
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = {
      editorStore: store,
      csrfToken: "token"
    };
    let params = {
      tab: "libraries",
      editOrCreate: "edit",
      identifier: "identifier"
    };

    wrapper = shallow(
      <ConfigPage
        params={params}
        />,
      { context }
    );
  });

  it("shows a tab container with tab from params", () => {
    let tabContainer = wrapper.find(ConfigTabContainer);
    expect(tabContainer).to.be.ok;
    expect(tabContainer.props().tab).to.equal("libraries");
    expect(tabContainer.props().editOrCreate).to.equal("edit");
    expect(tabContainer.props().identifier).to.equal("identifier");
    expect(tabContainer.props().store).to.equal(store);
    expect(tabContainer.props().csrfToken).to.equal("token");
  });
});
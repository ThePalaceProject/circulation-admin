import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import CustomListPage from "../CustomListPage";
import CustomLists from "../CustomLists";

describe("CustomListPage", () => {
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
      library: "library",
      editOrCreate: "edit",
      identifier: "identifier"
    };

    wrapper = shallow(
      <CustomListPage
        params={params}
        />,
      { context }
    );
  });

  it("shows custom lists with info from params", () => {
    let customLists = wrapper.find(CustomLists);
    expect(customLists).to.be.ok;
    expect(customLists.props().library).to.equal("library");
    expect(customLists.props().editOrCreate).to.equal("edit");
    expect(customLists.props().identifier).to.equal("identifier");
    expect(customLists.props().store).to.equal(store);
    expect(customLists.props().csrfToken).to.equal("token");
  });
});
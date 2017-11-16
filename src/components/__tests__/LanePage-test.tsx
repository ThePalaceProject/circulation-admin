import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import LanePage from "../LanePage";
import Lanes from "../Lanes";

describe("LanePage", () => {
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
      identifier: "5"
    };

    wrapper = shallow(
      <LanePage
        params={params}
        />,
      { context }
    );
  });

  it("shows lanes with info from params", () => {
    let lanes = wrapper.find(Lanes);
    expect(lanes).to.be.ok;
    expect(lanes.props().library).to.equal("library");
    expect(lanes.props().editOrCreate).to.equal("edit");
    expect(lanes.props().identifier).to.equal("5");
    expect(lanes.props().store).to.equal(store);
    expect(lanes.props().csrfToken).to.equal("token");
  });
});
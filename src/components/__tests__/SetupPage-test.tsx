import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import SetupPage from "../SetupPage";
import IndividualAdmins from "../IndividualAdmins";

describe("SetupPage", () => {
  let wrapper;
  let store;
  let context;

  beforeEach(() => {
    store = buildStore();
    context = {
      editorStore: store,
      csrfToken: "token"
    };

    wrapper = shallow(
      <SetupPage />,
      { context }
    );
  });

  it("shows individual admins create form", () => {
    let individualAdmins = wrapper.find(IndividualAdmins);
    expect(individualAdmins).to.be.ok;
    expect(individualAdmins.props().store).to.equal(store);
    expect(individualAdmins.props().csrfToken).to.equal("token");
    expect(individualAdmins.props().editOrCreate).to.equal("create");
    expect(individualAdmins.props().identifier).to.be.undefined;
  });
});
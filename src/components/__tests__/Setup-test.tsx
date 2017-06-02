import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import Setup from "../Setup";
import AdminAuthServices from "../AdminAuthServices";
import IndividualAdmins from "../IndividualAdmins";

describe("Setup", () => {
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
      <Setup />,
      { context }
    );
  });

  it("shows admin auth services create form", () => {
    let adminAuthServices = wrapper.find(AdminAuthServices);
    expect(adminAuthServices).to.be.ok;
    expect(adminAuthServices.props().store).to.equal(store);
    expect(adminAuthServices.props().csrfToken).to.equal("token");
    expect(adminAuthServices.props().editOrCreate).to.equal("create");
    expect(adminAuthServices.props().identifier).to.be.undefined;
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
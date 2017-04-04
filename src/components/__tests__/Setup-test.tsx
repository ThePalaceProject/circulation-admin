import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import buildStore from "../../store";
import Setup from "../Setup";
import AdminAuthServices from "../AdminAuthServices";

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
    expect(adminAuthServices.props().adminAuthService).to.be.undefined;
  });
});
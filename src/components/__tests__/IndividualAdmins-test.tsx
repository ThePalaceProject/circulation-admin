import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";
import { IndividualAdmins } from "../IndividualAdmins";
import Admin from "../../models/Admin";


describe("IndividualAdmins", () => {

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <IndividualAdmins
        settingUp={true}
        editOrCreate="create"
        csrfToken="token"
      />,
      { context: { settingUp: true},
        childContextTypes: { settingUp: React.PropTypes.bool.isRequired }
      }
    );
  });

  it("shows welcome message on setup", () => {
    let header = wrapper.find("h2");
    expect(header.text()).to.equal("Welcome!");
  });

  it("shows setup message on setup", () => {
    let formHeader = wrapper.find("h3");
    expect(formHeader.text()).to.equal("Set up your system admin account");
  });

  it("shows the correct content when not setting up", () => {
    wrapper.setProps({ settingUp: false });
    let header = wrapper.find("h2");
    let formHeader = wrapper.find("h3");
    expect(header.text()).to.equal("Individual admin configuration");
    expect(formHeader.text()).to.equal("Create a new individual admin");
  });

});

import { expect } from "chai";
import * as PropTypes from "prop-types";
import * as React from "react";
import { mount } from "enzyme";
import { IndividualAdmins } from "../IndividualAdmins";


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
        childContextTypes: { settingUp: PropTypes.bool.isRequired }
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

import { expect } from "chai";
import * as PropTypes from "prop-types";
import * as React from "react";
import { mount } from "enzyme";
import { IndividualAdmins } from "../IndividualAdmins";

describe("IndividualAdmins", () => {
  let isSystemAdmin: boolean;
  let isLibraryManager: boolean;
  let wrapper;
  beforeEach(() => {
    isSystemAdmin = false;
    isLibraryManager = false;

    wrapper = mount(
      <IndividualAdmins
        settingUp={true}
        editOrCreate="create"
        csrfToken="token"
      />,
      {
        context: {
          settingUp: true,
          admin: {
            isSystemAdmin: () => isSystemAdmin,
            isLibraryManagerOfSomeLibrary: () => isLibraryManager,
          },
        },
        childContextTypes: { settingUp: PropTypes.bool.isRequired },
      }
    );
  });

  it("shows welcome message on setup", () => {
    const header = wrapper.find("h2");
    expect(header.text()).to.equal("Welcome!");
  });

  it("shows setup message on setup", () => {
    const formHeader = wrapper.find("h3");
    expect(formHeader.text()).to.equal("Set up your system admin account");
  });

  it("shows the correct content when not setting up", () => {
    wrapper.setProps({ settingUp: false });
    const header = wrapper.find("h2");
    const formHeader = wrapper.find("h3");
    expect(header.text()).to.equal("Individual admin configuration");
    expect(formHeader.text()).to.equal("Create a new individual admin");
  });

  it("allows library managers to create items", () => {
    isLibraryManager = true;
    expect(wrapper.instance().canCreate()).to.equal(true);
  });

  it("allows system admins to delete items", () => {
    isSystemAdmin = true;
    expect(wrapper.instance().canDelete()).to.equal(true);
  });

  it("allows library managers to edit items", () => {
    isLibraryManager = true;
    expect(wrapper.instance().canEdit()).to.equal(true);
  });

  it("does not allow non-library managers to create items", () => {
    expect(wrapper.instance().canCreate()).to.equal(false);
  });

  it("does not allow non-system admins to delete items", () => {
    expect(wrapper.instance().canDelete()).to.equal(false);

    isLibraryManager = true;
    expect(wrapper.instance().canDelete()).to.equal(false);
  });

  it("does not allow non-library managers to edit items", () => {
    expect(wrapper.instance().canEdit()).to.equal(false);
  });
});

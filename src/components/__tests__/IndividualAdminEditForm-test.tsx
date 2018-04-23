import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import IndividualAdminEditForm from "../IndividualAdminEditForm";
import EditableInput from "../EditableInput";
import Admin from "../../models/Admin";

describe("IndividualAdminEditForm", () => {
  let wrapper;
  let editIndividualAdmin;
  let adminData = {
    email: "test@nypl.org",
    password: "password"
  };
  let allLibraries = [
    { short_name: "nypl" },
    { short_name: "bpl" }
  ];

  let systemAdmin = [{ role: "system" }];
  let managerAll = [{ role: "manager-all" }];
  let librarianAll = [{ role: "librarian-all" }];
  let nyplManager = [{ role: "manager", library: "nypl" }];
  let bplManager = [{ role: "manager", library: "bpl" }];
  let bothManager = [{ role: "manager", library: "nypl" }, { role: "manager", library: "bpl" }];
  let nyplLibrarian = [{ role: "librarian", library: "nypl" }];
  let bplLibrarian = [{ role: "librarian", library: "bpl" }];
  let bothLibrarian = [{ role: "librarian", library: "nypl" }, { role: "librarian", library: "bpl" }];
  let nyplManagerLibrarianAll = [{ role: "manager", library: "nypl" }, { role: "librarian-all" }];

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      editIndividualAdmin = stub();
      wrapper = shallow(
        <IndividualAdminEditForm
          data={{ individualAdmins: [adminData], allLibraries }}
          disabled={false}
          editItem={editIndividualAdmin}
          urlBase="url base"
          listDataKey="admins"
          />,
        { context: { admin: new Admin(systemAdmin) }}
      );
    });

    it("renders email", () => {
      let input = editableInputByName("email");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: adminData });
      input = editableInputByName("email");
      expect(input.props().value).to.equal("test@nypl.org");
    });

    it("renders password", () => {
      let input = editableInputByName("password");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: adminData });
      input = editableInputByName("password");
      // Doesn't show the old password even if it's in the props.
      expect(input.props().value).not.to.be.ok;
    });

    describe("roles", () => {
      const expectRole = (startingRoles, role, shouldBeChecked: boolean, shouldBeEnabled: boolean = true) => {
        let adminDataWithRoles = Object.assign({}, adminData, { roles: startingRoles });
        wrapper.setProps({ item: adminDataWithRoles });
        let input = editableInputByName(role);
        expect(input.props().checked).to.equal(shouldBeChecked);
        expect(input.props().disabled).to.equal(!shouldBeEnabled);
      };

      it("renders system admin role", () => {
        expectRole([], "system", false);
        expectRole(systemAdmin, "system", true);
        expectRole(managerAll, "system", false);
        expectRole(bothLibrarian, "system", false);

        wrapper.setContext({ admin: new Admin(managerAll) });
        expectRole([], "system", false, false);
        expectRole(systemAdmin, "system", true, false);
        expectRole(managerAll, "system", false, false);
        expectRole(bothLibrarian, "system", false, false);
      });

      it("renders manager all role", () => {
        expectRole([], "manager-all", false);
        expectRole(systemAdmin, "manager-all", true);
        expectRole(managerAll, "manager-all", true);
        expectRole(bothManager, "manager-all", false);
        expectRole(nyplManager, "manager-all", false);
        expectRole(librarianAll, "manager-all", false);

        wrapper.setContext({ admin: new Admin(librarianAll) });
        expectRole([], "manager-all", false, false);
        expectRole(systemAdmin, "manager-all", true, false);
        expectRole(managerAll, "manager-all", true, false);
        expectRole(bothManager, "manager-all", false, false);
        expectRole(nyplManager, "manager-all", false, false);
        expectRole(librarianAll, "manager-all", false, false);

        wrapper.setContext({ admin: new Admin(nyplManager) });
        expectRole([], "manager-all", false, false);
        expectRole(systemAdmin, "manager-all", true, false);
        expectRole(managerAll, "manager-all", true, false);
        expectRole(bothManager, "manager-all", false, false);
        expectRole(nyplManager, "manager-all", false, false);
        expectRole(librarianAll, "manager-all", false, false);
      });

      it("renders librarian all role", () => {
        expectRole([], "librarian-all", false);
        expectRole(systemAdmin, "librarian-all", true);
        expectRole(managerAll, "librarian-all", true);
        expectRole(bothManager, "librarian-all", false);
        expectRole(nyplManager, "librarian-all", false);
        expectRole(librarianAll, "librarian-all", true);
        expectRole(bothLibrarian, "librarian-all", false);
        expectRole(nyplLibrarian, "librarian-all", false);

        wrapper.setContext({ admin: new Admin(nyplManager) });
        expectRole([], "librarian-all", false, false);
        expectRole(systemAdmin, "librarian-all", true, false);
        expectRole(managerAll, "librarian-all", true, false);
        expectRole(bothManager, "librarian-all", false, false);
        expectRole(nyplManager, "librarian-all", false, false);
        expectRole(librarianAll, "librarian-all", true, false);
        expectRole(bothLibrarian, "librarian-all", false, false);
        expectRole(nyplLibrarian, "librarian-all", false, false);

        wrapper.setContext({ admin: new Admin(librarianAll) });
        expectRole([], "librarian-all", false, false);
        expectRole(systemAdmin, "librarian-all", true, false);
        expectRole(managerAll, "librarian-all", true, false);
        expectRole(bothManager, "librarian-all", false, false);
        expectRole(nyplManager, "librarian-all", false, false);
        expectRole(librarianAll, "librarian-all", true, false);
        expectRole(bothLibrarian, "librarian-all", false, false);
        expectRole(nyplLibrarian, "librarian-all", false, false);
      });

      it("renders manager role for each library", () => {
        expectRole([], "manager-nypl", false);
        expectRole(systemAdmin, "manager-nypl", true);
        expectRole(managerAll, "manager-nypl", true);
        expectRole(bothManager, "manager-nypl", true);
        expectRole(nyplManager, "manager-nypl", true);
        expectRole(librarianAll, "manager-nypl", false);
        expectRole(bplManager, "manager-nypl", false);
        expectRole(nyplLibrarian, "manager-nypl", false);

        expectRole(systemAdmin, "manager-bpl", true);
        expectRole(managerAll, "manager-bpl", true);
        expectRole(bothManager, "manager-bpl", true);
        expectRole(nyplManager, "manager-bpl", false);
        expectRole(librarianAll, "manager-bpl", false);
        expectRole(bplManager, "manager-bpl", true);
        expectRole(nyplLibrarian, "manager-bpl", false);

        wrapper.setContext({ admin: new Admin(nyplManager) });

        expectRole([], "manager-nypl", false, true);
        expectRole(systemAdmin, "manager-nypl", true, false);
        expectRole(managerAll, "manager-nypl", true, false);
        expectRole(bothManager, "manager-nypl", true, true);
        expectRole(nyplManager, "manager-nypl", true, true);
        expectRole(librarianAll, "manager-nypl", false, true);
        expectRole(bplManager, "manager-nypl", false, true);
        expectRole(nyplLibrarian, "manager-nypl", false, true);

        expectRole(systemAdmin, "manager-bpl", true, false);
        expectRole(managerAll, "manager-bpl", true, false);
        expectRole(bothManager, "manager-bpl", true, false);
        expectRole(nyplManager, "manager-bpl", false, false);
        expectRole(librarianAll, "manager-bpl", false, false);
        expectRole(bplManager, "manager-bpl", true, false);
        expectRole(nyplLibrarian, "manager-bpl", false, false);

        wrapper.setContext({ admin: new Admin(managerAll) });

        expectRole([], "manager-nypl", false, true);
        expectRole(systemAdmin, "manager-nypl", true, false);
        expectRole(managerAll, "manager-nypl", true, true);
        expectRole(bothManager, "manager-nypl", true, true);
        expectRole(nyplManager, "manager-nypl", true, true);
        expectRole(librarianAll, "manager-nypl", false, true);
        expectRole(bplManager, "manager-nypl", false, true);
        expectRole(nyplLibrarian, "manager-nypl", false, true);

        expectRole(systemAdmin, "manager-bpl", true, false);
        expectRole(managerAll, "manager-bpl", true, true);
        expectRole(bothManager, "manager-bpl", true, true);
        expectRole(nyplManager, "manager-bpl", false, true);
        expectRole(librarianAll, "manager-bpl", false, true);
        expectRole(bplManager, "manager-bpl", true, true);
        expectRole(nyplLibrarian, "manager-bpl", false, true);
      });

      it("renders librarian role for each library", () => {
        expectRole([], "librarian-nypl", false);
        expectRole(systemAdmin, "librarian-nypl", true);
        expectRole(managerAll, "librarian-nypl", true);
        expectRole(bothManager, "librarian-nypl", true);
        expectRole(nyplManager, "librarian-nypl", true);
        expectRole(librarianAll, "librarian-nypl", true);
        expectRole(bplManager, "librarian-nypl", false);
        expectRole(nyplLibrarian, "librarian-nypl", true);
        expectRole(bplLibrarian, "librarian-nypl", false);

        expectRole(systemAdmin, "librarian-bpl", true);
        expectRole(managerAll, "librarian-bpl", true);
        expectRole(bothManager, "librarian-bpl", true);
        expectRole(nyplManager, "librarian-bpl", false);
        expectRole(librarianAll, "librarian-bpl", true);
        expectRole(bplManager, "librarian-bpl", true);
        expectRole(nyplLibrarian, "librarian-bpl", false);
        expectRole(bplLibrarian, "librarian-bpl", true);

        wrapper.setContext({ admin: new Admin(nyplManager) });

        expectRole([], "librarian-nypl", false, true);
        expectRole(systemAdmin, "librarian-nypl", true, false);
        expectRole(managerAll, "librarian-nypl", true, false);
        expectRole(bothManager, "librarian-nypl", true, true);
        expectRole(nyplManager, "librarian-nypl", true, true);
        expectRole(librarianAll, "librarian-nypl", true, false);
        expectRole(bplManager, "librarian-nypl", false, true);
        expectRole(nyplLibrarian, "librarian-nypl", true, true);
        expectRole(bplLibrarian, "librarian-nypl", false, true);

        expectRole(systemAdmin, "librarian-bpl", true, false);
        expectRole(managerAll, "librarian-bpl", true, false);
        expectRole(bothManager, "librarian-bpl", true, false);
        expectRole(nyplManager, "librarian-bpl", false, false);
        expectRole(librarianAll, "librarian-bpl", true, false);
        expectRole(bplManager, "librarian-bpl", true, false);
        expectRole(nyplLibrarian, "librarian-bpl", false, false);
        expectRole(bplLibrarian, "librarian-bpl", true, false);

        wrapper.setContext({ admin: new Admin(managerAll) });

        expectRole([], "librarian-nypl", false, true);
        expectRole(systemAdmin, "librarian-nypl", true, false);
        expectRole(managerAll, "librarian-nypl", true, true);
        expectRole(bothManager, "librarian-nypl", true, true);
        expectRole(nyplManager, "librarian-nypl", true, true);
        expectRole(librarianAll, "librarian-nypl", true, true);
        expectRole(bplManager, "librarian-nypl", false, true);
        expectRole(nyplLibrarian, "librarian-nypl", true, true);
        expectRole(bplLibrarian, "librarian-nypl", false, true);

        expectRole(systemAdmin, "librarian-bpl", true, false);
        expectRole(managerAll, "librarian-bpl", true, true);
        expectRole(bothManager, "librarian-bpl", true, true);
        expectRole(nyplManager, "librarian-bpl", false, true);
        expectRole(librarianAll, "librarian-bpl", true, true);
        expectRole(bplManager, "librarian-bpl", true, true);
        expectRole(nyplLibrarian, "librarian-bpl", false, true);
        expectRole(bplLibrarian, "librarian-bpl", true, true);
      });

      it("does not render roles when setting up first admin", () => {
        wrapper.setContext({ settingUp: true });
        for (const role of ["system", "manager-all", "librarian-all", "manager-nypl", "librarian-nypl"]) {
          let input = editableInputByName(role);
          expect(input.length).to.equal(0);
        }
      });
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editIndividualAdmin = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <IndividualAdminEditForm
          data={{ individualAdmins: [adminData], allLibraries }}
          disabled={false}
          editItem={editIndividualAdmin}
          urlBase="url base"
          listDataKey="admins"
          />,
        { context: { admin: new Admin(systemAdmin) }}
      );
    });

    describe("roles", () => {
      let input;
      let adminDataWithRoles;
      const allRoles = ["system", "manager-all", "librarian-all", "manager-nypl", "manager-bpl", "librarian-nypl", "librarian-bpl"];
      const expectRoles = (expected) => {
        for (const role of allRoles) {
          let shouldBeChecked = expected.includes(role);
          expect(editableInputByName(role).props().checked).to.equal(shouldBeChecked);
        }
      };

      it("changes system admin role", () => {
        adminDataWithRoles = Object.assign({}, adminData, { roles: nyplManagerLibrarianAll });
        wrapper.setProps({ item: adminDataWithRoles });

        input = editableInputByName("system");
        input.find("input").simulate("change");
        expectRoles(allRoles);

        input.find("input").simulate("change");
        expectRoles([]);
      });

      it("changes manager all role", () => {
        input = editableInputByName("manager-all");
        input.find("input").simulate("change");
        expectRoles(["manager-all", "librarian-all", "manager-nypl", "manager-bpl", "librarian-nypl", "librarian-bpl"]);

        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: systemAdmin });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: nyplManagerLibrarianAll });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-all", "librarian-all", "manager-nypl", "manager-bpl", "librarian-nypl", "librarian-bpl"]);
      });

      it("changes librarian all role", () => {
        input = editableInputByName("librarian-all");
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

        input.find("input").simulate("change");
        expectRoles([]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: systemAdmin });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles([]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: nyplManagerLibrarianAll });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-nypl", "librarian-nypl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: nyplLibrarian });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);
      });

      it("changes manager role for each library", () => {
        let role = "manager-nypl";
        input = editableInputByName(role);
        input.find("input").simulate("change");
        expectRoles(["manager-nypl", "librarian-nypl"]);

        input.find("input").simulate("change");
        expectRoles(["librarian-nypl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: systemAdmin });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "manager-bpl", "librarian-nypl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: managerAll });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "manager-bpl", "librarian-nypl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: nyplManagerLibrarianAll });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: nyplLibrarian });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-nypl", "librarian-nypl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: bplLibrarian });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-nypl", "librarian-nypl", "librarian-bpl"]);
      });

      it("changes librarian role for each library", () => {
        input = editableInputByName("librarian-nypl");
        input.find("input").simulate("change");
        expectRoles(["librarian-nypl"]);

        input.find("input").simulate("change");
        expectRoles([]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: systemAdmin });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-bpl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: managerAll });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-bpl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: nyplManagerLibrarianAll });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, { roles: bplLibrarian });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-nypl", "librarian-bpl"]);
      });
    });

    it("submits data", async () => {
      // Set window.location.href to be writable, jsdom doesn't normally allow changing it but browsers do.
      // Start on the create page.
      Object.defineProperty(window.location, "href", { writable: true, value: "url base/create" });

      let emailInput = wrapper.find("input[name='email']");
      let emailInputElement = emailInput.get(0);
      emailInputElement.value = "newEmail";
      emailInput.simulate("change");
      let pwInput = wrapper.find("input[name='password']");
      let pwInputElement = pwInput.get(0);
      pwInputElement.value = "newPassword";
      pwInput.simulate("change");
      let librarianAllInput = editableInputByName("librarian-all");
      librarianAllInput.find("input").simulate("change");
      let managerNyplInput = editableInputByName("manager-nypl");
      managerNyplInput.find("input").simulate("change");

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editIndividualAdmin.callCount).to.equal(1);
      let formData = editIndividualAdmin.args[0][0];
      expect(formData.get("email")).to.equal("newEmail");
      expect(formData.get("password")).to.equal("newPassword");
      expect(formData.get("roles")).to.equal(JSON.stringify([{ role: "librarian-all" }, { role: "manager", library: "nypl" }]));

      wrapper.setProps({ editedIdentifier: "newEmail" });
      // Let the call stack clear so the callback after editItem will run.
      const pause = (): Promise<void> => {
          return new Promise<void>(resolve => setTimeout(resolve, 0));
      };
      await pause();
      expect(window.location.href).to.contain("edit");
      expect(window.location.href).to.contain("newEmail");
    });

    it("submits system admin when setting up", () => {
      Object.defineProperty(window.location, "href", { writable: true, value: "url base/create" });

      wrapper.setContext({ settingUp: true });

      let emailInput = wrapper.find("input[name='email']");
      let emailInputElement = emailInput.get(0);
      emailInputElement.value = "newEmail";
      emailInput.simulate("change");
      let pwInput = wrapper.find("input[name='password']");
      let pwInputElement = pwInput.get(0);
      pwInputElement.value = "newPassword";
      pwInput.simulate("change");

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editIndividualAdmin.callCount).to.equal(1);
      let formData = editIndividualAdmin.args[0][0];
      expect(formData.get("email")).to.equal("newEmail");
      expect(formData.get("password")).to.equal("newPassword");
      expect(formData.get("roles")).to.equal(JSON.stringify([{ role: "system" }]));
    });
  });
});
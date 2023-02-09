import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import IndividualAdminEditForm from "../IndividualAdminEditForm";
import EditableInput from "../EditableInput";
import Admin from "../../models/Admin";
import { Button, Form, Panel } from "library-simplified-reusable-components";

describe("IndividualAdminEditForm", () => {
  let wrapper;
  let save;
  const adminData = {
    email: "test@nypl.org",
    password: "password",
  };
  const allLibraries = [{ short_name: "nypl" }, { short_name: "bpl" }];

  const systemAdmin = [{ role: "system" }];
  const managerAll = [{ role: "manager-all" }];
  const librarianAll = [{ role: "librarian-all" }];
  const nyplManager = [{ role: "manager", library: "nypl" }];
  const bplManager = [{ role: "manager", library: "bpl" }];
  const bothManager = [
    { role: "manager", library: "nypl" },
    { role: "manager", library: "bpl" },
  ];
  const nyplLibrarian = [{ role: "librarian", library: "nypl" }];
  const bplLibrarian = [{ role: "librarian", library: "bpl" }];
  const bothLibrarian = [
    { role: "librarian", library: "nypl" },
    { role: "librarian", library: "bpl" },
  ];
  const nyplManagerLibrarianAll = [
    { role: "manager", library: "nypl" },
    { role: "librarian-all" },
  ];

  const editableInputByName = (name) => {
    const inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere((input) => input.props().name === name);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      save = stub();
      wrapper = mount(
        <IndividualAdminEditForm
          data={{ individualAdmins: [adminData], allLibraries }}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="admins"
        />,
        { context: { admin: new Admin(systemAdmin) } }
      );
    });

    it("renders email", () => {
      let input = editableInputByName("email");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: adminData });
      input = editableInputByName("email");
      expect(input.props().value).to.equal("test@nypl.org");
    });

    it("renders password if admin is allowed to edit it", () => {
      const input = editableInputByName("password");
      expect(input.props().value).not.to.be.ok;

      const expectPasswordEditable = (
        targetAdminRoles,
        editingAdminRoles,
        editable: boolean = true
      ) => {
        const targetAdmin = new Admin(targetAdminRoles);
        const editingAdmin = new Admin(editingAdminRoles);
        wrapper.setProps({ item: targetAdmin });
        wrapper.setContext({ admin: editingAdmin });
        const input = editableInputByName("password");
        if (editable) {
          expect(input.length).to.equal(1);
          // The old password isn't shown even if it's editable.
          expect(input.props().value).not.to.be.ok;
        } else {
          expect(input.length).to.equal(0);
        }
      };

      expectPasswordEditable([], systemAdmin);
      expectPasswordEditable([], managerAll);
      expectPasswordEditable([], librarianAll, false);
      expectPasswordEditable([], nyplManager);
      expectPasswordEditable([], nyplLibrarian, false);
      expectPasswordEditable([], nyplManagerLibrarianAll);

      expectPasswordEditable(systemAdmin, systemAdmin);
      expectPasswordEditable(systemAdmin, managerAll, false);
      expectPasswordEditable(systemAdmin, librarianAll, false);
      expectPasswordEditable(systemAdmin, nyplManager, false);
      expectPasswordEditable(systemAdmin, nyplLibrarian, false);
      expectPasswordEditable(systemAdmin, nyplManagerLibrarianAll, false);

      expectPasswordEditable(managerAll, systemAdmin);
      expectPasswordEditable(managerAll, managerAll);
      expectPasswordEditable(managerAll, librarianAll, false);
      expectPasswordEditable(managerAll, nyplManager, false);
      expectPasswordEditable(managerAll, nyplLibrarian, false);
      expectPasswordEditable(managerAll, nyplManagerLibrarianAll, false);

      expectPasswordEditable(librarianAll, systemAdmin);
      expectPasswordEditable(librarianAll, managerAll);
      expectPasswordEditable(librarianAll, librarianAll, false);
      expectPasswordEditable(librarianAll, nyplManager, false);
      expectPasswordEditable(librarianAll, nyplLibrarian, false);
      expectPasswordEditable(librarianAll, nyplManagerLibrarianAll, false);

      expectPasswordEditable(nyplManager, systemAdmin);
      expectPasswordEditable(nyplManager, managerAll);
      expectPasswordEditable(nyplManager, librarianAll, false);
      expectPasswordEditable(nyplManager, nyplManager);
      expectPasswordEditable(nyplManager, nyplLibrarian, false);
      expectPasswordEditable(nyplManager, nyplManagerLibrarianAll);

      expectPasswordEditable(bplManager, systemAdmin);
      expectPasswordEditable(bplManager, managerAll);
      expectPasswordEditable(bplManager, librarianAll, false);
      expectPasswordEditable(bplManager, nyplManager, false);
      expectPasswordEditable(bplManager, nyplLibrarian, false);
      expectPasswordEditable(bplManager, nyplManagerLibrarianAll, false);

      expectPasswordEditable(bothManager, systemAdmin);
      expectPasswordEditable(bothManager, managerAll);
      expectPasswordEditable(bothManager, librarianAll, false);
      expectPasswordEditable(bothManager, nyplManager);
      expectPasswordEditable(bothManager, nyplLibrarian, false);
      expectPasswordEditable(bothManager, nyplManagerLibrarianAll);

      expectPasswordEditable(nyplLibrarian, systemAdmin);
      expectPasswordEditable(nyplLibrarian, managerAll);
      expectPasswordEditable(nyplLibrarian, librarianAll, false);
      expectPasswordEditable(nyplLibrarian, nyplManager);
      expectPasswordEditable(nyplLibrarian, nyplLibrarian, false);
      expectPasswordEditable(nyplLibrarian, nyplManagerLibrarianAll);

      expectPasswordEditable(bplLibrarian, systemAdmin);
      expectPasswordEditable(bplLibrarian, managerAll);
      expectPasswordEditable(bplLibrarian, librarianAll, false);
      expectPasswordEditable(bplLibrarian, nyplManager, false);
      expectPasswordEditable(bplLibrarian, nyplLibrarian, false);
      expectPasswordEditable(bplLibrarian, nyplManagerLibrarianAll, false);

      expectPasswordEditable(nyplManagerLibrarianAll, systemAdmin);
      expectPasswordEditable(nyplManagerLibrarianAll, managerAll);
      expectPasswordEditable(nyplManagerLibrarianAll, librarianAll, false);
      expectPasswordEditable(nyplManagerLibrarianAll, nyplManager);
      expectPasswordEditable(nyplManagerLibrarianAll, nyplLibrarian, false);
      expectPasswordEditable(nyplManagerLibrarianAll, nyplManagerLibrarianAll);
    });

    it("has a save button if a save function is supplied", () => {
      const saveButton = wrapper.find(Button);
      expect(saveButton.length).to.equal(1);
    });

    it("does not have a save button if no save function is supplied", () => {
      wrapper.setProps({ save: undefined });
      const saveButton = wrapper.find(Button);
      expect(saveButton.length).to.equal(0);
    });

    describe("roles", () => {
      const expectRole = (
        startingRoles,
        role,
        shouldBeChecked: boolean,
        shouldBeEnabled: boolean = true
      ) => {
        const adminDataWithRoles = Object.assign({}, adminData, {
          roles: startingRoles,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        const input = editableInputByName(role);
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
        for (const role of [
          "system",
          "manager-all",
          "librarian-all",
          "manager-nypl",
          "librarian-nypl",
        ]) {
          const input = editableInputByName(role);
          expect(input.length).to.equal(0);
        }
      });
    });

    it("requires the correct fields", () => {
      // Both the email and password fields are required.
      const required = wrapper.find(".required-field");
      expect(required.length).to.equal(2);
      expect(wrapper.html()).not.to.contain("(Optional)");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
      wrapper = mount(
        <IndividualAdminEditForm
          data={{ individualAdmins: [adminData], allLibraries }}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="admins"
        />,
        { context: { admin: new Admin(systemAdmin) } }
      );
    });

    describe("roles", () => {
      let input;
      let adminDataWithRoles;
      const allRoles = [
        "system",
        "manager-all",
        "librarian-all",
        "manager-nypl",
        "manager-bpl",
        "librarian-nypl",
        "librarian-bpl",
      ];
      const expectRoles = (expected) => {
        for (const role of allRoles) {
          const shouldBeChecked = expected.includes(role);
          expect(editableInputByName(role).props().checked).to.equal(
            shouldBeChecked
          );
        }
      };

      it("changes system admin role", () => {
        adminDataWithRoles = Object.assign({}, adminData, {
          roles: nyplManagerLibrarianAll,
        });
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
        expectRoles([
          "manager-all",
          "librarian-all",
          "manager-nypl",
          "manager-bpl",
          "librarian-nypl",
          "librarian-bpl",
        ]);

        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: systemAdmin,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: nyplManagerLibrarianAll,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles([
          "manager-all",
          "librarian-all",
          "manager-nypl",
          "manager-bpl",
          "librarian-nypl",
          "librarian-bpl",
        ]);
      });

      it("changes librarian all role", () => {
        input = editableInputByName("librarian-all");
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

        input.find("input").simulate("change");
        expectRoles([]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: systemAdmin,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles([]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: nyplManagerLibrarianAll,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-nypl", "librarian-nypl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: nyplLibrarian,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);
      });

      it("changes manager role for each library", () => {
        const role = "manager-nypl";
        input = editableInputByName(role);
        input.find("input").simulate("change");
        expectRoles(["manager-nypl", "librarian-nypl"]);

        input.find("input").simulate("change");
        expectRoles(["librarian-nypl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: systemAdmin,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles([
          "librarian-all",
          "manager-bpl",
          "librarian-nypl",
          "librarian-bpl",
        ]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: managerAll,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles([
          "librarian-all",
          "manager-bpl",
          "librarian-nypl",
          "librarian-bpl",
        ]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: nyplManagerLibrarianAll,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-all", "librarian-nypl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: nyplLibrarian,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-nypl", "librarian-nypl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: bplLibrarian,
        });
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

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: systemAdmin,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-bpl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: managerAll,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["manager-bpl", "librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: nyplManagerLibrarianAll,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-bpl"]);

        adminDataWithRoles = Object.assign({}, adminData, {
          roles: bplLibrarian,
        });
        wrapper.setProps({ item: adminDataWithRoles });
        input.find("input").simulate("change");
        expectRoles(["librarian-nypl", "librarian-bpl"]);
      });
    });

    it("calls save when the save button is clicked", () => {
      const saveButton = wrapper.find(Button);
      saveButton.simulate("click");
      expect(save.callCount).to.equal(1);
    });

    it("calls save when the form is submitted directly", () => {
      wrapper.find(Form).props().onSubmit();
      expect(save.callCount).to.equal(1);
    });

    const fillOutFormFields = () => {
      // Filling out the form is the preliminary step for the next 5 tests;
      // might as well write it out just once!

      const emailInput = wrapper.find("input[name='email']");
      const emailInputElement = emailInput.getDOMNode();
      emailInputElement.value = "newEmail";
      emailInput.simulate("change");

      const pwInput = wrapper.find("input[name='password']");
      const pwInputElement = pwInput.getDOMNode();
      pwInputElement.value = "newPassword";
      pwInput.simulate("change");
    };

    it("calls handleData", () => {
      const handleData = spy(wrapper.instance(), "handleData");
      fillOutFormFields();

      wrapper.find(Form).find(Button).simulate("click");

      expect(handleData.args[0][0].get("email")).to.equal("newEmail");
      expect(handleData.args[0][0].get("password")).to.equal("newPassword");
      expect(handleData.callCount).to.equal(1);
      handleData.restore();
    });

    it("submits data", () => {
      fillOutFormFields();
      const librarianAllInput = editableInputByName("librarian-all");
      librarianAllInput.find("input").simulate("change");
      const managerNyplInput = editableInputByName("manager-nypl");
      managerNyplInput.find("input").simulate("change");

      const saveButton = wrapper.find(Button);
      saveButton.simulate("click");

      const formData = save.args[0][0];
      expect(formData.get("email")).to.equal("newEmail");
      expect(formData.get("password")).to.equal("newPassword");
      expect(formData.get("roles")).to.equal(
        JSON.stringify([
          { role: "librarian-all" },
          { role: "manager", library: "nypl" },
        ])
      );
      expect(save.callCount).to.equal(1);
    });

    it("clears the form", () => {
      fillOutFormFields();
      let emailInput = wrapper.find("input[name='email']");
      expect(emailInput.props().value).to.contain("newEmail");

      const newProps = { responseBody: "new admin", ...wrapper.props() };
      wrapper.setProps(newProps);

      emailInput = wrapper.find("input[name='email']");
      expect(emailInput.props().value).not.to.contain("newEmail");
    });

    it("doesn't clear the form if there's an error message", () => {
      fillOutFormFields();
      const emailInput = wrapper.find("input[name='email']");
      expect(emailInput.props().value).to.contain("newEmail");

      const newProps = { fetchError: "ERROR", ...wrapper.props() };
      wrapper.setProps(newProps);

      expect(emailInput.props().value).to.contain("newEmail");
    });

    it("submits system admin when setting up", () => {
      wrapper.setContext({ settingUp: true });
      fillOutFormFields();

      const saveButton = wrapper.find(Button);
      saveButton.simulate("click");

      expect(save.callCount).to.equal(1);
      const formData = save.args[0][0];
      expect(formData.get("email")).to.equal("newEmail");
      expect(formData.get("password")).to.equal("newPassword");
      expect(formData.get("roles")).to.equal(
        JSON.stringify([{ role: "system" }])
      );
    });
  });
});

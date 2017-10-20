import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import IndividualAdminEditForm from "../IndividualAdminEditForm";
import EditableInput from "../EditableInput";

describe("IndividualAdminEditForm", () => {
  let wrapper;
  let editIndividualAdmin;
  let adminData = {
    email: "test@nypl.org",
    password: "password"
  };

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
          data={{ individualAdmins: [adminData] }}
          disabled={false}
          editItem={editIndividualAdmin}
          urlBase="url base"
          listDataKey="admins"
          />
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
  });

  describe("behavior", () => {
    beforeEach(() => {
      editIndividualAdmin = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <IndividualAdminEditForm
          data={{ individualAdmins: [adminData] }}
          disabled={false}
          editItem={editIndividualAdmin}
          urlBase="url base"
          listDataKey="admins"
          />
      );
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

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editIndividualAdmin.callCount).to.equal(1);
      let formData = editIndividualAdmin.args[0][0];
      expect(formData.get("email")).to.equal("newEmail");
      expect(formData.get("password")).to.equal("newPassword");

      wrapper.setProps({ editedIdentifier: "newEmail" });
      // Let the call stack clear so the callback after editItem will run.
      const pause = (): Promise<void> => {
          return new Promise<void>(resolve => setTimeout(resolve, 0));
      };
      await pause();
      expect(window.location.href).to.contain("edit");
      expect(window.location.href).to.contain("newEmail");
    });
  });
});
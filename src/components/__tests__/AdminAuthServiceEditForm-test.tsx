import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import AdminAuthServiceEditForm from "../AdminAuthServiceEditForm";
import EditableInput from "../EditableInput";

describe("AdminAuthServiceEditForm", () => {
  let wrapper;
  let editAdminAuthService;
  let adminAuthServiceData = {
    name: "name",
    provider: "OAuth provider",
    url: "url",
    username: "user",
    password: "pass",
    domains: ["nypl.org"]
  };
  let providersData = ["OAuth provider", "some other provider"];

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      editAdminAuthService = stub();
      wrapper = shallow(
        <AdminAuthServiceEditForm
          csrfToken="token"
          disabled={false}
          providers={providersData}
          editAdminAuthService={editAdminAuthService}
          />
      );
    });

    it("renders hidden csrf token", () => {
      let input = wrapper.find("input[name=\"csrf_token\"]");
      expect(input.props().value).to.equal("token");
    });

    it("renders name", () => {
      let input = editableInputByName("name");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().readOnly).to.equal(false);

      wrapper.setProps({ adminAuthService: adminAuthServiceData });
      input = editableInputByName("name");
      expect(input.props().value).to.equal("name");
      expect(input.props().readOnly).to.equal(true);
    });

    it("renders provider", () => {
      let input = editableInputByName("provider");
      // starts with first provider in list
      expect(input.props().value).to.equal("OAuth provider");
      expect(input.props().readOnly).to.equal(false);
      let children = input.find("option");
      expect(children.length).to.equal(2);
      expect(children.at(0).text()).to.contain("OAuth provider");
      expect(children.at(1).text()).to.contain("some other provider");

      wrapper = shallow(
        <AdminAuthServiceEditForm
          csrfToken="token"
          disabled={false}
          providers={providersData}
          editAdminAuthService={editAdminAuthService}
          adminAuthService={adminAuthServiceData}
          />
      );
      input = editableInputByName("provider");
      expect(input.props().value).to.equal("OAuth provider");
      expect(input.props().readOnly).to.equal(true);
    });

    it("renders url", () => {
      let input = editableInputByName("url");
      // There's a default url.
      expect(input.props().value).to.be.ok;
      expect(input.props().value).to.equal("https://accounts.google.com/o/oauth2/auth");

      wrapper.setProps({ adminAuthService: adminAuthServiceData });
      input = editableInputByName("url");
      expect(input.props().value).to.equal("url");
    });

    it("renders username", () => {
      let input = editableInputByName("username");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ adminAuthService: adminAuthServiceData });
      input = editableInputByName("username");
      expect(input.props().value).to.equal("user");
    });

    it("renders password", () => {
      let input = editableInputByName("password");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ adminAuthService: adminAuthServiceData });
      input = editableInputByName("password");
      expect(input.props().value).to.equal("pass");
    });

    it("renders allowed domains", () => {
      let domain = wrapper.find(".admin-auth-service-domain");
      expect(domain.length).to.equal(0);

      wrapper = shallow(
        <AdminAuthServiceEditForm
          csrfToken="token"
          disabled={false}
          providers={providersData}
          editAdminAuthService={editAdminAuthService}
          adminAuthService={adminAuthServiceData}
          />
      );
      domain = wrapper.find(".admin-auth-service-domain");
      expect(domain.length).to.equal(1);
      expect(domain.text()).to.contain("nypl.org");
      expect(domain.text()).to.contain("remove");
    });

    it("renders domain add input", () => {
      let input = wrapper.find("input[name='add-domain']");
      expect(input.props().label).to.equal("Add an allowed domain");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editAdminAuthService = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <AdminAuthServiceEditForm
          csrfToken="token"
          disabled={false}
          providers={providersData}
          editAdminAuthService={editAdminAuthService}
          />
      );
    });

    it("adds a domain", () => {
      let domain = wrapper.find(".admin-auth-service-domain");
      expect(domain.length).to.equal(0);

      let input = wrapper.find("input[name='add-domain']") as any;
      let inputElement = input.get(0);
      inputElement.value = "gmail.com";

      let addButton = wrapper.find("button.add-domain");
      addButton.simulate("click");

      domain = wrapper.find(".admin-auth-service-domain");
      expect(domain.length).to.equal(1);
      expect(domain.text()).to.contain("gmail.com");
      expect(domain.text()).to.contain("remove");
    });

    it("removes a library", () => {
      wrapper = shallow(
        <AdminAuthServiceEditForm
          csrfToken="token"
          disabled={false}
          providers={providersData}
          editAdminAuthService={editAdminAuthService}
          adminAuthService={adminAuthServiceData}
          />
      );
      let domain = wrapper.find(".admin-auth-service-domain");
      expect(domain.length).to.equal(1);
      expect(domain.text()).to.contain("nypl.org");

      let removeButton = domain.find("i");
      removeButton.simulate("click");

      domain = wrapper.find(".admin-auth-service-domain");
      expect(domain.length).to.equal(0);
    });

    it("submits data", () => {
      wrapper.setProps({ adminAuthService: adminAuthServiceData });

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editAdminAuthService.callCount).to.equal(1);
      let formData = editAdminAuthService.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("name")).to.equal("name");
      expect(formData.get("provider")).to.equal("OAuth provider");
      expect(formData.get("url")).to.equal("url");
      expect(formData.get("username")).to.equal("user");
      expect(formData.get("password")).to.equal("pass");
      expect(formData.get("domains")).to.equal(JSON.stringify(["nypl.org"]));
    });

    it("goes to admin auth service edit page after creating a new admin auth service", () => {
      let input = wrapper.find("input[name='name']");
      let inputElement = input.get(0);
      inputElement.value = "newName";
      input.simulate("change");

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editAdminAuthService.callCount).to.equal(1);
      let formData = editAdminAuthService.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("name")).to.equal("newName");
    });
  });
});
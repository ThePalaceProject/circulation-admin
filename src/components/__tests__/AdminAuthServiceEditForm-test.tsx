import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import AdminAuthServiceEditForm from "../AdminAuthServiceEditForm";
import EditableInput from "../EditableInput";

describe("AdminAuthServiceEditForm", () => {
  let wrapper;
  let editAdminAuthService;
  let oauthServiceData = {
    provider: "Google OAuth",
    url: "url",
    username: "user",
    password: "pass",
    domains: ["nypl.org"]
  };
  let providersData = ["Google OAuth", "Other Provider"];
  let data;

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      data = {
        admin_auth_services: [oauthServiceData],
        providers: providersData
      };
      editAdminAuthService = stub();
      wrapper = shallow(
        <AdminAuthServiceEditForm
          data={data}
          csrfToken="token"
          disabled={false}
          editItem={editAdminAuthService}
          />
      );
    });

    it("renders hidden csrf token", () => {
      let input = wrapper.find("input[name=\"csrf_token\"]");
      expect(input.props().value).to.equal("token");
    });

    it("renders provider", () => {
      let input = editableInputByName("provider");
      // starts with first provider in list
      expect(input.props().value).to.equal("Google OAuth");
      expect(input.props().readOnly).to.equal(false);
      let children = input.find("option");
      expect(children.length).to.equal(2);
      expect(children.at(0).text()).to.contain("Google OAuth");
      expect(children.at(1).text()).to.contain("Other Provider");

      wrapper = shallow(
        <AdminAuthServiceEditForm
          data={data}
          csrfToken="token"
          disabled={false}
          editItem={editAdminAuthService}
          item={oauthServiceData}
          />
      );
      input = editableInputByName("provider");
      expect(input.props().value).to.equal("Google OAuth");
      expect(input.props().readOnly).to.equal(true);
    });

    describe("with google oauth provider", () => {
      beforeEach(() => {
        data = {
          admin_auth_services: [oauthServiceData],
          providers: ["Google OAuth"]
        };
        wrapper = shallow(
          <AdminAuthServiceEditForm
            data={data}
            csrfToken="token"
            disabled={false}
            editItem={editAdminAuthService}
            />
        );
      });

      it("renders url", () => {
        let input = editableInputByName("url");
        // There's a default url.
        expect(input.props().value).to.be.ok;
        expect(input.props().value).to.equal("https://accounts.google.com/o/oauth2/auth");

        wrapper.setProps({ item: oauthServiceData });
        input = editableInputByName("url");
        expect(input.props().value).to.equal("url");
      });

      it("renders username", () => {
        let input = editableInputByName("username");
        expect(input.props().value).not.to.be.ok;

        wrapper.setProps({ item: oauthServiceData });
        input = editableInputByName("username");
        expect(input.props().value).to.equal("user");
      });

      it("renders password", () => {
        let input = editableInputByName("password");
        expect(input.props().value).not.to.be.ok;

        wrapper.setProps({ item: oauthServiceData });
        input = editableInputByName("password");
        expect(input.props().value).to.equal("pass");
      });

      it("renders allowed domains", () => {
        let domain = wrapper.find(".admin-auth-service-domain");
        expect(domain.length).to.equal(0);

        wrapper = shallow(
          <AdminAuthServiceEditForm
            data={data}
            csrfToken="token"
            disabled={false}
            editItem={editAdminAuthService}
            item={oauthServiceData}
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
  });

  describe("behavior", () => {
    beforeEach(() => {
      editAdminAuthService = stub().returns(new Promise<void>(resolve => resolve()));
    });

    describe("with google oauth provider", () => {
      beforeEach(() => {
        data = {
          admin_auth_services: [oauthServiceData],
          providers: ["Google OAuth"]
        };
        wrapper = mount(
          <AdminAuthServiceEditForm
            data={data}
            csrfToken="token"
            disabled={false}
            editItem={editAdminAuthService}
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

      it("removes a domain", () => {
        wrapper = shallow(
          <AdminAuthServiceEditForm
            data={data}
            csrfToken="token"
            disabled={false}
            editItem={editAdminAuthService}
            item={oauthServiceData}
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
        wrapper.setProps({ item: oauthServiceData });

        let form = wrapper.find("form");
        form.simulate("submit");

        expect(editAdminAuthService.callCount).to.equal(1);
        let formData = editAdminAuthService.args[0][0];
        expect(formData.get("csrf_token")).to.equal("token");
        expect(formData.get("provider")).to.equal("Google OAuth");
        expect(formData.get("url")).to.equal("url");
        expect(formData.get("username")).to.equal("user");
        expect(formData.get("password")).to.equal("pass");
        expect(formData.get("domains")).to.equal(JSON.stringify(["nypl.org"]));
      });
    });
  });
});
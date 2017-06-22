import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import AdminAuthServiceEditForm from "../AdminAuthServiceEditForm";
import EditableInput from "../EditableInput";
import ProtocolFormField from "../ProtocolFormField";

describe("AdminAuthServiceEditForm", () => {
  let wrapper;
  let editAdminAuthService;
  let oauthServiceData = {
    protocol: "Google OAuth",
    url: "url",
    username: "user",
    password: "pass",
    domains: ["nypl.org"]
  };
  let protocolsData = [
    { name: "Google OAuth", label: "Google OAuth",
      settings: [
        { key: "url", label: "URL", default: "http://default" },
        { key: "username", label: "Client ID" },
        { key: "password", label: "Client Secret" },
        { key: "domains", label: "Allowed Domains", type: "list" }
      ]
    },
    { "name": "Other Provider", "label": "Other Provider",
      "settings": [
        { key: "setting", label: "Setting" }
      ]
    }
  ];
  let data;

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  let protocolFormFieldByKey = (key) => {
    let formFields = wrapper.find(ProtocolFormField);
    if (formFields.length >= 1) {
      return formFields.filterWhere(formField => formField.props().setting.key === key);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      data = {
        admin_auth_services: [oauthServiceData],
        protocols: protocolsData
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

    it("renders protocol", () => {
      let input = editableInputByName("protocol");
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
      input = editableInputByName("protocol");
      expect(input.props().value).to.equal("Google OAuth");
      expect(input.props().readOnly).to.equal(true);
    });

    it("renders url", () => {
      let input = protocolFormFieldByKey("url");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: oauthServiceData });
      input = protocolFormFieldByKey("url");
      expect(input.props().value).to.equal("url");
    });

    it("renders username", () => {
      let input = protocolFormFieldByKey("username");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: oauthServiceData });
      input = protocolFormFieldByKey("username");
      expect(input.props().value).to.equal("user");
    });

    it("renders password", () => {
      let input = protocolFormFieldByKey("password");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: oauthServiceData });
      input = protocolFormFieldByKey("password");
      expect(input.props().value).to.equal("pass");
    });

    it("renders allowed domains", () => {
      let domains = protocolFormFieldByKey("domains");
      expect(domains.props().value).not.to.be.ok;

      wrapper = shallow(
        <AdminAuthServiceEditForm
          data={data}
          csrfToken="token"
          disabled={false}
          editItem={editAdminAuthService}
          item={oauthServiceData}
          />
      );
      domains = protocolFormFieldByKey("domains");
      expect(domains.props().value).to.deep.equal(["nypl.org"]);
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editAdminAuthService = stub().returns(new Promise<void>(resolve => resolve()));
      data = {
        admin_auth_services: [oauthServiceData],
        protocols: protocolsData
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

    it("changes fields when protocol changes", () => {
      let urlField = protocolFormFieldByKey("url");
      let usernameField = protocolFormFieldByKey("username");
      let passwordField = protocolFormFieldByKey("password");
      let domainsField = protocolFormFieldByKey("domains");
      let settingField = protocolFormFieldByKey("setting");
      expect(urlField.length).to.equal(1);
      expect(usernameField.length).to.equal(1);
      expect(passwordField.length).to.equal(1);
      expect(domainsField.length).to.equal(1);
      expect(settingField.length).to.equal(0);

      let select = wrapper.find("select[name='protocol']") as any;
      let selectElement = select.get(0);
      selectElement.value = "Other Provider";
      select.simulate("change");

      urlField = protocolFormFieldByKey("url");
      usernameField = protocolFormFieldByKey("username");
      passwordField = protocolFormFieldByKey("password");
      domainsField = protocolFormFieldByKey("domains");
      settingField = protocolFormFieldByKey("setting");
      expect(urlField.length).to.equal(0);
      expect(usernameField.length).to.equal(0);
      expect(passwordField.length).to.equal(0);
      expect(domainsField.length).to.equal(0);
      expect(settingField.length).to.equal(1);

      selectElement.value = "Google OAuth";
      select.simulate("change");

      urlField = protocolFormFieldByKey("url");
      usernameField = protocolFormFieldByKey("username");
      passwordField = protocolFormFieldByKey("password");
      domainsField = protocolFormFieldByKey("domains");
      settingField = protocolFormFieldByKey("setting");
      expect(urlField.length).to.equal(1);
      expect(usernameField.length).to.equal(1);
      expect(passwordField.length).to.equal(1);
      expect(domainsField.length).to.equal(1);
      expect(settingField.length).to.equal(0);
    });

    it("submits data", () => {
      wrapper = mount(
        <AdminAuthServiceEditForm
          data={data}
          csrfToken="token"
          disabled={false}
          editItem={editAdminAuthService}
          item={oauthServiceData}
          />
      );

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editAdminAuthService.callCount).to.equal(1);
      let formData = editAdminAuthService.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("protocol")).to.equal("Google OAuth");
      expect(formData.get("url")).to.equal("url");
      expect(formData.get("username")).to.equal("user");
      expect(formData.get("password")).to.equal("pass");
      expect(formData.getAll("domains")).to.contain("nypl.org");
    });
  });
});
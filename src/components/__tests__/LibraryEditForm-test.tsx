import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import LibraryEditForm from "../LibraryEditForm";
import EditableInput from "../EditableInput";
import ProtocolFormField from "../ProtocolFormField";

describe("LibraryEditForm", () => {
  let wrapper;
  let editLibrary;
  let libraryData = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    library_registry_short_name: "registry name",
    settings: {
      "privacy-policy": "http://privacy",
      "copyright": "http://copyright"
    }
  };
  let settingFields = [
    { key: "privacy-policy", label: "Privacy Policy" },
    { key: "copyright", label: "Copyright" }
  ];

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
      editLibrary = stub();
      wrapper = shallow(
        <LibraryEditForm
          data={{ libraries: [libraryData], settings: settingFields }}
          csrfToken="token"
          disabled={false}
          editItem={editLibrary}
          urlBase={"url base"}
          />
      );
    });

    it("renders hidden csrf token", () => {
      let input = wrapper.find("input[name=\"csrf_token\"]");
      expect(input.props().value).to.equal("token");
    });

    it("renders hidden uuid", () => {
      let input = wrapper.find("input[name=\"uuid\"]");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = wrapper.find("input[name=\"uuid\"]");
      expect(input.props().value).to.equal("uuid");
    });

    it("renders name", () => {
      let input = editableInputByName("name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = editableInputByName("name");
      expect(input.props().value).to.equal("name");
    });

    it("renders short name", () => {
      let input = editableInputByName("short_name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = editableInputByName("short_name");
      expect(input.props().value).to.equal("short_name");
    });

    it("renders registry short name", () => {
      let input = editableInputByName("library_registry_short_name");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = editableInputByName("library_registry_short_name");
      expect(input.props().value).to.equal("registry name");
    });

    it("renders random registry shared secret checkbox", () => {
      let input = editableInputByName("random_library_registry_shared_secret");
      expect(input.props().label).to.contain("random");
      expect(input.props().type).to.equal("checkbox");

      // it's still there if there's a library but no shared secret
      wrapper.setProps({ item: libraryData });
      input = editableInputByName("random_library_registry_shared_secret");
      expect(input.props().label).to.contain("random");
      expect(input.props().type).to.equal("checkbox");

      // but it's gone if there's a library with a secret
      libraryData = Object.assign({}, libraryData, {
        library_registry_shared_secret: "secret"
      });
      wrapper.setProps({ item: libraryData });
      input = editableInputByName("random_library_registry_shared_secret");
      expect(input.length).to.equal(0);
    });

    it("renders registry shared secret", () => {
      let input = editableInputByName("library_registry_shared_secret");
      expect(input.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      input = editableInputByName("library_registry_shared_secret");
      expect(input.props().value).to.equal("secret");
    });

    it("renders settings", () => {
      let privacyInput = protocolFormFieldByKey("privacy-policy");
      expect(privacyInput.props().setting).to.equal(settingFields[0]);
      expect(privacyInput.props().value).not.to.be.ok;
      let copyrightInput = protocolFormFieldByKey("copyright");
      expect(copyrightInput.props().setting).to.equal(settingFields[1]);
      expect(copyrightInput.props().value).not.to.be.ok;

      wrapper.setProps({ item: libraryData });
      privacyInput = protocolFormFieldByKey("privacy-policy");
      expect(privacyInput.props().value).to.equal("http://privacy");
      copyrightInput = protocolFormFieldByKey("copyright");
      expect(copyrightInput.props().value).to.equal("http://copyright");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editLibrary = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <LibraryEditForm
          data={{ libraries: [libraryData], settings: settingFields }}
          csrfToken="token"
          disabled={false}
          editItem={editLibrary}
          urlBase={"url base"}
          />
      );
    });

    it("shows and hides secret field when random secret is selected/unselected", () => {
      let randomSecret = editableInputByName("random_library_registry_shared_secret");
      let secret = editableInputByName("library_registry_shared_secret");
      expect(secret.length).to.equal(1);

      randomSecret.find("input").simulate("change");
      secret = editableInputByName("library_registry_shared_secret");
      expect(secret.length).to.equal(0);

      randomSecret.find("input").simulate("change");
      secret = editableInputByName("library_registry_shared_secret");
      expect(secret.length).to.equal(1);
    });

    it("submits data", () => {
      wrapper.setProps({ item: libraryData });

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editLibrary.callCount).to.equal(1);
      let formData = editLibrary.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("uuid")).to.equal("uuid");
      expect(formData.get("name")).to.equal("name");
      expect(formData.get("short_name")).to.equal("short_name");
      expect(formData.get("library_registry_short_name")).to.equal("registry name");
      expect(formData.get("privacy-policy")).to.equal("http://privacy");
      expect(formData.get("copyright")).to.equal("http://copyright");
    });
  });
});
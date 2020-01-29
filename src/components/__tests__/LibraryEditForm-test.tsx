import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import LibraryEditForm from "../LibraryEditForm";
import EditableInput from "../EditableInput";
import { Panel, Button, Form } from "library-simplified-reusable-components";
import ProtocolFormField from "../ProtocolFormField";

describe("LibraryEditForm", () => {
  let wrapper;
  let save;
  let libraryData = {
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    settings: {
      "privacy-policy": "http://privacy",
      "copyright": "http://copyright",
      "featured_lane_size": "20"
    }
  };
  let settingFields = [
    { key: "privacy-policy", label: "Privacy Policy", category: "Links" },
    { key: "copyright", label: "Copyright", category: "Links" },
    { key: "logo", label: "Logo", category: "Client Interface Customization" },
    { key: "large_collection_languages", label: "Languages", category: "Languages" },
    { key: "featured_lane_size", label: "Maximum number of books in the 'featured' lanes", category: "Lanes & Filters", type: "number"},
    { key: "service_area", label: "Service Area", category: "Geographic Areas", type: "list" }
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

  let collapsibleByName = (name: string) => {
    let collapsibles = wrapper.find(Panel);
    if (collapsibles.length >= 1) {
      return collapsibles.filterWhere(collapsible => collapsible.find(".panel-heading").text().startsWith(name));
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      save = stub();
      wrapper = mount(
        <LibraryEditForm
          data={{ libraries: [libraryData], settings: settingFields }}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="libraries"
        />
      );
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

    it("subdivides fields", () => {
      let collapsible = wrapper.find(".panel");
      expect(collapsible.length).to.equal(6);

      let basic = collapsible.at(0).find(".panel-heading");
      expect(basic.text()).to.contain("Basic Information");

      let other = collapsible.slice(1, collapsible.length);
      other.map((form) => {
        let title = form.find(".panel-heading").text();
        expect(title).to.contain("(Optional)");
      });

      expect(collapsibleByName("Links").find(ProtocolFormField).length).to.equal(2);
      expect(collapsibleByName("Languages").find(ProtocolFormField).length).to.equal(1);
      expect(collapsibleByName("Client Interface Customization").find(ProtocolFormField).length).to.equal(1);

      let geographic = collapsibleByName("Geographic Areas");
      expect(geographic.find(ProtocolFormField).length).to.equal(1);
      let addListItems = geographic.find(".add-list-item").hostNodes();
      expect(addListItems.length).to.equal(2);
      expect(addListItems.at(0).type()).to.equal("span");
      expect(addListItems.at(1).type()).to.equal("button");
    });

    it("has a save button", () => {
      let form = wrapper.find(Form);
      let saveButton = form.find(Button).at(1);
      expect(saveButton.text()).to.equal("Submit");
      expect(form.prop("onSubmit")).to.equal(wrapper.instance().submit);
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <LibraryEditForm
          data={{ libraries: [libraryData], settings: settingFields }}
          disabled={false}
          save={save}
          urlBase="url base"
          listDataKey="libraries"
        />
      );
    });

    it("calls save when the save button is clicked", () => {
      let saveButton = wrapper.find(Button).at(1);
      saveButton.simulate("click");
      expect(save.callCount).to.equal(1);
    });

    it("calls save when the form is submitted directly", () => {
      wrapper.find(Form).prop("onSubmit")();
      expect(save.callCount).to.equal(1);
    });

    it("submits data", () => {
      wrapper.setProps({ item: libraryData });

      let saveButton = wrapper.find(Button).at(1);
      saveButton.simulate("click");

      expect(save.callCount).to.equal(1);
      let formData = save.args[0][0];
      expect(formData.get("uuid")).to.equal("uuid");
      expect(formData.get("name")).to.equal("name");
      expect(formData.get("short_name")).to.equal("short_name");
      expect(formData.get("privacy-policy")).to.equal("http://privacy");
      expect(formData.get("copyright")).to.equal("http://copyright");
    });

    let fillOutFormFields = () => {
      let nameInput = wrapper.find("input[name='name']");
      let nameInputElement = nameInput.getDOMNode();
      nameInputElement.value = "new name";
      nameInput.simulate("change");
    };

    it("submits data from the FiltersForm", () => {
      wrapper.setProps({ item: libraryData });
      let saveButton = wrapper.find(Button).at(1);
      saveButton.simulate("click");
      expect(save.callCount).to.equal(1);
      let formData = save.args[0][0];
      expect(formData.get("featured_lane_size")).to.equal("20");
    });

    it("clears the form", () => {
      fillOutFormFields();
      let nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new name");

      wrapper.simulate("submit");
      let newProps = { responseBody: "new library", ...wrapper.props() };
      wrapper.setProps(newProps);

      nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("");
    });

    it("doesn't clear the form if there's an error message", () => {
      fillOutFormFields();
      let nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new name");

      wrapper.simulate("submit");
      let newProps = { fetchError: "ERROR", ...wrapper.props() };
      wrapper.setProps(newProps);

      nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new name");
    });

  });
});

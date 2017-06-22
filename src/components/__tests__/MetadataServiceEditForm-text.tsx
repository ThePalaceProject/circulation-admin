import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import MetadataServiceEditForm from "../MetadataServiceEditForm";
import EditableInput from "../EditableInput";
import ProtocolFormField from "../ProtocolFormField";

describe("MetadataServiceEditForm", () => {
  let wrapper;
  let editMetadataService;
  let metadataServiceData = {
    id: 2,
    protocol: "protocol 1",
    settings: {
      text_setting: "text setting"
    },
    libraries: [{ short_name: "nypl" }],
  };
  let protocolsData = [
    {
      name: "protocol 1",
      label: "protocol 1 label",
      settings: [
        { key: "text_setting", label: "text label" }
      ],
      sitewide: true
    },
    {
      name: "protocol 2",
      label: "protocol 2 label",
      settings: [
        { key: "text_setting", label: "text label" },
        { key: "protocol2_setting", label: "protocol2 label" },
      ],
      sitewide: false
    }
  ];
  let allLibraries = [
    { "short_name": "nypl" },
    { "short_name": "bpl" }
  ];
  let metadataServicesData = {
    metadata_services: [metadataServiceData],
    protocols: protocolsData,
    allLibraries: allLibraries
  };

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
      editMetadataService = stub();
      wrapper = shallow(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={metadataServicesData}
          editItem={editMetadataService}
          />
      );
    });

    it("renders hidden csrf token", () => {
      let input = wrapper.find("input[name=\"csrf_token\"]");
      expect(input.props().value).to.equal("token");
    });

    it("renders hidden id", () => {
      let input = wrapper.find("input[name=\"id\"]");
      expect(input.length).to.equal(0);

      wrapper.setProps({ item: metadataServiceData });
      input = wrapper.find("input[name=\"id\"]");
      expect(input.props().type).to.equal("hidden");
      expect(input.props().value).to.equal("2");
    });

    it("renders protocol", () => {
      let input = editableInputByName("protocol");
      // starts with first protocol in list
      expect(input.props().value).to.equal("protocol 1");
      expect(input.props().readOnly).to.equal(false);
      let children = input.find("option");
      expect(children.length).to.equal(2);
      expect(children.at(0).text()).to.contain("protocol 1 label");
      expect(children.at(1).text()).to.contain("protocol 2 label");

      wrapper = shallow(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={metadataServicesData}
          editItem={editMetadataService}
          item={metadataServiceData}
          />
      );
      input = editableInputByName("protocol");
      expect(input.props().value).to.equal("protocol 1");
      expect(input.props().readOnly).to.equal(true);
      children = input.find("option");
      expect(children.length).to.equal(1);
      expect(children.text()).to.contain("protocol 1 label");
    });

    it("renders protocol fields", () => {
      let input = protocolFormFieldByKey("text_setting");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().setting).to.equal(protocolsData[0].settings[0]);

      input = protocolFormFieldByKey("protocol2_setting");
      expect(input.length).to.equal(0);

      wrapper = shallow(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={metadataServicesData}
          editItem={editMetadataService}
          item={metadataServiceData}
          />
      );

      input = protocolFormFieldByKey("text_setting");
      expect(input.props().value).to.equal("text setting");
      expect(input.props().setting).to.equal(protocolsData[0].settings[0]);

      input = protocolFormFieldByKey("protocol2_setting");
      expect(input.length).to.equal(0);
    });

    it("doesn't render libraries for sitewide protocol", () => {
      let library = wrapper.find(".metadata-service-library");
      expect(library.length).to.equal(0);

      wrapper = shallow(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={metadataServicesData}
          editItem={editMetadataService}
          item={metadataServiceData}
          />
      );
      library = wrapper.find(".metadata-service-library");
      expect(library.length).to.equal(0);
    });

    it("renders libraries", () => {
      let library = wrapper.find(".metadata-service-library");
      expect(library.length).to.equal(0);

      const data = Object.assign({}, metadataServiceData, { protocol: "protocol 2" });
      wrapper = shallow(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={metadataServicesData}
          editItem={editMetadataService}
          item={data}
          />
      );
      library = wrapper.find(".metadata-service-library");
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("nypl");
      expect(library.text()).to.contain("remove");
    });

    it("doesn't render library add dropdown for sitewide protocol", () => {
      let select = wrapper.find("select[name='add-library']");
      expect(select.length).to.equal(0);

      wrapper = shallow(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={metadataServicesData}
          editItem={editMetadataService}
          item={metadataServiceData}
          />
      );
      select = wrapper.find("select[name='add-library']");
      expect(select.length).to.equal(0);
    });

    it("renders library add dropdown", () => {
      const servicesData = Object.assign({}, metadataServicesData, { protocols: [protocolsData[1]] });
      wrapper = shallow(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={servicesData}
          editItem={editMetadataService}
          />
      );

      let select = wrapper.find("select[name='add-library']");
      expect(select.prop("label")).to.equal("Add Library");

      let options = select.find("option");
      expect(options.length).to.equal(2);
      expect(options.at(0).prop("value")).to.equal("nypl");
      expect(options.at(1).prop("value")).to.equal("bpl");

      const data = Object.assign({}, metadataServiceData, { protocol: "protocol 2" });
      wrapper = shallow(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={metadataServicesData}
          editItem={editMetadataService}
          item={data}
          />
      );
      select = wrapper.find("select[name='add-library']");
      expect(select.prop("label")).to.equal("Add Library");

      options = select.find("option");
      expect(options.length).to.equal(1);
      expect(options.at(0).prop("value")).to.equal("bpl");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editMetadataService = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={metadataServicesData}
          editItem={editMetadataService}
          />
      );
    });

    it("changes fields when protocol changes", () => {
      let textSettingInput = protocolFormFieldByKey("text_setting");
      let protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      let librarySelect = wrapper.find("select[name='add-library']");
      expect(textSettingInput.length).to.equal(1);
      expect(protocol2SettingInput.length).to.equal(0);
      expect(librarySelect.length).to.equal(0);

      let select = wrapper.find("select[name='protocol']") as any;
      let selectElement = select.get(0);
      selectElement.value = "protocol 2";
      select.simulate("change");

      textSettingInput = protocolFormFieldByKey("text_setting");
      protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      librarySelect = wrapper.find("select[name='add-library']");
      expect(textSettingInput.length).to.equal(1);
      expect(protocol2SettingInput.length).to.equal(1);
      expect(librarySelect.length).to.equal(1);

      selectElement.value = "protocol 1";
      select.simulate("change");

      textSettingInput = protocolFormFieldByKey("text_setting");
      protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      librarySelect = wrapper.find("select[name='add-library']");
      expect(textSettingInput.length).to.equal(1);
      expect(protocol2SettingInput.length).to.equal(0);
      expect(librarySelect.length).to.equal(0);
    });

    it("adds a library", () => {
      const servicesData = Object.assign({}, metadataServicesData, { protocols: [protocolsData[1]] });
      wrapper = mount(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={servicesData}
          editItem={editMetadataService}
          />
      );
      let library = wrapper.find(".metadata-service-library");
      expect(library.length).to.equal(0);

      let select = wrapper.find("select[name='add-library']");
      (select.get(0) as any).value = "bpl";
      let addButton = wrapper.find("button.add-library");
      addButton.simulate("click");

      library = wrapper.find(".metadata-service-library");
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("bpl");
      expect(library.text()).to.contain("remove");

      let stateLibraries = wrapper.state().libraries;
      expect(stateLibraries.length).to.equal(1);
      expect(stateLibraries[0]).to.deep.equal({ short_name: "bpl" });
    });

    it("removes a library", () => {
      const servicesData = Object.assign({}, metadataServicesData, { protocols: [protocolsData[1]] });
      wrapper = mount(
        <MetadataServiceEditForm
          csrfToken="token"
          disabled={false}
          data={servicesData}
          editItem={editMetadataService}
          item={metadataServiceData}
          />
      );
      let library = wrapper.find(".metadata-service-library");
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("nypl");

      let removeButton = library.find("i");
      removeButton.simulate("click");

      library = wrapper.find(".metadata-service-library");
      expect(library.length).to.equal(0);
    });

    it("submits data", () => {
      wrapper.setProps({ item: metadataServiceData });

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editMetadataService.callCount).to.equal(1);
      let formData = editMetadataService.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("id")).to.equal("2");
      expect(formData.get("protocol")).to.equal("protocol 1");
      expect(formData.get("text_setting")).to.equal("text setting");
      expect(formData.get("libraries")).to.equal(JSON.stringify(metadataServiceData.libraries));
    });
  });
});
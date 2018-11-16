import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import ServiceEditForm, { ServiceEditFormProps, ServiceEditFormState } from "../ServiceEditForm";
import EditableInput from "../EditableInput";
import ProtocolFormField from "../ProtocolFormField";
import SaveButton from "../SaveButton";
import Collapsible from "../Collapsible";
import WithRemoveButton from "../WithRemoveButton";
import WithEditButton from "../WithEditButton";
import { ServicesData } from "../../interfaces";

describe("ServiceEditForm", () => {
  let TestServiceEditForm: new(props: ServiceEditFormProps<ServicesData>) => React.Component<ServiceEditFormProps<ServicesData>, ServiceEditFormState> = ServiceEditForm;
  let wrapper;
  let save;
  let urlBase = "/services";
  let serviceData = {
    id: 2,
    protocol: "protocol 1",
    settings: {
      text_setting: "text setting",
      select_setting: "option2"
    },
    libraries: [{
      short_name: "nypl",
      library_text_setting: "library text setting",
      library_select_setting: "option4"
    }]
  };
  let parentProtocol = {
    name: "protocol 3",
    label: "protocol 3 label",
    settings: [
      { key: "parent_setting", label: "parent label" }
    ],
    child_settings: [
      { key: "child_setting", label: "child label" }
    ],
    library_settings: []
  };
  let protocolsData = [
    {
      name: "protocol 1",
      label: "protocol 1 label",
      description: "protocol 1 description",
      sitewide: false,
      settings: [
        { key: "text_setting", label: "text label", optional: true },
        { key: "select_setting", label: "select label", type: "select",
          options: [
            { key: "option1", label: "option 1" },
            { key: "option2", label: "option 2" }
          ]
        }
      ],
      library_settings: [
        { key: "library_text_setting", label: "library text label", optional: true },
        { key: "library_select_setting", label: "library select label", type: "select",
          options: [
            { key: "option3", label: "option 3" },
            { key: "option4", label: "option 4" }
          ]
        }
      ]
    },
    {
      name: "protocol 2",
      label: "protocol 2 label",
      description: "protocol 2 description",
      sitewide: true,
      settings: [
        { key: "text_setting", label: "text label" },
        { key: "protocol2_setting", label: "protocol2 label" },
      ],
      library_settings: []
    },
    {
      name: "protocol with instructions",
      label: "instructions label",
      description: "click for instructions",
      instructions: "Instructions!",
      sitewide: false,
      settings: [],
      library_settings: []
    },
    parentProtocol
  ];
  let allLibraries = [
    { "short_name": "nypl", name: "New York Public Library" },
    { "short_name": "bpl", name: "Brooklyn Public Library" }
  ];
  let servicesData = {
    services: [serviceData],
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
      save = stub();
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
    });

    it("renders hidden id", () => {
      let input = wrapper.find("input[name=\"id\"]");
      expect(input.length).to.equal(0);

      wrapper.setProps({ item: serviceData });
      input = wrapper.find("input[name=\"id\"]");
      expect(input.props().type).to.equal("hidden");
      expect(input.props().value).to.equal("2");
    });

    it("renders protocol", () => {
      let input = editableInputByName("protocol");
      // starts with first protocol in list
      expect(input.props().value).to.equal("protocol 1");
      expect(input.props().readOnly).to.equal(false);
      expect(input.props().description).to.equal("protocol 1 description");
      let children = input.find("option");
      expect(children.length).to.equal(4);
      expect(children.at(0).text()).to.contain("protocol 1 label");
      expect(children.at(1).text()).to.contain("protocol 2 label");
      expect(children.at(2).text()).to.contain("instructions label");

      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          item={serviceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      input = editableInputByName("protocol");
      expect(input.props().value).to.equal("protocol 1");
      expect(input.props().readOnly).to.equal(true);
      expect(input.props().description).to.equal("protocol 1 description");
      children = input.find("option");
      expect(children.length).to.equal(1);
      expect(children.text()).to.contain("protocol 1 label");
    });

    it("renders protocol fields", () => {
      let input = protocolFormFieldByKey("text_setting");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().setting).to.equal(protocolsData[0].settings[0]);

      input = protocolFormFieldByKey("select_setting");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().setting).to.equal(protocolsData[0].settings[1]);

      input = protocolFormFieldByKey("protocol2_setting");
      expect(input.length).to.equal(0);

      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          item={serviceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );

      input = protocolFormFieldByKey("text_setting");
      expect(input.props().value).to.equal("text setting");
      expect(input.props().setting).to.equal(protocolsData[0].settings[0]);

      input = protocolFormFieldByKey("select_setting");
      expect(input.props().value).to.equal("option2");

      input = protocolFormFieldByKey("protocol2_setting");
      expect(input.length).to.equal(0);
    });

    it("renders a collapsible component", () => {
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      wrapper.setState({ protocol: "protocol with instructions" });

      let collapsible = wrapper.find(".collapsible");
      expect(collapsible.length).to.equal(3);
      let title = collapsible.at(0).find(".panel-title");
      expect(title.text()).to.equal("click for instructions");
      let body = collapsible.at(0).find(".panel-body");
      expect(body.text()).to.equal("Instructions!");
    });

    it("doesn't render parent dropdown for protocol with no child settings", () => {
      let input = editableInputByName("parent_id");
      expect(input.length).to.equal(0);
    });

    it("doesn't render parent dropdown when there are no available parents", () => {
      const newService = Object.assign({}, serviceData, { protocol: "protocol 3" });
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          item={newService}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );

      let input = editableInputByName("parent_id");
      expect(input.length).to.equal(0);
    });

    it("renders parent dropdown for protocol with child settings and available parents", () => {
      const parentService = Object.assign({}, serviceData, { protocol: "protocol 3", name: "Parent" });
      const childService = Object.assign({}, serviceData, { protocol: "protocol 3", id: 3, name: "Child" });
      let servicesDataWithParent = Object.assign({}, servicesData, { services: [parentService, childService] });
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataWithParent}
          item={childService}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );

      let input = editableInputByName("parent_id");
      expect(input.length).to.equal(1);
      expect(input.props().value).to.equal(null);
      let children = input.find("option");
      expect(children.length).to.equal(2);
      expect(children.at(0).text()).to.contain("None");
      expect(children.at(1).text()).to.contain("Parent");

      childService.parent_id = parentService.id;
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataWithParent}
          item={childService}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      input = editableInputByName("parent_id");
      expect(input.length).to.equal(1);
      expect(input.props().value).to.equal("2");
      children = input.find("option");
      expect(children.length).to.equal(2);
      expect(children.at(0).text()).to.contain("None");
      expect(children.at(1).text()).to.contain("Parent");
    });

    it("renders protocol fields for child", () => {
      const parentService = Object.assign({}, serviceData, { protocol: "protocol 3", name: "Parent" });
      const childService = Object.assign({}, serviceData, { protocol: "protocol 3", id: 3, name: "Child" });
      let servicesDataWithParent = Object.assign({}, servicesData, { services: [parentService, childService] });
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataWithParent}
          item={childService}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );

      let input = protocolFormFieldByKey("parent_setting");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().setting).to.equal(parentProtocol.settings[0]);

      input = protocolFormFieldByKey("child_setting");
      expect(input.length).to.equal(0);

      childService.settings["parent_setting"] = "parent setting";
      wrapper.setProps({ item: childService });

      input = protocolFormFieldByKey("parent_setting");
      expect(input.props().value).to.equal("parent setting");

      childService.parent_id = parentService.id;
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataWithParent}
          item={childService}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );

      input = protocolFormFieldByKey("parent_setting");
      expect(input.length).to.equal(0);

      input = protocolFormFieldByKey("child_setting");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().setting).to.equal(parentProtocol.child_settings[0]);

      childService.settings["child_setting"] = "child setting";
      wrapper.setProps({ item: childService });

      input = protocolFormFieldByKey("child_setting");
      expect(input.props().value).to.equal("child setting");
    });

    it("doesn't render libraries for sitewide protocol without library settings", () => {
      let servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [servicesData.protocols[1]]
      });

      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataSitewide}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      let library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(0);

      let serviceDataSitewide = Object.assign({}, servicesData, {
        libraries: []
      });
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataSitewide}
          save={save}
          item={serviceDataSitewide}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(0);
    });

    it("renders libraries for a sitewide protocol with library settings", () => {
      let servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [Object.assign({}, servicesData.protocols[1], { sitewide: true })]
      });

      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataSitewide}
          save={save}
          item={serviceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      let library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(1);
    });

    it("renders removable and editable libraries", () => {
      let library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(0);

      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          item={serviceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(1);
      let editable = library.find(WithEditButton);
      expect(editable.length).to.equal(1);
      expect(editable.props().children).to.contain("New York Public Library");
    });

    it("renders removable but not editable libraries", () => {
      let library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(0);

      let newServiceData = Object.assign({}, serviceData, { protocol: "protocol 3" });

      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          item={newServiceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(1);
      expect(library.props().children).to.contain("New York Public Library");
    });

    it("doesn't render library add dropdown for sitewide protocol", () => {
      let servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [servicesData.protocols[1]]
      });

      wrapper = shallow(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataSitewide}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      let select = wrapper.find("select[name='add-library']");
      expect(select.length).to.equal(0);

      let serviceDataSitewide = Object.assign({}, servicesData, {
        libraries: []
      });
      wrapper = shallow(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataSitewide}
          save={save}
          item={serviceDataSitewide}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      select = wrapper.find("select[name='add-library']");
      expect(select.length).to.equal(0);
    });

    it("renders library add dropdown for a sitewide protocol with library settings", () => {
      let servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [Object.assign({}, servicesData.protocols[1], { sitewide: true })]
      });

      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataSitewide}
          save={save}
          item={serviceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      let select = wrapper.find("select[name='add-library']");
      expect(select.length).to.equal(1);
    });

    it("renders library add dropdown for a non-sitewide protocol", () => {
      let select = editableInputByName("add-library");
      expect(select.props().label).to.equal("Add Library");

      let options = select.find("option");
      expect(options.length).to.equal(3);
      expect(options.at(0).props().value).to.equal("none");
      expect(options.at(1).props().value).to.equal("nypl");
      expect(options.at(2).props().value).to.equal("bpl");

      let input = protocolFormFieldByKey("library_text_setting");
      expect(input.length).to.equal(0);
      input = protocolFormFieldByKey("library_select_setting");
      expect(input.length).to.equal(0);

      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          item={serviceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      select = editableInputByName("add-library");
      expect(select.props().label).to.equal("Add Library");

      options = select.find("option");
      expect(options.length).to.equal(2);
      expect(options.at(0).props().value).to.equal("none");
      expect(options.at(1).props().value).to.equal("bpl");
    });

    it("has a save button", () => {
      let saveButton = wrapper.find("SaveButton");
      expect(saveButton.length).to.equal(1);
    });

  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
    });

    it("changes fields and description when protocol changes", () => {
      // Select a library so the library settings are shown.
      let librarySelect = wrapper.find("select[name='add-library']") as any;
      librarySelect.get(0).value = "nypl";
      librarySelect.simulate("change");

      let textSettingInput = protocolFormFieldByKey("text_setting");
      let selectSettingInput = protocolFormFieldByKey("select_setting");
      let libraryTextSettingInput = protocolFormFieldByKey("library_text_setting");
      let librarySelectSettingInput = protocolFormFieldByKey("library_select_setting");
      let protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      expect(textSettingInput.length).to.equal(1);
      expect(selectSettingInput.length).to.equal(1);
      expect(libraryTextSettingInput.length).to.equal(1);
      expect(librarySelectSettingInput.length).to.equal(1);
      expect(protocol2SettingInput.length).to.equal(0);

      let protocolInput = editableInputByName("protocol");
      expect(protocolInput.prop("description")).to.equal("protocol 1 description");

      let select = wrapper.find("select[name='protocol']") as any;
      let selectElement = select.get(0);
      selectElement.value = "protocol 2";
      select.simulate("change");

      textSettingInput = protocolFormFieldByKey("text_setting");
      selectSettingInput = protocolFormFieldByKey("select_setting");
      libraryTextSettingInput = protocolFormFieldByKey("library_text_setting");
      librarySelectSettingInput = protocolFormFieldByKey("library_select_setting");
      protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      expect(textSettingInput.length).to.equal(1);
      expect(selectSettingInput.length).to.equal(0);
      expect(libraryTextSettingInput.length).to.equal(0);
      expect(librarySelectSettingInput.length).to.equal(0);
      expect(protocol2SettingInput.length).to.equal(1);

      protocolInput = editableInputByName("protocol");
      expect(protocolInput.prop("description")).to.equal("protocol 2 description");
      expect(protocolInput.prop("link")).to.be.undefined;

      selectElement.value = "protocol 1";
      select.simulate("change");

      textSettingInput = protocolFormFieldByKey("text_setting");
      selectSettingInput = protocolFormFieldByKey("select_setting");
      libraryTextSettingInput = protocolFormFieldByKey("library_text_setting");
      librarySelectSettingInput = protocolFormFieldByKey("library_select_setting");
      protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      expect(textSettingInput.length).to.equal(1);
      expect(selectSettingInput.length).to.equal(1);
      expect(libraryTextSettingInput.length).to.equal(1);
      expect(librarySelectSettingInput.length).to.equal(1);
      expect(protocol2SettingInput.length).to.equal(0);

      protocolInput = editableInputByName("protocol");
      expect(protocolInput.prop("description")).to.equal("protocol 1 description");
    });

    it("changes fields when parent changes", () => {
      const parentService = Object.assign({}, serviceData, { protocol: "protocol 3", name: "Parent" });
      let servicesDataWithParent = Object.assign({}, servicesData, { services: [parentService], protocols: [parentProtocol] });
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesDataWithParent}
          save={save}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      let input = protocolFormFieldByKey("parent_setting");
      expect(input.length).to.equal(1);

      input = protocolFormFieldByKey("child_setting");
      expect(input.length).to.equal(0);

      let select = wrapper.find("select[name='parent_id']") as any;
      let selectElement = select.get(0);
      selectElement.value = "2";
      select.simulate("change");

      input = protocolFormFieldByKey("parent_setting");
      expect(input.length).to.equal(0);

      input = protocolFormFieldByKey("child_setting");
      expect(input.length).to.equal(1);

      selectElement.value = "";
      select.simulate("change");

      input = protocolFormFieldByKey("parent_setting");
      expect(input.length).to.equal(1);

      input = protocolFormFieldByKey("child_setting");
      expect(input.length).to.equal(0);
    });

    it("adds a library with settings", () => {
      let library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(0);

      let libraryTextSettingInput = editableInputByName("library_text_setting").find("input");
      expect(libraryTextSettingInput.length).to.equal(0);
      let librarySelectSettingInput = editableInputByName("library_select_setting").find("select");
      expect(librarySelectSettingInput.length).to.equal(0);

      let select = wrapper.find("select[name='add-library']") as any;
      select.get(0).value = "bpl";
      select.simulate("change");

      libraryTextSettingInput = editableInputByName("library_text_setting").find("input");
      expect(libraryTextSettingInput.length).to.equal(1);
      librarySelectSettingInput = editableInputByName("library_select_setting").find("select");
      expect(librarySelectSettingInput.length).to.equal(1);

      select.get(0).value = "none";
      select.simulate("change");

      libraryTextSettingInput = editableInputByName("library_text_setting").find("input");
      expect(libraryTextSettingInput.length).to.equal(0);
      librarySelectSettingInput = editableInputByName("library_select_setting").find("select");
      expect(librarySelectSettingInput.length).to.equal(0);

      select.get(0).value = "bpl";
      select.simulate("change");

      libraryTextSettingInput = editableInputByName("library_text_setting").find("input");
      libraryTextSettingInput.get(0).value = "library text";
      libraryTextSettingInput.simulate("change");
      librarySelectSettingInput = editableInputByName("library_select_setting").find("select");
      librarySelectSettingInput.get(0).value = "option4";
      librarySelectSettingInput.simulate("change");

      let addButton = wrapper.find("button.add-library");
      addButton.simulate("click");

      library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("Brooklyn Public Library");
      expect(library.text()).to.contain("remove");
      expect(library.text()).to.contain("edit");

      let stateLibraries = wrapper.state().libraries;
      expect(stateLibraries.length).to.equal(1);
      expect(stateLibraries[0].short_name).to.equal("bpl");
      expect(stateLibraries[0].library_text_setting).to.equal("library text");
      expect(stateLibraries[0].library_select_setting).to.equal("option4");

      select = wrapper.find("select[name='add-library']") as any;
      select.get(0).value = "nypl";
      select.simulate("change");

      libraryTextSettingInput = editableInputByName("library_text_setting").find("input");
      expect(libraryTextSettingInput.get(0).value).to.equal("");
      librarySelectSettingInput = editableInputByName("library_select_setting").find("select");
      expect(librarySelectSettingInput.get(0).value).to.equal("option3");
    });

    it("removes a library", () => {
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          item={serviceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      let library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("New York Public Library");

      let onRemove = library.prop("onRemove");
      onRemove();

      library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(0);
    });

    it("edits a library", () => {
      wrapper = mount(
        <TestServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          item={serviceData}
          urlBase={urlBase}
          listDataKey="services"
          />
      );
      let library = wrapper.find(WithRemoveButton).find(WithEditButton);
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("New York Public Library");

      let onEdit = library.prop("onEdit");
      onEdit();

      let settings = wrapper.find(".edit-library-settings");
      expect(settings.length).to.equal(1);
      let libraryTextSettingInput = settings.find("input[name='library_text_setting']") as any;
      expect(libraryTextSettingInput.get(0).value).to.equal("library text setting");
      let librarySelectSettingInput = settings.find("select[name='library_select_setting']") as any;
      expect(librarySelectSettingInput.get(0).value).to.equal("option4");

      libraryTextSettingInput.get(0).value = "new library text";
      libraryTextSettingInput.simulate("change");
      librarySelectSettingInput.get(0).value = "option3";
      librarySelectSettingInput.simulate("change");

      onEdit();

      settings = wrapper.find(".edit-library-settings");
      expect(settings.length).to.equal(0);

      onEdit();

      settings = wrapper.find(".edit-library-settings");
      expect(settings.length).to.equal(1);
      libraryTextSettingInput = settings.find("input[name='library_text_setting']") as any;
      expect(libraryTextSettingInput.get(0).value).to.equal("library text setting");
      librarySelectSettingInput = settings.find("select[name='library_select_setting']") as any;
      expect(librarySelectSettingInput.get(0).value).to.equal("option4");

      libraryTextSettingInput.get(0).value = "new library text";
      libraryTextSettingInput.simulate("change");
      librarySelectSettingInput.get(0).value = "option3";
      librarySelectSettingInput.simulate("change");

      let saveButton = settings.find("button");
      saveButton.simulate("click");

      let stateLibraries = wrapper.state().libraries;
      expect(stateLibraries.length).to.equal(1);
      expect(stateLibraries[0].short_name).to.equal("nypl");
      expect(stateLibraries[0].library_text_setting).to.equal("new library text");
      expect(stateLibraries[0].library_select_setting).to.equal("option3");
    });

    it("calls save when the save button is clicked", () => {
      let saveButton = wrapper.find("SaveButton");
      saveButton.simulate("click");
      expect(save.callCount).to.equal(1);
    });

    it("calls save when the form is submitted directly", () => {
      wrapper.simulate("submit");
      expect(save.callCount).to.equal(1);
    });

    it("calls save on submit even if there is a collapsible panel", () => {
      wrapper.setState({ protocol: "protocol with instructions" });
      let collapsible = wrapper.find(".collapsible");
      expect(collapsible.length).to.equal(3);

      wrapper.simulate("submit");
      expect(save.callCount).to.equal(1);
    });

    it("calls handleData", () => {
      let handleData = spy(wrapper.instance(), "handleData");
      wrapper.setProps({ item: serviceData });
      wrapper.simulate("submit");

      expect(handleData.callCount).to.equal(1);

      handleData.restore();
    });

    it("submits data", () => {
      wrapper.setProps({ item: serviceData });

      let saveButton = wrapper.find("SaveButton");
      saveButton.simulate("click");

      expect(save.callCount).to.equal(1);
      let formData = save.args[0][0];
      expect(formData.get("id")).to.equal("2");
      expect(formData.get("protocol")).to.equal("protocol 1");
      expect(formData.get("text_setting")).to.equal("text setting");
      expect(formData.get("select_setting")).to.equal("option2");
      expect(formData.get("libraries")).to.equal(JSON.stringify(serviceData.libraries));
    });

    let fillOutFormFields = () => {
      let nameInput = wrapper.find("input[name='name']");
      let nameInputElement = nameInput.get(0);
      nameInputElement.value = "new service";
      nameInput.simulate("change");
    };

    it("clears the form", () => {
      fillOutFormFields();
      let nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new service");

      wrapper.simulate("submit");
      let newProps = {responseBody: "new service", ...wrapper.props()};
      wrapper.setProps(newProps);

      expect(nameInput.props().value).to.equal("");

    });

    it("doesn't clear the form if there's an error message", () => {
      fillOutFormFields();
      let nameInput = wrapper.find("input[name='name']");

      expect(nameInput.props().value).to.equal("new service");

      wrapper.simulate("submit");
      let newProps = {fetchError: "ERROR", ...wrapper.props()};
      wrapper.setProps(newProps);

      expect(nameInput.props().value).to.equal("new service");

    });

  });
});

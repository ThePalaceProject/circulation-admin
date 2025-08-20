import { expect } from "chai";
import { stub, spy } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import ServiceEditForm, {
  ServiceEditFormProps,
  ServiceEditFormState,
} from "../ServiceEditForm";
import EditableInput from "../EditableInput";
import ProtocolFormField from "../ProtocolFormField";
import NeighborhoodAnalyticsForm from "../NeighborhoodAnalyticsForm";
import { Button, Form } from "library-simplified-reusable-components";
import WithRemoveButton from "../WithRemoveButton";
import WithEditButton from "../WithEditButton";
import { ServicesData } from "../../interfaces";

describe("ServiceEditForm", () => {
  const TestServiceEditForm: new (
    props: ServiceEditFormProps<ServicesData>
  ) => React.Component<
    ServiceEditFormProps<ServicesData>,
    ServiceEditFormState
  > = ServiceEditForm;
  let wrapper;
  let save;
  const urlBase = "/services";
  const serviceData = {
    id: 2,
    protocol: "protocol 1",
    settings: {
      text_setting: "text setting",
      select_setting: "option2",
    },
    libraries: [
      {
        short_name: "nypl",
        library_text_setting: "library text setting",
        library_select_setting: "option4",
      },
    ],
  };
  const parentProtocol = {
    name: "protocol 3",
    label: "protocol 3 label",
    settings: [{ key: "parent_setting", label: "parent label" }],
    child_settings: [{ key: "child_setting", label: "child label" }],
    library_settings: [],
  };
  const protocolsData = [
    {
      name: "protocol 1",
      label: "protocol 1 label",
      description: "protocol 1 description",
      sitewide: false,
      settings: [
        { key: "text_setting", label: "text label", optional: true },
        {
          key: "select_setting",
          label: "select label",
          type: "select",
          options: [
            { key: "option1", label: "option 1" },
            { key: "option2", label: "option 2" },
          ],
        },
      ],
      library_settings: [
        {
          key: "library_text_setting",
          label: "library text label",
          optional: true,
        },
        {
          key: "library_select_setting",
          label: "library select label",
          type: "select",
          options: [
            { key: "option3", label: "option 3" },
            { key: "option4", label: "option 4" },
          ],
        },
      ],
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
      library_settings: [],
    },
    {
      name: "protocol with instructions",
      label: "instructions label",
      description: "click for instructions",
      instructions: "Instructions!",
      sitewide: false,
      settings: [],
      library_settings: [],
    },
    parentProtocol,
  ];
  const allLibraries = [
    { short_name: "nypl", name: "New York Public Library" },
    { short_name: "bpl", name: "Brooklyn Public Library" },
  ];
  const servicesData = {
    services: [serviceData],
    protocols: protocolsData,
    allLibraries: allLibraries,
  };

  const editableInputByName = (name) => {
    const inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere((input) => input.props().name === name);
    }
    return [];
  };

  const protocolFormFieldByKey = (key) => {
    const formFields = wrapper.find(ProtocolFormField);
    if (formFields.length >= 1) {
      return formFields.filterWhere(
        (formField) => formField.props().setting.key === key
      );
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
      // prettier-ignore
      let input = wrapper.find("input[name=\"id\"]");
      expect(input.length).to.equal(0);

      wrapper.setProps({ item: serviceData });
      // prettier-ignore
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

      const collapsible = wrapper.find(".panel");
      expect(collapsible.length).to.equal(3);
      const title = collapsible.at(0).find(".panel-title");
      expect(title.text()).to.equal("click for instructions");
      const body = collapsible.at(0).find(".panel-body");
      expect(body.text()).to.equal("Instructions!");
    });

    it("doesn't render parent dropdown for protocol with no child settings", () => {
      const input = editableInputByName("parent_id");
      expect(input.length).to.equal(0);
    });

    it("doesn't render parent dropdown when there are no available parents", () => {
      const newService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
      });
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

      const input = editableInputByName("parent_id");
      expect(input.length).to.equal(0);
    });

    it("renders parent dropdown for protocol with child settings and available parents", () => {
      const parentService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        name: "Parent",
      });
      const childService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        id: 3,
        name: "Child",
      });
      const servicesDataWithParent = Object.assign({}, servicesData, {
        services: [parentService, childService],
      });
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

      childService["parent_id"] = parentService.id;
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
      const parentService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        name: "Parent",
      });
      const childService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        id: 3,
        name: "Child",
      });
      const servicesDataWithParent = Object.assign({}, servicesData, {
        services: [parentService, childService],
      });
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

      childService["parent_id"] = parentService.id;
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
      const servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [servicesData.protocols[1]],
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

      const serviceDataSitewide = Object.assign({}, servicesData, {
        libraries: [],
        protocol: "",
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
      const servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [
          Object.assign({}, servicesData.protocols[1], { sitewide: true }),
        ],
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
      const library = wrapper.find(WithRemoveButton);
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
      const editable = library.find(WithEditButton);
      expect(editable.length).to.equal(1);
      expect(editable.props().children).to.contain("New York Public Library");
    });

    it("renders removable but not editable libraries", () => {
      let library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(0);

      const newServiceData = Object.assign({}, serviceData, {
        protocol: "protocol 3",
      });

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
      const servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [servicesData.protocols[1]],
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

      const serviceDataSitewide = Object.assign({}, servicesData, {
        libraries: [],
        protocol: "",
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
      const servicesDataSitewide = Object.assign({}, servicesData, {
        protocols: [
          Object.assign({}, servicesData.protocols[1], { sitewide: true }),
        ],
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
      const select = wrapper.find("select[name='add-library']");
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

    it("renders neighborhood analytics form for a relevant patron auth protocol", () => {
      let neighborhoodForm = wrapper.find(NeighborhoodAnalyticsForm);
      expect(neighborhoodForm.length).to.equal(0);
      const patronAuthProtocol = {
        ...protocolsData[0],
        ...{ settings: [{ key: "neighborhood_mode", options: [] }] },
      };
      wrapper.setProps({
        extraFormKey: "neighborhood_mode",
        extraFormSection: NeighborhoodAnalyticsForm,
        data: { ...servicesData, ...{ protocols: [patronAuthProtocol] } },
      });
      neighborhoodForm = wrapper.find(NeighborhoodAnalyticsForm);
      expect(neighborhoodForm.length).to.equal(1);
    });

    it("renders neighborhood analytics form for a relevant analytics protocol", () => {
      let neighborhoodForm = wrapper.find(NeighborhoodAnalyticsForm);
      expect(neighborhoodForm.length).to.equal(0);
      const analyticsProtocol = {
        ...protocolsData[0],
        ...{ settings: [{ key: "location_source", options: [] }] },
      };
      wrapper.setProps({
        extraFormKey: "location_source",
        extraFormSection: NeighborhoodAnalyticsForm,
        data: { ...servicesData, ...{ protocols: [analyticsProtocol] } },
      });
      neighborhoodForm = wrapper.find(NeighborhoodAnalyticsForm);
      expect(neighborhoodForm.length).to.equal(1);
    });

    it("has a save button", () => {
      const saveButton = wrapper.find(Button);
      expect(saveButton.length).to.equal(1);
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
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
      const librarySelect = wrapper.find("select[name='add-library']") as any;
      librarySelect.getDOMNode().value = "nypl";
      librarySelect.simulate("change");

      let textSettingInput = protocolFormFieldByKey("text_setting");
      let selectSettingInput = protocolFormFieldByKey("select_setting");
      let libraryTextSettingInput = protocolFormFieldByKey(
        "library_text_setting"
      );
      let librarySelectSettingInput = protocolFormFieldByKey(
        "library_select_setting"
      );
      let protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      expect(textSettingInput.length).to.equal(1);
      expect(selectSettingInput.length).to.equal(1);
      expect(libraryTextSettingInput.length).to.equal(1);
      expect(librarySelectSettingInput.length).to.equal(1);
      expect(protocol2SettingInput.length).to.equal(0);

      let protocolInput = editableInputByName("protocol");
      expect(protocolInput.prop("description")).to.equal(
        "protocol 1 description"
      );

      const select = wrapper.find("select[name='protocol']") as any;
      const selectElement = select.getDOMNode();
      selectElement.value = "protocol 2";
      select.simulate("change");

      textSettingInput = protocolFormFieldByKey("text_setting");
      selectSettingInput = protocolFormFieldByKey("select_setting");
      libraryTextSettingInput = protocolFormFieldByKey("library_text_setting");
      librarySelectSettingInput = protocolFormFieldByKey(
        "library_select_setting"
      );
      protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      expect(textSettingInput.length).to.equal(1);
      expect(selectSettingInput.length).to.equal(0);
      expect(libraryTextSettingInput.length).to.equal(0);
      expect(librarySelectSettingInput.length).to.equal(0);
      expect(protocol2SettingInput.length).to.equal(1);

      protocolInput = editableInputByName("protocol");
      expect(protocolInput.prop("description")).to.equal(
        "protocol 2 description"
      );
      expect(protocolInput.prop("link")).to.be.undefined;

      selectElement.value = "protocol 1";
      select.simulate("change");

      textSettingInput = protocolFormFieldByKey("text_setting");
      selectSettingInput = protocolFormFieldByKey("select_setting");
      libraryTextSettingInput = protocolFormFieldByKey("library_text_setting");
      librarySelectSettingInput = protocolFormFieldByKey(
        "library_select_setting"
      );
      protocol2SettingInput = protocolFormFieldByKey("protocol2_setting");
      expect(textSettingInput.length).to.equal(1);
      expect(selectSettingInput.length).to.equal(1);
      expect(libraryTextSettingInput.length).to.equal(1);
      expect(librarySelectSettingInput.length).to.equal(1);
      expect(protocol2SettingInput.length).to.equal(0);

      protocolInput = editableInputByName("protocol");
      expect(protocolInput.prop("description")).to.equal(
        "protocol 1 description"
      );
    });

    it("changes fields when parent changes", () => {
      const parentService = Object.assign({}, serviceData, {
        protocol: "protocol 3",
        name: "Parent",
      });
      const servicesDataWithParent = Object.assign({}, servicesData, {
        services: [parentService],
        protocols: [parentProtocol],
      });
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

      const select = wrapper.find("select[name='parent_id']") as any;
      const selectElement = select.getDOMNode();
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

      let libraryTextSettingInput = editableInputByName(
        "library_text_setting"
      ).find("input");
      expect(libraryTextSettingInput.length).to.equal(0);
      let librarySelectSettingInput = editableInputByName(
        "library_select_setting"
      ).find("select");
      expect(librarySelectSettingInput.length).to.equal(0);

      let select = wrapper.find("select[name='add-library']").hostNodes();
      select.getDOMNode().value = "bpl";
      select.simulate("change");

      libraryTextSettingInput = editableInputByName(
        "library_text_setting"
      ).find("input");
      expect(libraryTextSettingInput.length).to.equal(1);
      librarySelectSettingInput = editableInputByName(
        "library_select_setting"
      ).find("select");
      expect(librarySelectSettingInput.length).to.equal(1);

      select.getDOMNode().value = "none";
      select.simulate("change");

      libraryTextSettingInput = editableInputByName(
        "library_text_setting"
      ).find("input");
      expect(libraryTextSettingInput.length).to.equal(0);
      librarySelectSettingInput = editableInputByName(
        "library_select_setting"
      ).find("select");
      expect(librarySelectSettingInput.length).to.equal(0);

      select.getDOMNode().value = "bpl";
      select.simulate("change");

      libraryTextSettingInput = editableInputByName(
        "library_text_setting"
      ).find("input");
      libraryTextSettingInput.getDOMNode().value = "library text";
      libraryTextSettingInput.simulate("change");
      librarySelectSettingInput = editableInputByName(
        "library_select_setting"
      ).find("select");
      librarySelectSettingInput.getDOMNode().value = "option4";
      librarySelectSettingInput.simulate("change");

      const addButton = wrapper
        .find("button")
        .findWhere((el) => el.text() === "Add Library")
        .hostNodes();
      addButton.simulate("click");

      library = wrapper.find(WithRemoveButton);
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("Brooklyn Public Library");
      expect(library.text()).to.contain("Delete");
      expect(library.text()).to.contain("Edit");

      const stateLibraries = wrapper.state().libraries;
      expect(stateLibraries.length).to.equal(1);
      expect(stateLibraries[0].short_name).to.equal("bpl");
      expect(stateLibraries[0].library_text_setting).to.equal("library text");
      expect(stateLibraries[0].library_select_setting).to.equal("option4");

      select = wrapper.find("select[name='add-library']").hostNodes();
      select.getDOMNode().value = "nypl";
      select.simulate("change");

      libraryTextSettingInput = editableInputByName(
        "library_text_setting"
      ).find("input");
      expect(libraryTextSettingInput.getDOMNode().value).to.equal("");
      librarySelectSettingInput = editableInputByName(
        "library_select_setting"
      ).find("select");
      expect(librarySelectSettingInput.getDOMNode().value).to.equal("option3");
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

      const onRemove = library.prop("onRemove");
      onRemove();
      wrapper.update();

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
      const library = wrapper.find(WithRemoveButton).find(".with-edit-button");
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("New York Public Library");

      const onEdit = library.find("button");
      onEdit.simulate("click");

      let settings = wrapper.find(".edit-library-settings");
      expect(settings.length).to.equal(1);
      let libraryTextSettingInput = settings.find(
        "input[name='library_text_setting']"
      ) as any;
      expect(libraryTextSettingInput.getDOMNode().value).to.equal(
        "library text setting"
      );
      let librarySelectSettingInput = settings.find(
        "select[name='library_select_setting']"
      ) as any;
      expect(librarySelectSettingInput.getDOMNode().value).to.equal("option4");

      libraryTextSettingInput.getDOMNode().value = "new library text";
      libraryTextSettingInput.simulate("change");
      librarySelectSettingInput.getDOMNode().value = "option3";
      librarySelectSettingInput.simulate("change");

      onEdit.simulate("click");

      settings = wrapper.find(".edit-library-settings");
      expect(settings.length).to.equal(0);

      onEdit.simulate("click");

      settings = wrapper.find(".edit-library-settings");
      expect(settings.length).to.equal(1);
      libraryTextSettingInput = settings.find(
        "input[name='library_text_setting']"
      ) as any;
      expect(libraryTextSettingInput.getDOMNode().value).to.equal(
        "library text setting"
      );
      librarySelectSettingInput = settings.find(
        "select[name='library_select_setting']"
      ) as any;
      expect(librarySelectSettingInput.getDOMNode().value).to.equal("option4");

      libraryTextSettingInput.getDOMNode().value = "new library text";
      libraryTextSettingInput.simulate("change");
      librarySelectSettingInput.getDOMNode().value = "option3";
      librarySelectSettingInput.simulate("change");

      const saveButton = settings.find("button");
      saveButton.simulate("click");

      const stateLibraries = wrapper.state().libraries;
      expect(stateLibraries.length).to.equal(1);
      expect(stateLibraries[0].short_name).to.equal("nypl");
      expect(stateLibraries[0].library_text_setting).to.equal(
        "new library text"
      );
      expect(stateLibraries[0].library_select_setting).to.equal("option3");
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

    it("calls save on submit even if there is a collapsible panel", () => {
      wrapper.setState({ protocol: "protocol with instructions" });
      const collapsible = wrapper.find(".panel");
      expect(collapsible.length).to.equal(3);

      wrapper.find(Form).props().onSubmit();
      expect(save.callCount).to.equal(1);
    });

    it("calls handleData", () => {
      const handleData = spy(wrapper.instance(), "handleData");
      wrapper.setProps({ item: serviceData });
      // The first two buttons are the edit and remove buttons for this component
      // which only contains one object as data.
      wrapper.find(Button).at(2).simulate("click");

      expect(handleData.callCount).to.equal(1);

      handleData.restore();
    });

    it("submits data", () => {
      wrapper.setProps({ item: serviceData });

      // The first two buttons are the edit and remove buttons for this component
      // which only contains one object as data.
      const saveButton = wrapper.find(Button).at(2);
      saveButton.simulate("click");

      expect(save.callCount).to.equal(1);
      const formData = save.args[0][0];
      expect(formData.get("id")).to.equal("2");
      expect(formData.get("protocol")).to.equal("protocol 1");
      expect(formData.get("text_setting")).to.equal("text setting");
      expect(formData.get("select_setting")).to.equal("option2");
      expect(formData.get("libraries")).to.equal(
        JSON.stringify(serviceData.libraries)
      );
    });

    const fillOutFormFields = () => {
      const nameInput = wrapper.find("input[name='name']");
      const nameInputElement = nameInput.getDOMNode();
      nameInputElement.value = "new service";
      nameInput.simulate("change");
    };

    it("clears the form", () => {
      fillOutFormFields();
      let nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new service");

      wrapper.simulate("submit");
      const newProps = { responseBody: "new service", ...wrapper.props() };
      wrapper.setProps(newProps);

      nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("");
    });

    it("doesn't clear the form if there's an error message", () => {
      fillOutFormFields();
      let nameInput = wrapper.find("input[name='name']");

      expect(nameInput.props().value).to.equal("new service");

      wrapper.simulate("submit");
      const newProps = { fetchError: "ERROR", ...wrapper.props() };
      wrapper.setProps(newProps);

      nameInput = wrapper.find("input[name='name']");
      expect(nameInput.props().value).to.equal("new service");
    });
  });

  describe("library removal confirmation", () => {
    let serviceEditFormInstance;
    let isLibraryRemovalPermittedSpy;
    let removeLibrarySpy;

    beforeEach(() => {
      save = stub().returns(new Promise<void>((resolve) => resolve()));
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
      serviceEditFormInstance = wrapper.instance();
      removeLibrarySpy = spy(serviceEditFormInstance, "removeLibrary");
    });

    afterEach(() => {
      isLibraryRemovalPermittedSpy.restore();
      removeLibrarySpy.restore();
    });

    const shouldRemoveLibrary = () => {
      const libraryToRemove = serviceData.libraries[0];
      const removeButton = wrapper.find(WithRemoveButton).at(0).find("button.remove-btn");

      removeButton.simulate("click");

      expect(isLibraryRemovalPermittedSpy.calledOnce).to.be.true;
      expect(isLibraryRemovalPermittedSpy.calledWith(libraryToRemove)).to.be.true;
      expect(isLibraryRemovalPermittedSpy.returned(true)).to.be.true;

      // Library removal should be performed.
      expect(removeLibrarySpy.calledOnce).to.be.true;
      expect(removeLibrarySpy.calledWith(libraryToRemove)).to.be.true;

      // Ensure that the library was removed from state.
      wrapper.update();
      expect(wrapper.state("libraries")).to.deep.equal([]);
    };

    it("should allow removal by default", () => {
      isLibraryRemovalPermittedSpy = spy(serviceEditFormInstance, "isLibraryRemovalPermitted");
      shouldRemoveLibrary();
    });

    it("should allow remove if isLibraryRemovalPermitted returns true", () => {
      isLibraryRemovalPermittedSpy = stub(serviceEditFormInstance, "isLibraryRemovalPermitted").returns(true);
      shouldRemoveLibrary();
    });

    it("should not allow remove if isLibraryRemovalPermitted returns false", () => {
      isLibraryRemovalPermittedSpy = stub(serviceEditFormInstance, "isLibraryRemovalPermitted").returns(false);
      const libraryToRemove = serviceData.libraries[0];
      const removeButton = wrapper.find(WithRemoveButton).at(0).find("button.remove-btn");

      removeButton.simulate("click");

      expect(isLibraryRemovalPermittedSpy.calledOnce).to.be.true;
      expect(isLibraryRemovalPermittedSpy.calledWith(libraryToRemove)).to.be.true;
      expect(isLibraryRemovalPermittedSpy.returned(false)).to.be.true;

      // Library disassociation should NOT be performed.
      expect(removeLibrarySpy.notCalled).to.be.true;

      // Ensure that the library was NOT removed from state.
      wrapper.update();
      expect(wrapper.state("libraries")).to.deep.equal(serviceData.libraries);
    });
  });
});

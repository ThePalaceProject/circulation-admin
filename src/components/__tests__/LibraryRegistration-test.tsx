import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import LibraryRegistration from "../LibraryRegistration";
import LibraryRegistrationForm from "../LibraryRegistrationForm";
import EditableInput from "../EditableInput";

describe("LibraryRegistration", () => {
  let wrapper;
  let save;
  let registerLibrary;
  const protocol = "protocol 1";
  const serviceData = {
    id: 1,
    protocol,
  };
  const protocolsData = [
    {
      name: protocol,
      label: "protocol 1 label",
      supports_registration: true,
      supports_staging: true,
      settings: [],
      library_settings: [],
    },
  ];
  const allLibraries = [
    { short_name: "nypl", name: "New York Public Library", uuid: "1" },
    { short_name: "bpl", name: "Brooklyn Public Library", uuid: "2" },
    { short_name: "qpl", name: "Queens Public Library", uuid: "3" },
  ];
  const libraryRegistrationsData = [
    {
      id: 1,
      libraries: [
        { short_name: "nypl", status: "success", stage: "production" },
        { short_name: "bpl", status: "failure", stage: "testing" },
      ],
    },
  ];
  const servicesData = {
    discovery_services: [serviceData],
    protocols: protocolsData,
    allLibraries: allLibraries,
    libraryRegistrations: libraryRegistrationsData,
  };

  describe("rendering", () => {
    beforeEach(() => {
      save = stub();
      registerLibrary = stub();
      wrapper = shallow(
        <LibraryRegistration
          disabled={false}
          data={servicesData}
          save={save}
          urlBase="url base"
          listDataKey="discovery_services"
          registerLibrary={registerLibrary}
          protocol={protocol}
        />
      );
    });

    it("doesn't render libraries in create form", () => {
      const libraries = wrapper.find(".service-with-registrations-library");
      expect(libraries.length).to.equal(0);
    });

    it("doesn't render libraries in edit form if protocol doesn't support registration", () => {
      const protocolWithoutRegistration = Object.assign({}, protocolsData[0], {
        supports_registration: false,
      });
      const servicesDataWithoutRegistration = {
        discovery_services: [serviceData],
        protocols: [protocolWithoutRegistration],
        allLibraries: allLibraries,
      };
      wrapper = mount(
        <LibraryRegistration
          disabled={false}
          data={servicesDataWithoutRegistration}
          item={serviceData}
          save={save}
          urlBase="url base"
          listDataKey="discovery_services"
          registerLibrary={registerLibrary}
          protocol={protocol}
        />
      );

      const libraries = wrapper.find(".service-with-registrations-library");
      expect(libraries.length).to.equal(0);
    });

    it("renders all libraries in edit form, with registration status", () => {
      wrapper.setProps({ item: serviceData });
      const libraries = wrapper.find(".service-with-registrations-library");
      expect(libraries.length).to.equal(3);
      expect(libraries.at(0).text()).to.contain("New York Public Library");
      expect(libraries.at(0).html()).to.contain("Registered");
      expect(libraries.at(1).text()).to.contain("Brooklyn Public Library");
      expect(libraries.at(1).html()).to.contain("Registration failed");
      expect(libraries.at(2).text()).to.contain("Queens Public Library");
      expect(libraries.at(2).html()).to.contain("Not registered");
    });

    it("provides links to the libraries' edit forms", () => {
      wrapper.setProps({ item: serviceData });
      const libraries = wrapper.find(".service-with-registrations-library");
      expect(libraries.length).to.equal(3);

      const link1 = libraries.at(0).find("a");
      const link2 = libraries.at(1).find("a");
      const link3 = libraries.at(2).find("a");

      expect(link1.props().href).to.equal("/admin/web/config/libraries/edit/1");
      expect(link2.props().href).to.equal("/admin/web/config/libraries/edit/2");
      expect(link3.props().href).to.equal("/admin/web/config/libraries/edit/3");
    });

    describe("rendering registration information", () => {
      beforeEach(() => {
        save = stub();
        registerLibrary = stub();
        wrapper = shallow(
          <LibraryRegistration
            disabled={false}
            data={servicesData}
            item={serviceData}
            save={save}
            urlBase="url base"
            listDataKey="discovery_services"
            registerLibrary={registerLibrary}
            protocol={protocol}
          />
        );
      });

      it("should not render the staging dropdown if it is not supported", () => {
        servicesData.protocols[0].supports_staging = false;

        wrapper = mount(
          <LibraryRegistration
            disabled={false}
            data={servicesData}
            item={serviceData}
            save={save}
            urlBase="url base"
            listDataKey="discovery_services"
            registerLibrary={registerLibrary}
            protocol={protocol}
          />
        );

        const libraryRegistrationInfo = wrapper.find(
          ".library-registration-info"
        );
        const nypl = libraryRegistrationInfo.at(0);
        const bpl = libraryRegistrationInfo.at(1);
        const qpl = libraryRegistrationInfo.at(2);

        const nyplCurrentStage = nypl.find(".current-stage");
        const bplCurrentStage = bpl.find(".current-stage");
        const qplCurrentStage = qpl.find(".current-stage");
        const nyplEditableInput = nypl.find(EditableInput);
        const bplEditableInput = bpl.find(EditableInput);
        const qplEditableInput = qpl.find(EditableInput);

        // The dropdown to update the current staging level should not be rendered
        expect(nyplCurrentStage.length).to.equal(0);
        expect(bplCurrentStage.length).to.equal(0);
        expect(qplCurrentStage.length).to.equal(0);
        expect(nyplEditableInput.length).to.equal(0);
        expect(bplEditableInput.length).to.equal(0);
        expect(qplEditableInput.length).to.equal(0);

        // Registration status and button should still appear
        const nyplRegistrationStatus = nypl.find("span");
        const bplRegistrationStatus = bpl.find("span");
        const qplRegistrationStatus = bpl.find("span");

        const nyplRegistrationStatusBtn = nypl.find("button");
        const bplRegistrationStatusBtn = bpl.find("button");
        const qplRegistrationStatusBtn = bpl.find("button");

        expect(nyplRegistrationStatus.text()).to.equal("Registered");
        expect(nyplRegistrationStatus.prop("className")).to.equal("bg-success");
        expect(bplRegistrationStatus.text()).to.equal("Registration failed");
        expect(bplRegistrationStatus.prop("className")).to.equal("bg-danger");
        expect(qplRegistrationStatus.text()).to.equal("Registration failed");
        expect(qplRegistrationStatus.prop("className")).to.equal("bg-danger");

        expect(nyplRegistrationStatusBtn.length).to.equal(1);
        expect(nyplRegistrationStatusBtn.text()).to.equal(
          "Update registration"
        );
        expect(bplRegistrationStatusBtn.length).to.equal(1);
        expect(bplRegistrationStatusBtn.text()).to.equal("Retry registration");
        expect(qplRegistrationStatusBtn.length).to.equal(1);
        expect(qplRegistrationStatusBtn.text()).to.equal("Retry registration");

        servicesData.protocols[0].supports_staging = true;
      });

      it("should render the current registration stage", () => {
        // Adding an additional library to display the currect stage when
        // they are in the "testing" stage and their registration was
        // successful, unlike being in the "testing" stage and
        // an unsuccessful registration.
        const libraryRegistrationsDataWBoston = [
          {
            id: 1,
            libraries: [
              { short_name: "nypl", status: "success", stage: "production" },
              { short_name: "bpl", status: "failure", stage: "testing" },
              { short_name: "boston", status: "success", stage: "testing" },
            ],
          },
        ];
        const allLibrariesWBoston = [
          { short_name: "nypl", name: "New York Public Library", uuid: "1" },
          { short_name: "bpl", name: "Brooklyn Public Library", uuid: "2" },
          { short_name: "qpl", name: "Queens Public Library", uuid: "3" },
          { short_name: "boston", name: "Boston Public Library", uuid: "4" },
        ];
        servicesData.allLibraries = allLibrariesWBoston;
        servicesData.libraryRegistrations = libraryRegistrationsDataWBoston;

        save = stub();
        registerLibrary = stub();
        wrapper = mount(
          <LibraryRegistration
            disabled={false}
            data={servicesData}
            item={serviceData}
            save={save}
            urlBase="url base"
            listDataKey="discovery_services"
            registerLibrary={registerLibrary}
            protocol={protocol}
          />
        );
        const libraryRegistrationInfo = wrapper.find(
          ".library-registration-info"
        );

        const nypl = libraryRegistrationInfo.at(0);
        const bpl = libraryRegistrationInfo.at(1);
        const qpl = libraryRegistrationInfo.at(2);
        const bostonpl = libraryRegistrationInfo.at(3);

        const nyplCurrentStage = nypl.find(".current-stage span");
        const bplCurrentStage = bpl.find(".current-stage span");
        const qplCurrentStage = qpl.find(".current-stage span");
        const bostonCurrentStage = bostonpl.find(".current-stage span");

        expect(nyplCurrentStage.text()).to.equal("Current Stage: production");
        expect(bplCurrentStage.text()).to.equal("No current stage");
        expect(qplCurrentStage.text()).to.equal("No current stage");
        expect(bostonCurrentStage.text()).to.equal("Current Stage: testing");
      });

      it("should render a registration stage type dropdown with two options", () => {
        const libraryRegistrationInfo = wrapper.find(
          ".library-registration-info"
        );
        const bpl = libraryRegistrationInfo.at(1);
        const bplEditableInput = bpl.find(EditableInput);
        const options = bplEditableInput.find("option");

        expect(options.length).to.equal(2);
        expect(options.at(0).text()).to.equal("Testing");
        expect(options.at(1).text()).to.equal("Production");
      });

      it("should render a registration stage select if the library is not in production", () => {
        const libraryRegistrationInfo = wrapper.find(
          ".library-registration-info"
        );

        const nypl = libraryRegistrationInfo.at(0);
        const bpl = libraryRegistrationInfo.at(1);
        const qpl = libraryRegistrationInfo.at(2);

        const nyplEditableInput = nypl.find(EditableInput);
        const bplEditableInput = bpl.find(EditableInput);
        const qplEditableInput = qpl.find(EditableInput);

        // Once a library is registered in production, there's no
        // backing out of it so remove the dropdown.
        expect(nyplEditableInput.length).to.equal(0);
        expect(bplEditableInput.length).to.equal(1);
        expect(qplEditableInput.length).to.equal(1);
      });

      it("should render a form", () => {
        const forms = wrapper.find(LibraryRegistrationForm);

        const nyplForm = forms.at(0);
        expect(nyplForm.prop("library").name).to.equal(allLibraries[0].name);
        expect(nyplForm.prop("checked")).to.be.true;
        expect(nyplForm.prop("buttonText")).to.equal("Update registration");

        const bplForm = forms.at(1);
        expect(bplForm.prop("library").name).to.equal(allLibraries[1].name);
        expect(bplForm.prop("checked")).to.be.false;
        expect(bplForm.prop("buttonText")).to.equal("Retry registration");

        const qplForm = forms.at(2);
        expect(qplForm.prop("library").name).to.equal(allLibraries[2].name);
        expect(qplForm.prop("checked")).to.be.false;
        expect(qplForm.prop("buttonText")).to.equal("Register");
      });
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      save = stub();
      registerLibrary = stub();
      wrapper = mount(
        <LibraryRegistration
          disabled={false}
          data={servicesData}
          item={serviceData}
          save={save}
          urlBase="url base"
          listDataKey="discovery_services"
          registerLibrary={registerLibrary}
          protocol={protocol}
        />
      );
    });

    it("registers a library", () => {
      const libraries = wrapper.find(".service-with-registrations-library");
      expect(registerLibrary.callCount).to.equal(0);
      const nyplButton = libraries.at(0).find("button");
      nyplButton.simulate("click");

      expect(registerLibrary.callCount).to.equal(1);

      const bplButton = libraries.at(1).find("button");
      bplButton.simulate("click");

      expect(registerLibrary.callCount).to.equal(2);

      const qplButton = libraries.at(2).find("button");
      qplButton.simulate("click");

      expect(registerLibrary.callCount).to.equal(3);
    });

    it("should update the registration stage type in the state from the dropdown", async () => {
      save = stub();
      registerLibrary = stub();
      wrapper = mount(
        <LibraryRegistration
          disabled={false}
          data={servicesData}
          item={serviceData}
          save={save}
          urlBase="url base"
          listDataKey="discovery_services"
          registerLibrary={registerLibrary}
          protocol={protocol}
        />
      );
      const libraryRegistrationInfo = wrapper.find(
        ".library-registration-info"
      );
      const bpl = libraryRegistrationInfo.at(1);
      const bplEditableInput = bpl.find(EditableInput);

      expect(wrapper.state().registration_stage.bpl).to.equal(undefined);
      expect(bplEditableInput.props().value).to.equal("testing");

      bplEditableInput
        .props()
        .onChange({ short_name: "bpl", name: "Brooklyn Public Library" });

      expect(wrapper.state().registration_stage.bpl).to.equal("testing");
      expect(bplEditableInput.props().value).to.equal("testing");
    });

    it("should update the state stage value when using the dropdown per library", () => {
      save = stub();
      registerLibrary = stub();
      wrapper = mount(
        <LibraryRegistration
          disabled={false}
          data={servicesData}
          item={serviceData}
          save={save}
          urlBase="url base"
          listDataKey="discovery_services"
          registerLibrary={registerLibrary}
          protocol={protocol}
        />
      );

      const libraryRegistrationInfo = wrapper.find(
        ".library-registration-info"
      );
      const bpl = libraryRegistrationInfo.at(1);
      const bplSelect = bpl.find("select");
      const bplSelectElement = bplSelect.getDOMNode();
      const qpl = libraryRegistrationInfo.at(2);
      const qplSelect = qpl.find("select");
      const qplSelectElement = qplSelect.getDOMNode();

      expect(wrapper.state().registration_stage).to.eql({});

      bplSelectElement.value = "testing";
      bplSelect.simulate("change");

      expect(wrapper.state().registration_stage).to.eql({
        bpl: "testing",
      });

      bplSelectElement.value = "production";
      bplSelect.simulate("change");

      expect(wrapper.state().registration_stage).to.eql({
        bpl: "production",
      });

      qplSelectElement.value = "testing";
      qplSelect.simulate("change");

      expect(wrapper.state().registration_stage).to.eql({
        bpl: "production",
        qpl: "testing",
      });

      qplSelectElement.value = "production";
      qplSelect.simulate("change");

      expect(wrapper.state().registration_stage).to.eql({
        bpl: "production",
        qpl: "production",
      });
    });
  });
});

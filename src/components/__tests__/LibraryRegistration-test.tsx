import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import LibraryRegistration from "../LibraryRegistration";
import EditableInput from "../EditableInput";

describe("LibraryRegistration", () => {
  let wrapper;
  let save;
  let registerLibrary;
  let protocol = "protocol 1";
  let serviceData = {
    id: 1,
    protocol,
  };
  let protocolsData = [{
    name: protocol,
    label: "protocol 1 label",
    supports_registration: true,
    supports_staging: true,
    settings: [],
    library_settings: []
  }];
  let allLibraries = [
    { "short_name": "nypl", name: "New York Public Library", uuid: "1" },
    { "short_name": "bpl", name: "Brooklyn Public Library", uuid: "2" },
    { "short_name": "qpl", name: "Queens Public Library", uuid: "3" }
  ];
  let libraryRegistrationsData = [{
    id: 1,
    libraries: [
      { short_name: "nypl", status: "success", stage: "production" },
      { short_name: "bpl", status: "failure", stage: "testing" },
    ]
  }];
  let servicesData = {
    discovery_services: [serviceData],
    protocols: protocolsData,
    allLibraries: allLibraries,
    libraryRegistrations: libraryRegistrationsData
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
      let libraries = wrapper.find(".service-with-registrations-library");
      expect(libraries.length).to.equal(0);
    });

    it("doesn't render libraries in edit form if protocol doesn't support registration", () => {
      let protocolWithoutRegistration = Object.assign({}, protocolsData[0], { supports_registration: false });
      let servicesDataWithoutRegistration = {
        discovery_services: [serviceData],
        protocols: [protocolWithoutRegistration],
        allLibraries: allLibraries
      };
      wrapper = shallow(
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

      let libraries = wrapper.find(".service-with-registrations-library");
      expect(libraries.length).to.equal(0);
    });

    it("renders all libraries in edit form, with registration status", () => {
      wrapper.setProps({ item: serviceData });
      let libraries = wrapper.find(".service-with-registrations-library");
      expect(libraries.length).to.equal(3);
      expect(libraries.at(0).text()).to.contain("New York Public Library");
      expect(libraries.at(0).text()).to.contain("Registered");
      expect(libraries.at(1).text()).to.contain("Brooklyn Public Library");
      expect(libraries.at(1).text()).to.contain("Registration failed");
      expect(libraries.at(2).text()).to.contain("Queens Public Library");
      expect(libraries.at(2).text()).to.contain("Not registered");
    });

    it("provides links to the libraries' edit forms", () => {
      wrapper.setProps({ item: serviceData });
      let libraries = wrapper.find(".service-with-registrations-library");
      expect(libraries.length).to.equal(3);

      let link1 = libraries.at(0).find("a");
      let link2 = libraries.at(1).find("a");
      let link3 = libraries.at(2).find("a");

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

        let libraryRegistrationInfo = wrapper.find(".library-registration-info");
        let nypl = libraryRegistrationInfo.at(0);
        let bpl = libraryRegistrationInfo.at(1);
        let qpl = libraryRegistrationInfo.at(2);

        let nyplCurrentStage = nypl.find(".current-stage");
        let bplCurrentStage = bpl.find(".current-stage");
        let qplCurrentStage = qpl.find(".current-stage");
        let nyplEditableInput = nypl.find(EditableInput);
        let bplEditableInput = bpl.find(EditableInput);
        let qplEditableInput = qpl.find(EditableInput);

        // The dropdown to update the current staging level should not be rendered
        expect(nyplCurrentStage.length).to.equal(0);
        expect(bplCurrentStage.length).to.equal(0);
        expect(qplCurrentStage.length).to.equal(0);
        expect(nyplEditableInput.length).to.equal(0);
        expect(bplEditableInput.length).to.equal(0);
        expect(qplEditableInput.length).to.equal(0);

        // Registration status and button should still appear
        let nyplRegistrationStatus = nypl.find(".registration-status span");
        let bplRegistrationStatus = bpl.find(".registration-status span");
        let qplRegistrationStatus = bpl.find(".registration-status span");
        let nyplRegistrationStatusBtn = nypl.find(".registration-status button");
        let bplRegistrationStatusBtn = bpl.find(".registration-status button");
        let qplRegistrationStatusBtn = bpl.find(".registration-status button");

        expect(nyplRegistrationStatus.text()).to.equal("Registered");
        expect(bplRegistrationStatus.text()).to.equal("Registration failed");
        expect(qplRegistrationStatus.text()).to.equal("Registration failed");

        expect(nyplRegistrationStatusBtn.length).to.equal(1);
        expect(bplRegistrationStatusBtn.length).to.equal(1);
        expect(qplRegistrationStatusBtn.length).to.equal(1);

        servicesData.protocols[0].supports_staging = true;
      });

      it("should render the current registration stage", () => {
        // Adding an additional library to display the currect stage when
        // they are in the "testing" stage and their registration was
        // successful, unlike being in the "testing" stage and
        // an unsuccessful registration.
        let libraryRegistrationsDataWBoston = [{
          id: 1,
          libraries: [
            { short_name: "nypl", status: "success", stage: "production" },
            { short_name: "bpl", status: "failure", stage: "testing" },
            { short_name: "boston", status: "success", stage: "testing" }
          ]
        }];
        let allLibrariesWBoston = [
          { "short_name": "nypl", name: "New York Public Library", uuid: "1" },
          { "short_name": "bpl", name: "Brooklyn Public Library", uuid: "2" },
          { "short_name": "qpl", name: "Queens Public Library", uuid: "3" },
          { "short_name": "boston", name: "Boston Public Library", uuid: "4" }
        ];
        servicesData.allLibraries = allLibrariesWBoston;
        servicesData.libraryRegistrations = libraryRegistrationsDataWBoston;

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
        let libraryRegistrationInfo = wrapper.find(".library-registration-info");

        let nypl = libraryRegistrationInfo.at(0);
        let bpl = libraryRegistrationInfo.at(1);
        let qpl = libraryRegistrationInfo.at(2);
        let bostonpl = libraryRegistrationInfo.at(3);

        let nyplCurrentStage = nypl.find(".current-stage span");
        let bplCurrentStage = bpl.find(".current-stage span");
        let qplCurrentStage = qpl.find(".current-stage span");
        let bostonCurrentStage = bostonpl.find(".current-stage span");

        expect(nyplCurrentStage.text()).to.equal("Current Stage: production");
        expect(bplCurrentStage.text()).to.equal("No current stage");
        expect(qplCurrentStage.text()).to.equal("No current stage");
        expect(bostonCurrentStage.text()).to.equal("Current Stage: testing");
      });

      it("should render a registration stage type dropdown with two options", () => {
        let libraryRegistrationInfo = wrapper.find(".library-registration-info");
        let bpl = libraryRegistrationInfo.at(1);
        let bplEditableInput = bpl.find(EditableInput);
        let options = bplEditableInput.find("option");

        expect(options.length).to.equal(2);
        expect(options.at(0).text()).to.equal("Testing");
        expect(options.at(1).text()).to.equal("Production");
      });

      it("should render a registration stage select if the library is not in production", () => {
        let libraryRegistrationInfo = wrapper.find(".library-registration-info");

        let nypl = libraryRegistrationInfo.at(0);
        let bpl = libraryRegistrationInfo.at(1);
        let qpl = libraryRegistrationInfo.at(2);

        let nyplEditableInput = nypl.find(EditableInput);
        let bplEditableInput = bpl.find(EditableInput);
        let qplEditableInput = qpl.find(EditableInput);

        // Once a library is registered in production, there's no
        // backing out of it so remove the dropdown.
        expect(nyplEditableInput.length).to.equal(0);
        expect(bplEditableInput.length).to.equal(1);
        expect(qplEditableInput.length).to.equal(1);
      });
    });
  });

  describe("behavior", () => {
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

    it("registers a library", () => {
      let libraries = wrapper.find(".service-with-registrations-library");

      expect(registerLibrary.callCount).to.equal(0);

      let nyplButton = libraries.at(0).find("button");
      nyplButton.simulate("click");

      expect(registerLibrary.callCount).to.equal(1);

      let bplButton = libraries.at(1).find("button");
      bplButton.simulate("click");

      expect(registerLibrary.callCount).to.equal(2);

      let qplButton = libraries.at(2).find("button");
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
      let libraryRegistrationInfo = wrapper.find(".library-registration-info");
      let bpl = libraryRegistrationInfo.at(1);
      let bplEditableInput = bpl.find(EditableInput);

      expect(wrapper.state().registration_stage.bpl).to.equal(undefined);
      expect(bplEditableInput.props().value).to.equal("testing");

      bplEditableInput.props().onChange({ "short_name": "bpl", name: "Brooklyn Public Library" });

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

      let libraryRegistrationInfo = wrapper.find(".library-registration-info");
      let bpl = libraryRegistrationInfo.at(1);
      let bplSelect = bpl.find("select");
      let bplSelectElement = bplSelect.get(0);
      let qpl = libraryRegistrationInfo.at(2);
      let qplSelect = qpl.find("select");
      let qplSelectElement = qplSelect.get(0);

      expect(wrapper.state().registration_stage).to.eql({});

      bplSelectElement.value = "testing";
      bplSelect.simulate("change");

      expect(wrapper.state().registration_stage).to.eql({
        "bpl": "testing",
      });

      bplSelectElement.value = "production";
      bplSelect.simulate("change");

      expect(wrapper.state().registration_stage).to.eql({
        "bpl": "production",
      });

      qplSelectElement.value = "testing";
      qplSelect.simulate("change");

      expect(wrapper.state().registration_stage).to.eql({
        "bpl": "production",
        "qpl": "testing",
      });

      qplSelectElement.value = "production";
      qplSelect.simulate("change");

      expect(wrapper.state().registration_stage).to.eql({
        "bpl": "production",
        "qpl": "production",
      });
    });
  });
});

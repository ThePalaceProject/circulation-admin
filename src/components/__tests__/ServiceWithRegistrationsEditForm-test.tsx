import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { DiscoveryServicesData } from "../../interfaces";
import ServiceWithRegistrationsEditForm from "../ServiceWithRegistrationsEditForm";
import EditableInput from "../EditableInput";

describe("ServiceWithRegistrationsEditForm", () => {
  class DiscoveryServiceEditForm extends ServiceWithRegistrationsEditForm<DiscoveryServicesData> {};

  let wrapper;
  let editService;
  let registerLibrary;
  let serviceData = {
    id: 1,
    protocol: "protocol 1"
  };
  let protocolsData = [{
    name: "protocol 1",
    label: "protocol 1 label",
    supports_registration: true,
    settings: [],
    library_settings: []
  }];
  let allLibraries = [
    { "short_name": "nypl", name: "New York Public Library" },
    { "short_name": "bpl", name: "Brooklyn Public Library" },
    { "short_name": "qpl", name: "Queens Public Library" }
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
      editService = stub();
      registerLibrary = stub();
      wrapper = shallow(
        <DiscoveryServiceEditForm
          disabled={false}
          data={servicesData}
          editItem={editService}
          urlBase="url base"
          listDataKey="discovery_services"
          />,
        { registerLibrary: registerLibrary }
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
        <DiscoveryServiceEditForm
          disabled={false}
          data={servicesDataWithoutRegistration}
          item={serviceData}
          editItem={editService}
          urlBase="url base"
          listDataKey="discovery_services"
          />,
        { registerLibrary: registerLibrary }
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

    describe("rendering registration information", () => {
      beforeEach(() => {
        editService = stub();
        registerLibrary = stub();
        wrapper = shallow(
          <DiscoveryServiceEditForm
            disabled={false}
            data={servicesData}
            item={serviceData}
            editItem={editService}
            urlBase="url base"
            listDataKey="discovery_services"
            />,
          { context: { registerLibrary } }
        );
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
          { "short_name": "nypl", name: "New York Public Library" },
          { "short_name": "bpl", name: "Brooklyn Public Library" },
          { "short_name": "qpl", name: "Queens Public Library" },
          { "short_name": "boston", name: "Boston Public Library" }
        ];
        servicesData.allLibraries = allLibrariesWBoston;
        servicesData.libraryRegistrations = libraryRegistrationsDataWBoston;

        editService = stub();
        registerLibrary = stub();
        wrapper = shallow(
          <DiscoveryServiceEditForm
            disabled={false}
            data={servicesData}
            item={serviceData}
            editItem={editService}
            urlBase="url base"
            listDataKey="discovery_services"
            />,
          { context: { registerLibrary } }
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
      editService = stub();
      registerLibrary = stub();
      wrapper = shallow(
        <DiscoveryServiceEditForm
          disabled={false}
          data={servicesData}
          item={serviceData}
          editItem={editService}
          urlBase="url base"
          listDataKey="discovery_services"
          />,
        { context: { registerLibrary } }
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
      editService = stub();
      registerLibrary = stub();
      wrapper = mount(
        <DiscoveryServiceEditForm
          disabled={false}
          data={servicesData}
          item={serviceData}
          editItem={editService}
          urlBase="url base"
          listDataKey="discovery_services"
          />,
        { context: { registerLibrary } }
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
      editService = stub();
      registerLibrary = stub();
      wrapper = mount(
        <DiscoveryServiceEditForm
          disabled={false}
          data={servicesData}
          item={serviceData}
          editItem={editService}
          urlBase="url base"
          listDataKey="discovery_services"
          />,
        { context: { registerLibrary } }
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

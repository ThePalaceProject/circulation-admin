import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import { DiscoveryServicesData } from "../../interfaces";
import ServiceWithRegistrationsEditForm from "../ServiceWithRegistrationsEditForm";
import LibraryRegistration from "../LibraryRegistration";
import EditableInput from "../EditableInput";

describe("ServiceWithRegistrationsEditForm", () => {
  class DiscoveryServiceEditForm extends ServiceWithRegistrationsEditForm<DiscoveryServicesData> {};

  let wrapper;
  let save;
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
      save = stub();
      registerLibrary = stub();
      wrapper = mount(
        <DiscoveryServiceEditForm
          disabled={false}
          data={servicesData}
          save={save}
          urlBase="url base"
          listDataKey="discovery_services"
          />,
        { registerLibrary: registerLibrary }
      );
    });

    it("passes all props to the LibraryRegistration component", () => {
      let libraryRegistration = wrapper.find(LibraryRegistration);

      expect(libraryRegistration.props().protocol).to.equal("protocol 1");
      expect(libraryRegistration.props().item).to.equal(undefined);
      expect(libraryRegistration.props().data).to.equal(servicesData);
      expect(libraryRegistration.props().disabled).to.equal(false);
      expect(libraryRegistration.props().save).to.equal(save);
      expect(libraryRegistration.props().urlBase).to.equal("url base");
      expect(libraryRegistration.props().listDataKey).to.equal("discovery_services");
      expect(libraryRegistration.props().editedIdentifier).to.equal(undefined);
    });
  });
});

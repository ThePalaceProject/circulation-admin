import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import DiscoveryServiceEditForm from "../DiscoveryServiceEditForm";

describe("DiscoveryServiceEditForm", () => {
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
      { short_name: "nypl", status: "success" },
      { short_name: "bpl", status: "failure" }
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
          csrfToken="token"
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
      let libraries = wrapper.find(".discovery-service-library");
      expect(libraries.length).to.equal(0);
    });

    it("renders all libraries in edit form, with registration status", () => {
      wrapper.setProps({ item: serviceData });
      let libraries = wrapper.find(".discovery-service-library");
      expect(libraries.length).to.equal(3);
      expect(libraries.at(0).text()).to.contain("New York Public Library");
      expect(libraries.at(0).text()).to.contain("Registered");
      expect(libraries.at(1).text()).to.contain("Brooklyn Public Library");
      expect(libraries.at(1).text()).to.contain("Registration failed");
      expect(libraries.at(2).text()).to.contain("Queens Public Library");
      expect(libraries.at(2).text()).to.contain("Not registered");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editService = stub();
      registerLibrary = stub();
      wrapper = shallow(
        <DiscoveryServiceEditForm
          csrfToken="token"
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
      let libraries = wrapper.find(".discovery-service-library");

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
  });
});
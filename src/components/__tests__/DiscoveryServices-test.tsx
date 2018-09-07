import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { DiscoveryServices } from "../DiscoveryServices";

describe("DiscoveryServices", () => {
  let wrapper;
  let registerLibrary;
  let fetchLibraryRegistrations;
  let registrationStage;

  beforeEach(() => {
    registerLibrary = stub().returns(new Promise<void>(resolve => resolve()));
    registrationStage = "production";
    fetchLibraryRegistrations = stub();
    wrapper = shallow(
      <DiscoveryServices
        csrfToken="token"
        editOrCreate="edit"
        data={{ discovery_services: [{ id: "2", protocol: "test protocol" }], protocols: [] }}
        identifier="2"
        registerLibrary={registerLibrary}
        fetchLibraryRegistrations={fetchLibraryRegistrations}
        />
    );
  });

  it("includes registerLibrary in child context, and fetches library registrations on mount and after registering", async () => {
    let context = wrapper.instance().getChildContext();

    expect(fetchLibraryRegistrations.callCount).to.equal(1);

    const library = { short_name: "nypl" };
    context.registerLibrary(library, registrationStage);

    expect(registerLibrary.callCount).to.equal(1);
    const formData = registerLibrary.args[0][0];
    expect(formData.get("library_short_name")).to.equal("nypl");
    expect(formData.get("integration_id")).to.equal("2");
    expect(formData.get("registration_stage")).to.equal("production");

    let pause = new Promise<void>(resolve => setTimeout(resolve, 0));
    await pause;
    expect(fetchLibraryRegistrations.callCount).to.equal(2);
  });
});

import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { DiscoveryServices } from "../DiscoveryServices";

describe("DiscoveryServices", () => {
  let wrapper;
  let registerLibrary;
  beforeEach(() => {
    registerLibrary = stub();
    wrapper = shallow(
      <DiscoveryServices
        csrfToken="token"
        editOrCreate="edit"
        data={{ discovery_services: [{ id: "2", protocol: "test protocol" }], protocols: [] }}
        identifier="2"
        registerLibrary={registerLibrary}
        />
    );
  });

  it("includes registerLibrary in child context", () => {
    let context = wrapper.instance().getChildContext();

    const library = { short_name: "nypl" };
    context.registerLibrary(library);

    expect(registerLibrary.callCount).to.equal(1);
    const formData = registerLibrary.args[0][0];
    expect(formData.get("csrf_token")).to.equal("token");
    expect(formData.get("library_short_name")).to.equal("nypl");
    expect(formData.get("integration_id")).to.equal("2");
  });
});
import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { Collections } from "../Collections";

describe("Collections", () => {
  let wrapper;
  let registerLibrary;
  let fetchLibraryRegistrations;
  beforeEach(() => {
    registerLibrary = stub().returns(new Promise<void>(resolve => resolve()));
    fetchLibraryRegistrations = stub();
    wrapper = shallow(
      <Collections
        csrfToken="token"
        editOrCreate="edit"
        data={{ collections: [{ id: "2", protocol: "test protocol" }], protocols: [] }}
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
    context.registerLibrary(library);

    expect(registerLibrary.callCount).to.equal(1);
    const formData = registerLibrary.args[0][0];
    expect(formData.get("library_short_name")).to.equal("nypl");
    expect(formData.get("collection_id")).to.equal("2");

    let pause = new Promise<void>(resolve => setTimeout(resolve, 0));
    await pause;
    expect(fetchLibraryRegistrations.callCount).to.equal(2);
  });
});

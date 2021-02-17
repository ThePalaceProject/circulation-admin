import { expect } from "chai";
import { stub } from "sinon";
import * as React from "react";
import { shallow, mount } from "enzyme";
import * as PropTypes from "prop-types";

import Admin from "../../models/Admin";
import { Collections } from "../Collections";

const collections = [
  { id: "2", protocol: "test protocol", marked_for_deletion: false, name: "ODL" },
  { id: "3", protocol: "test protocol", marked_for_deletion: true, name: "Enki" },
  { id: "4", protocol: "test protocol", marked_for_deletion: false, name: "RBDigital" }
];
import buildStore from "../../store";

describe("Collections", () => {
  let wrapper;
  let registerLibrary;
  let fetchLibraryRegistrations;
  const systemAdmin = new Admin([{ role: "system", library: "nypl" }]);
  const childContextTypes = {
    admin: PropTypes.object.isRequired,
  };

  describe("In Edit mode", () => {
    beforeEach(() => {
      registerLibrary = stub().returns(new Promise<void>(resolve => resolve()));
      fetchLibraryRegistrations = stub();
      wrapper = mount(
        <Collections
          csrfToken="token"
          editOrCreate="edit"
          data={{ collections, protocols: [] }}
          identifier="2"
          registerLibrary={registerLibrary}
          fetchLibraryRegistrations={fetchLibraryRegistrations}
          />,
          { context: { admin: systemAdmin }}
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

  describe("In create/list mode", () => {
    beforeEach(() => {
      registerLibrary = stub().returns(new Promise<void>(resolve => resolve()));
      fetchLibraryRegistrations = stub();
      let store = buildStore();
      wrapper = mount(
        <Collections
          csrfToken="token"
          store={store}
          data={{ collections, protocols: [] }}
          registerLibrary={registerLibrary}
          fetchLibraryRegistrations={fetchLibraryRegistrations}
        />,
          { context: { admin: systemAdmin }}
      );
    });

    it("should render a list of collections and the second collection is marked for deletion", () => {
      const h2 = wrapper.find("h2");
      const ul = wrapper.find("ul");
      const li = ul.find("li");
      // The second collection is marked for deletion.
      const deletedCollection = li.at(1);

      expect(h2.text()).to.equal("Collection configuration");
      expect(ul.length).to.equal(1);
      expect(li.length).to.equal(3);
      // Only one collection is marked as deleted and that list item
      // should have the `deleted-collection` class for display in the UI
      expect(ul.find(".deleted-collection").length).to.equal(1);
      // The second collection is marked for deletion.
      expect(deletedCollection.find("h4").text()).to.equal("Enki");
      expect(deletedCollection.find("p").text()).to.equal(
        "This collection cannot be edited and is currently being deleted. " +
        "The deletion process is gradual and this collection will be removed once it is complete."
      );
    });

    it("should not render edit or delete buttons for the deleted collection", () => {
      const ul = wrapper.find("ul");
      const li = ul.find("li");
      const firstCollection = li.at(0);
      const deletedCollection = li.at(1);

      expect(firstCollection.find("a.edit-item").length).to.equal(1);
      expect(firstCollection.find("button.delete-item").length).to.equal(1);
      expect(deletedCollection.find("a.edit-item").length).to.equal(0);
      expect(deletedCollection.find("button.delete-item").length).to.equal(0);
    });
  });
});

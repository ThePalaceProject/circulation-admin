import { expect } from "chai";
import * as sinon from "sinon";
import { stub } from "sinon";
import * as React from "react";
import { ReactWrapper, mount } from "enzyme";
import * as PropTypes from "prop-types";
import { ProtocolData } from "../../interfaces";
import Admin from "../../models/Admin";
import { Collections, CollectionEditForm } from "../Collections";
import buildStore from "../../store";

const collections = [
  {
    id: "2",
    protocol: "test protocol",
    marked_for_deletion: false,
    name: "ODL",
  },
  {
    id: "3",
    protocol: "test protocol",
    marked_for_deletion: true,
    name: "Enki",
  },
  {
    id: "4",
    protocol: "test protocol",
    marked_for_deletion: false,
    name: "RBDigital",
  },
];
const protocols: ProtocolData[] = [{ name: "test protocol", settings: [] }];

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
      registerLibrary = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
      fetchLibraryRegistrations = stub();
      wrapper = mount(
        <Collections
          csrfToken="token"
          editOrCreate="edit"
          data={{ collections, protocols: [] }}
          identifier="2"
          registerLibrary={registerLibrary}
          fetchLibraryRegistrations={fetchLibraryRegistrations}
          importCollection={stub().returns(
            new Promise<void>((resolve) => resolve())
          )}
        />,
        { context: { admin: systemAdmin } }
      );
    });

    it("includes registerLibrary in child context, and fetches library registrations on mount and after registering", async () => {
      const context = wrapper.instance().getChildContext();

      expect(fetchLibraryRegistrations.callCount).to.equal(1);

      const library = { short_name: "nypl" };
      context.registerLibrary(library);

      expect(registerLibrary.callCount).to.equal(1);
      const formData = registerLibrary.args[0][0];
      expect(formData.get("library_short_name")).to.equal("nypl");
      expect(formData.get("collection_id")).to.equal("2");

      const pause = new Promise<void>((resolve) => setTimeout(resolve, 0));
      await pause;
      expect(fetchLibraryRegistrations.callCount).to.equal(2);
    });
  });

  describe("In create/list mode", () => {
    beforeEach(() => {
      registerLibrary = stub().returns(
        new Promise<void>((resolve) => resolve())
      );
      fetchLibraryRegistrations = stub();
      const store = buildStore();
      wrapper = mount(
        <Collections
          csrfToken="token"
          store={store}
          data={{ collections, protocols: [] }}
          registerLibrary={registerLibrary}
          fetchLibraryRegistrations={fetchLibraryRegistrations}
          importCollection={stub().returns(
            new Promise<void>((resolve) => resolve())
          )}
        />,
        { context: { admin: systemAdmin } }
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

    describe("confirm before disassociating libraries", () => {
      let wrapper: ReactWrapper;
      let confirmStub: sinon.SinonStub;
      let instance: CollectionEditForm;

      const initialLibraries = [
        { short_name: "palace", name: "Palace" },
        { short_name: "another-library", name: "Another Library" },
      ] as const;
      const collection = {
        id: 7,
        name: "An OPDS Collection",
        protocol: "OPDS Import",
        libraries: [...initialLibraries],
      };

      beforeEach(() => {
        confirmStub = sinon.stub(window, "confirm");
        wrapper = mount(
          <CollectionEditForm
            disabled={false}
            data={{
              collections: [collection],
              protocols: [],
              allLibraries: [...initialLibraries],
            }}
            item={collection}
            urlBase="/collections"
            listDataKey="collections"
          />
        );
        instance = wrapper.instance() as CollectionEditForm;
      });

      afterEach(() => {
        confirmStub.restore();
      });

      it("prompts for confirmation before removing a library", () => {
        confirmStub.returns(false);

        // The confirmation dialog should not be invoked before we click.
        expect(confirmStub.called).to.be.false;

        wrapper.find("button.remove-btn").at(0).simulate("click");
        expect(confirmStub.calledOnce).to.be.true;
        const message: string = confirmStub.firstCall.args[0];
        expect(message).to.equal(
          'Disassociating library "Palace" from this collection will ' +
            "remove all loans and holds for its patrons. Do you wish to continue?"
        );
      });

      it("removes library if confirmation is accepted", () => {
        confirmStub.returns(true);
        wrapper.find("button.remove-btn").at(0).simulate("click");

        // Ensure confirmation was sought.
        expect(confirmStub.calledOnce).to.be.true;

        // We deleted the first library, so it should be gone from the state.
        expect(wrapper.state("libraries")).to.deep.equal([initialLibraries[1]]);
      });

      it("does not remove library if confirmation is canceled", () => {
        confirmStub.returns(false);
        wrapper.find("button.remove-btn").at(0).simulate("click");

        // Ensure confirmation was sought.
        expect(confirmStub.calledOnce).to.be.true;

        // We didn't delete, so we should still have the originals.
        expect(wrapper.state("libraries")).to.deep.equal(initialLibraries);
      });

      it("uses library short_name in confirmation when full name is not available", () => {
        const getLibraryStub = stub(instance, "getLibrary").returns(null);
        confirmStub.returns(false);

        wrapper.find("button.remove-btn").at(0).simulate("click");

        expect(confirmStub.calledOnce).to.be.true;
        const message: string = confirmStub.firstCall.args[0];
        const libraryShortName = initialLibraries[0].short_name;
        expect(message).to.equal(
          `Disassociating library "${libraryShortName}" from this collection will ` +
            "remove all loans and holds for its patrons. Do you wish to continue?"
        );
        getLibraryStub.restore();
      });
    });
  });
});

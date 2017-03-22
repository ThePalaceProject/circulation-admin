import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import CollectionEditForm from "../CollectionEditForm";
import EditableInput from "../EditableInput";

describe("CollectionEditForm", () => {
  let wrapper;
  let editCollection;
  let collectionData = {
    name: "name",
    protocol: "Overdrive",
    username: "username",
    password: "password",
    libraries: ["nypl"]
  };
  let protocolsData = [
    {
      name: "OPDS Import",
      fields: [
        { key: "url", label: "URL" }
      ]
    },
    {
      name: "Overdrive",
      fields: [
        { key: "username", label: "Client Key" },
        { key: "password", label: "Client Secret" }
      ]
    }
  ];
  let allLibraries = [
    { "short_name": "nypl" },
    { "short_name": "bpl" }
  ];

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  describe("rendering", () => {
    beforeEach(() => {
      editCollection = stub();
      wrapper = shallow(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          protocols={protocolsData}
          allLibraries={allLibraries}
          editCollection={editCollection}
          />
      );
    });

    it("renders hidden csrf token", () => {
      let input = wrapper.find("input[name=\"csrf_token\"]");
      expect(input.props().value).to.equal("token");
    });

    it("renders name", () => {
      let input = editableInputByName("name");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().readOnly).to.equal(false);

      wrapper.setProps({ collection: collectionData });
      input = editableInputByName("name");
      expect(input.props().value).to.equal("name");
      expect(input.props().readOnly).to.equal(true);
    });

    it("renders protocol", () => {
      let input = editableInputByName("protocol");
      // starts with first protocol in list
      expect(input.props().value).to.equal("OPDS Import");
      expect(input.props().readOnly).to.equal(false);
      let children = input.find("option");
      expect(children.length).to.equal(2);
      expect(children.at(0).text()).to.contain("OPDS Import");
      expect(children.at(1).text()).to.contain("Overdrive");

      wrapper = shallow(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          protocols={protocolsData}
          allLibraries={allLibraries}
          editCollection={editCollection}
          collection={collectionData}
          />
      );
      input = editableInputByName("protocol");
      expect(input.props().value).to.equal("Overdrive");
      expect(input.props().readOnly).to.equal(true);
    });

    it("renders protocol fields", () => {
      let input = editableInputByName("url");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().label).to.equal("URL");

      input = editableInputByName("username");
      expect(input.length).to.equal(0);

      input = editableInputByName("password");
      expect(input.length).to.equal(0);

      wrapper = shallow(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          protocols={protocolsData}
          allLibraries={allLibraries}
          editCollection={editCollection}
          collection={collectionData}
          />
      );

      input = editableInputByName("url");
      expect(input.length).to.equal(0);

      input = editableInputByName("username");
      expect(input.props().value).to.equal("username");
      expect(input.props().label).to.equal("Client Key");

      input = editableInputByName("password");
      expect(input.props().value).to.equal("password");
      expect(input.props().label).to.equal("Client Secret");
    });

    it("renders libraries in collection", () => {
      let library = wrapper.find(".collection-library");
      expect(library.length).to.equal(0);

      wrapper = shallow(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          protocols={protocolsData}
          allLibraries={allLibraries}
          editCollection={editCollection}
          collection={collectionData}
          />
      );
      library = wrapper.find(".collection-library");
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("nypl");
      expect(library.text()).to.contain("remove");
    });

    it("renders library add dropdown", () => {
      let select = wrapper.find("select[name='add-library']");
      expect(select.props().label).to.equal("Add Library");

      let options = select.find("option");
      expect(options.length).to.equal(2);
      expect(options.at(0).props().value).to.equal("nypl");
      expect(options.at(1).props().value).to.equal("bpl");

      wrapper = shallow(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          protocols={protocolsData}
          allLibraries={allLibraries}
          editCollection={editCollection}
          collection={collectionData}
          />
      );
      select = wrapper.find("select[name='add-library']");
      expect(select.props().label).to.equal("Add Library");

      options = select.find("option");
      expect(options.length).to.equal(1);
      expect(options.at(0).props().value).to.equal("bpl");
    });
  });

  describe("behavior", () => {
    beforeEach(() => {
      editCollection = stub().returns(new Promise<void>(resolve => resolve()));
      wrapper = mount(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          protocols={protocolsData}
          allLibraries={allLibraries}
          editCollection={editCollection}
          />
      );
    });

    it("changes fields when protocol changes", () => {
      let urlInput = editableInputByName("url");
      let usernameInput = editableInputByName("username");
      let passwordInput = editableInputByName("password");
      expect(urlInput.length).to.equal(1);
      expect(usernameInput.length).to.equal(0);
      expect(passwordInput.length).to.equal(0);

      let select = wrapper.find("select[name='protocol']") as any;
      let selectElement = select.get(0);
      selectElement.value = "Overdrive";
      select.simulate("change");

      urlInput = editableInputByName("url");
      usernameInput = editableInputByName("username");
      passwordInput = editableInputByName("password");
      expect(urlInput.length).to.equal(0);
      expect(usernameInput.length).to.equal(1);
      expect(passwordInput.length).to.equal(1);

      selectElement.value = "OPDS Import";
      select.simulate("change");

      urlInput = editableInputByName("url");
      usernameInput = editableInputByName("username");
      passwordInput = editableInputByName("password");
      expect(urlInput.length).to.equal(1);
      expect(usernameInput.length).to.equal(0);
      expect(passwordInput.length).to.equal(0);
    });

    it("adds a library", () => {
      let library = wrapper.find(".collection-library");
      expect(library.length).to.equal(0);

      let select = wrapper.find("select[name='add-library']") as any;
      let selectElement = select.get(0);
      selectElement.value = "bpl";

      let addButton = wrapper.find("button.add-library");
      addButton.simulate("click");

      library = wrapper.find(".collection-library");
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("bpl");
      expect(library.text()).to.contain("remove");
    });

    it("removes a library", () => {
      wrapper = shallow(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          protocols={protocolsData}
          allLibraries={allLibraries}
          editCollection={editCollection}
          collection={collectionData}
          />
      );
      let library = wrapper.find(".collection-library");
      expect(library.length).to.equal(1);
      expect(library.text()).to.contain("nypl");

      let removeButton = library.find("i");
      removeButton.simulate("click");

      library = wrapper.find(".collection-library");
      expect(library.length).to.equal(0);
    });

    it("submits data", () => {
      wrapper.setProps({ collection: collectionData });

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editCollection.callCount).to.equal(1);
      let formData = editCollection.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("name")).to.equal("name");
      expect(formData.get("protocol")).to.equal("Overdrive");
      expect(formData.get("username")).to.equal("username");
      expect(formData.get("password")).to.equal("password");
      expect(formData.get("libraries")).to.equal(JSON.stringify(["nypl"]));
    });

    it("goes to collection edit page after creating a new collection", () => {
      let input = wrapper.find("input[name='name']");
      let inputElement = input.get(0);
      inputElement.value = "newName";
      input.simulate("change");

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editCollection.callCount).to.equal(1);
      let formData = editCollection.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("name")).to.equal("newName");
    });
  });
});
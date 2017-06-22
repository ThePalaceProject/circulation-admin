import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow, mount } from "enzyme";

import CollectionEditForm from "../CollectionEditForm";
import EditableInput from "../EditableInput";
import ProtocolFormField from "../ProtocolFormField";

describe("CollectionEditForm", () => {
  let wrapper;
  let editCollection;
  let collectionData = {
    name: "name",
    protocol: "Overdrive",
    username: "username",
    password: "password",
    libraries: [{ short_name: "nypl" }]
  };
  let protocolsData = [
    {
      name: "OPDS Import",
      settings: [
        { key: "url", label: "URL" }
      ]
    },
    {
      name: "Overdrive",
      settings: [
        { key: "username", label: "Client Key" },
        { key: "password", label: "Client Secret" }
      ]
    }
  ];
  let allLibraries = [
    { "short_name": "nypl" },
    { "short_name": "bpl" }
  ];
  let collectionsData = {
    collections: [collectionData],
    protocols: protocolsData,
    allLibraries: allLibraries
  };

  let editableInputByName = (name) => {
    let inputs = wrapper.find(EditableInput);
    if (inputs.length >= 1) {
      return inputs.filterWhere(input => input.props().name === name);
    }
    return [];
  };

  let protocolFormFieldByKey = (key) => {
    let formFields = wrapper.find(ProtocolFormField);
    if (formFields.length >= 1) {
      return formFields.filterWhere(formField => formField.props().setting.key === key);
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
          data={collectionsData}
          editItem={editCollection}
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

      wrapper.setProps({ item: collectionData });
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
          data={collectionsData}
          editItem={editCollection}
          item={collectionData}
          />
      );
      input = editableInputByName("protocol");
      expect(input.props().value).to.equal("Overdrive");
      expect(input.props().readOnly).to.equal(true);
    });

    it("renders protocol fields", () => {
      let input = protocolFormFieldByKey("url");
      expect(input.props().value).not.to.be.ok;
      expect(input.props().setting).to.equal(protocolsData[0].settings[0]);

      input = protocolFormFieldByKey("username");
      expect(input.length).to.equal(0);

      input = protocolFormFieldByKey("password");
      expect(input.length).to.equal(0);

      wrapper = shallow(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          data={collectionsData}
          editItem={editCollection}
          item={collectionData}
          />
      );

      input = protocolFormFieldByKey("url");
      expect(input.length).to.equal(0);

      input = protocolFormFieldByKey("username");
      expect(input.props().value).to.equal("username");
      expect(input.props().setting).to.equal(protocolsData[1].settings[0]);

      input = protocolFormFieldByKey("password");
      expect(input.props().value).to.equal("password");
      expect(input.props().setting).to.equal(protocolsData[1].settings[1]);
    });

    it("renders libraries in collection", () => {
      let library = wrapper.find(".collection-library");
      expect(library.length).to.equal(0);

      wrapper = shallow(
        <CollectionEditForm
          csrfToken="token"
          disabled={false}
          data={collectionsData}
          editItem={editCollection}
          item={collectionData}
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
          data={collectionsData}
          editItem={editCollection}
          item={collectionData}
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
          data={collectionsData}
          editItem={editCollection}
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
          data={collectionsData}
          editItem={editCollection}
          item={collectionData}
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
      wrapper.setProps({ item: collectionData });

      let form = wrapper.find("form");
      form.simulate("submit");

      expect(editCollection.callCount).to.equal(1);
      let formData = editCollection.args[0][0];
      expect(formData.get("csrf_token")).to.equal("token");
      expect(formData.get("name")).to.equal("name");
      expect(formData.get("protocol")).to.equal("Overdrive");
      expect(formData.get("username")).to.equal("username");
      expect(formData.get("password")).to.equal("password");
      expect(formData.get("libraries")).to.equal(JSON.stringify([{ short_name: "nypl" }]));
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
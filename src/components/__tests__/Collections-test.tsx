import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { Collections } from "../Collections";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import CollectionEditForm from "../CollectionEditForm";

describe("Collections", () => {
  let wrapper;
  let fetchCollections;
  let editCollection;
  let collectionsData = [{
    name: "name",
    protocol: "OPDS Import",
    url: "test.com",
    libraries: [],
  }];

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchCollections = stub();
    editCollection = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <Collections
        collections={collectionsData}
        fetchCollections={fetchCollections}
        editCollection={editCollection}
        csrfToken="token"
        isFetching={false}
        />
    );
  });

  it("shows error message", () => {
    let error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(0);
    let fetchError = { status: 400, response: "test error", url: "test url" };
    wrapper.setProps({ fetchError });
    error = wrapper.find(ErrorMessage);
    expect(error.length).to.equal(1);
  });

  it("shows loading indicator", () => {
    let loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(0);
    wrapper.setProps({ isFetching: true });
    loading = wrapper.find(LoadingIndicator);
    expect(loading.length).to.equal(1);
  });

  it("shows collection list", () => {
    let collection = wrapper.find("li");
    expect(collection.length).to.equal(1);
    expect(collection.text()).to.contain("name");
    let editLink = collection.find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/collections/edit/name");
  });

  it("shows create link", () => {
    let createLink = wrapper.find("div > a");
    expect(createLink.length).to.equal(1);
    expect(createLink.props().href).to.equal("/admin/web/config/collections/create");
  });

  it("shows create form", () => {
    let form = wrapper.find(CollectionEditForm);
    expect(form.length).to.equal(0);
    wrapper.setProps({ editOrCreate: "create" });
    form = wrapper.find(CollectionEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().collection).to.be.undefined;
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("shows edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "name" });
    let form = wrapper.find(CollectionEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().collection).to.equal(collectionsData[0]);
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("fetches collections on mount and passes edit function to form", async () => {
    expect(fetchCollections.callCount).to.equal(1);

    wrapper.setProps({ editOrCreate: "create" });
    let form = wrapper.find(CollectionEditForm);

    expect(editCollection.callCount).to.equal(0);
    form.props().editCollection();
    expect(editCollection.callCount).to.equal(1);

    await pause();
    expect(fetchCollections.callCount).to.equal(2);
  });
});
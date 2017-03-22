import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { Libraries } from "../Libraries";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import LibraryEditForm from "../LibraryEditForm";

describe("Libraries", () => {
  let wrapper;
  let fetchLibraries;
  let editLibrary;
  let librariesData = [{
    uuid: "uuid",
    name: "name",
    short_name: "short_name",
    library_registry_short_name: "registry name",
    library_registry_shared_secret: "secret"
  }];

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchLibraries = stub();
    editLibrary = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <Libraries
        libraries={librariesData}
        fetchLibraries={fetchLibraries}
        editLibrary={editLibrary}
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

  it("shows library list", () => {
    let library = wrapper.find("li");
    expect(library.length).to.equal(1);
    expect(library.text()).to.contain("name");
    let editLink = library.find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/libraries/edit/uuid");
  });

  it("shows create link", () => {
    let createLink = wrapper.find("div > a");
    expect(createLink.length).to.equal(1);
    expect(createLink.props().href).to.equal("/admin/web/config/libraries/create");
  });

  it("shows create form", () => {
    let form = wrapper.find(LibraryEditForm);
    expect(form.length).to.equal(0);
    wrapper.setProps({ editOrCreate: "create" });
    form = wrapper.find(LibraryEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().library).to.be.undefined;
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("shows edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "uuid" });
    let form = wrapper.find(LibraryEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().library).to.equal(librariesData[0]);
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("fetches libraries on mount and passes edit function to form", async () => {
    expect(fetchLibraries.callCount).to.equal(1);

    wrapper.setProps({ editOrCreate: "create" });
    let form = wrapper.find(LibraryEditForm);

    expect(editLibrary.callCount).to.equal(0);
    form.props().editLibrary();
    expect(editLibrary.callCount).to.equal(1);

    await pause();
    expect(fetchLibraries.callCount).to.equal(2);
  });
});
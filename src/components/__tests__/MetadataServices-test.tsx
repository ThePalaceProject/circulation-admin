import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { MetadataServices } from "../MetadataServices";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ServiceEditForm from "../ServiceEditForm";

describe("MetadataServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    metadata_services: [{
      id: 2,
      protocol: "test protocol",
      settings: {
        "test_setting": "test setting"
      },
      libraries: [{ short_name: "nypl" }],
    }],
    protocols: [{
      name: "test protocol",
      label: "test protocol label",
      sitewide: false,
      settings: []
    }],
    allLibraries: [{
      short_name: "nypl"
    }]
  };

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <MetadataServices
        data={data}
        fetchData={fetchData}
        editItem={editItem}
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

  it("shows metadata service list", () => {
    let metadataService = wrapper.find("li");
    expect(metadataService.length).to.equal(1);
    expect(metadataService.text()).to.contain("test protocol label");
    let editLink = metadataService.find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/metadata/edit/2");
  });

  it("shows create link", () => {
    let createLink = wrapper.find("div > a");
    expect(createLink.length).to.equal(1);
    expect(createLink.props().href).to.equal("/admin/web/config/metadata/create");
  });

  it("shows create form", () => {
    let form = wrapper.find(ServiceEditForm);
    expect(form.length).to.equal(0);
    wrapper.setProps({ editOrCreate: "create" });
    form = wrapper.find(ServiceEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(data);
    expect(form.props().item).to.be.undefined;
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("shows edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "2" });
    let form = wrapper.find(ServiceEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(data);
    expect(form.props().item).to.equal(data.metadata_services[0]);
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("fetches metadata services on mount and passes edit function to form", async () => {
    expect(fetchData.callCount).to.equal(1);

    wrapper.setProps({ editOrCreate: "create" });
    let form = wrapper.find(ServiceEditForm);

    expect(editItem.callCount).to.equal(0);
    form.props().editItem();
    expect(editItem.callCount).to.equal(1);

    await pause();
    expect(fetchData.callCount).to.equal(2);
  });
});
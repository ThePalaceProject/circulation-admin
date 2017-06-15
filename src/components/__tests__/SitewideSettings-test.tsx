import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { SitewideSettings } from "../SitewideSettings";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import SitewideSettingEditForm from "../SitewideSettingEditForm";

describe("SitewideSettings", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    settings: [
      { key: "test key", value: "test value" }
    ],
    fields: [
      { key: "test key", label: "test label" }
    ]
  };

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <SitewideSettings
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

  it("shows sitewide setting list", () => {
    let sitewideSetting = wrapper.find("li");
    expect(sitewideSetting.length).to.equal(1);
    expect(sitewideSetting.text()).to.contain("test label");
    let editLink = sitewideSetting.find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/sitewideSettings/edit/test key");
  });

  it("shows create link", () => {
    let createLink = wrapper.find("div > a");
    expect(createLink.length).to.equal(1);
    expect(createLink.props().href).to.equal("/admin/web/config/sitewideSettings/create");
  });

  it("shows create form", () => {
    let form = wrapper.find(SitewideSettingEditForm);
    expect(form.length).to.equal(0);
    wrapper.setProps({ editOrCreate: "create" });
    form = wrapper.find(SitewideSettingEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(data);
    expect(form.props().item).to.be.undefined;
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("shows edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "test key" });
    let form = wrapper.find(SitewideSettingEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(data);
    expect(form.props().item).to.equal(data.settings[0]);
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("fetches sitewide settings on mount and passes edit function to form", async () => {
    expect(fetchData.callCount).to.equal(1);

    wrapper.setProps({ editOrCreate: "create" });
    let form = wrapper.find(SitewideSettingEditForm);

    expect(editItem.callCount).to.equal(0);
    form.props().editItem();
    expect(editItem.callCount).to.equal(1);

    await pause();
    expect(fetchData.callCount).to.equal(2);
  });
});
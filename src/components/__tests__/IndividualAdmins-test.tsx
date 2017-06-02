import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { IndividualAdmins } from "../IndividualAdmins";
import ErrorMessage from "../ErrorMessage";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import IndividualAdminEditForm from "../IndividualAdminEditForm";

describe("IndividualAdmins", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    individualAdmins: [{
      email: "test@nypl.org"
    }]
  };

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <IndividualAdmins
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

  it("shows individual admin list", () => {
    let admin = wrapper.find("li");
    expect(admin.length).to.equal(1);
    expect(admin.text()).to.contain("test@nypl.org");
    let editLink = admin.find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/individualAdmins/edit/test@nypl.org");
  });

  it("shows create link", () => {
    let createLink = wrapper.find("div > a");
    expect(createLink.length).to.equal(1);
    expect(createLink.props().href).to.equal("/admin/web/config/individualAdmins/create");
  });

  it("shows create form", () => {
    let form = wrapper.find(IndividualAdminEditForm);
    expect(form.length).to.equal(0);
    wrapper.setProps({ editOrCreate: "create" });
    form = wrapper.find(IndividualAdminEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(data);
    expect(form.props().item).to.be.undefined;
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("shows edit form", () => {
    wrapper.setProps({ editOrCreate: "edit", identifier: "test@nypl.org" });
    let form = wrapper.find(IndividualAdminEditForm);
    expect(form.length).to.equal(1);
    expect(form.props().data).to.deep.equal(data);
    expect(form.props().item).to.equal(data.individualAdmins[0]);
    expect(form.props().csrfToken).to.equal("token");
    expect(form.props().disabled).to.equal(false);
  });

  it("fetches individual admins on mount and passes edit function to form", async () => {
    expect(fetchData.callCount).to.equal(1);

    wrapper.setProps({ editOrCreate: "create" });
    let form = wrapper.find(IndividualAdminEditForm);

    expect(editItem.callCount).to.equal(0);
    form.props().editItem();
    expect(editItem.callCount).to.equal(1);

    await pause();
    expect(fetchData.callCount).to.equal(2);
  });
});
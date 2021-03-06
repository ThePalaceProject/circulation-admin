import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import { SitewideSettings } from "../SitewideSettings";

describe("SitewideSettings", () => {
  let wrapper;
  let fetchData;
  let editItem;
  const data = {
    settings: [{ key: "test key", value: "test value" }],
    all_settings: [{ key: "test key", label: "test label" }],
  };

  const pause = () => {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(
      new Promise<void>((resolve) => resolve())
    );

    wrapper = mount(
      <SitewideSettings
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
      />
    );
  });

  it("shows sitewide setting list", () => {
    const sitewideSetting = wrapper.find("li");
    expect(sitewideSetting.length).to.equal(1);
    expect(sitewideSetting.at(0).text()).to.contain("test label");
    const editLink = sitewideSetting.at(0).find("a").at(0);
    expect(editLink.props().href).to.equal(
      "/admin/web/config/sitewideSettings/edit/test key"
    );
  });
});

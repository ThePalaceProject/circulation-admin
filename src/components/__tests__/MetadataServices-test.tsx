import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import { MetadataServices } from "../MetadataServices";
import { Button } from "library-simplified-reusable-components";

describe("MetadataServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    metadata_services: [{
      id: 2,
      protocol: "test protocol",
      name: "sample name",
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

    wrapper = mount(
      <MetadataServices
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
        />
    );
  });

  it("shows metadata service list", () => {
    let metadataService = wrapper.find("li");
    expect(metadataService.length).to.equal(1);
    expect(metadataService.at(0).text()).to.contain("sample name: test protocol");
    let editLink = metadataService.at(0).find(Button).at(0);
    expect(editLink.props().href).to.equal("/admin/web/config/metadata/edit/2");
  });
});

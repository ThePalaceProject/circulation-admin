import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { MetadataServices } from "../MetadataServices";

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

  it("shows metadata service list", () => {
    let metadataService = wrapper.find("li");
    expect(metadataService.length).to.equal(1);
    expect(metadataService.at(0).text()).to.contain("test protocol label");
    let editLink = metadataService.at(0).find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/metadata/edit/2");
  });
});
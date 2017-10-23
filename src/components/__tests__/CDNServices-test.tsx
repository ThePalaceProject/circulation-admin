import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { CDNServices } from "../CDNServices";

describe("CDNServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    cdn_services: [{
      id: 2,
      protocol: "test protocol",
      settings: {
        "url": "test url"
      }
    }],
    protocols: [{
      name: "test protocol",
      sitewide: true,
      settings: [{
        "key": "url", "label": "url"
      }]
    }]
  };

  const pause = () => {
    return new Promise<void>(resolve => setTimeout(resolve, 0));
  };

  beforeEach(() => {
    fetchData = stub();
    editItem = stub().returns(new Promise<void>(resolve => resolve()));

    wrapper = shallow(
      <CDNServices
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
        />
    );
  });

  it("shows cdn service list", () => {
    let service = wrapper.find("li");
    expect(service.length).to.equal(1);
    expect(service.at(0).text()).to.contain("test url");
    let editLink = service.at(0).find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/cdn/edit/2");
  });
});
import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { AnalyticsServices } from "../AnalyticsServices";

describe("AnalyticsServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    analytics_services: [{
      id: 2,
      protocol: "test protocol",
      settings: {
        "test_setting": "test setting"
      }
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
      <AnalyticsServices
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
        />
    );
  });

  it("shows analytics service list", () => {
    let service = wrapper.find("li");
    expect(service.length).to.equal(1);
    expect(service.at(0).text()).to.contain("test protocol label");
    let editLink = service.at(0).find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/analytics/edit/2");
  });
});

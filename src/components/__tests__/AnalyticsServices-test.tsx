import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import { AnalyticsServices } from "../AnalyticsServices";
import NeighborhoodAnalyticsForm from "../NeighborhoodAnalyticsForm";

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

    wrapper = mount(
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
    let editLink = service.at(0).find("a").at(0);
    expect(editLink.props().href).to.equal("/admin/web/config/analytics/edit/2");
  });

  it("shows neighborhood analytics panel", () => {
    let neighborhoodForm = wrapper.find(NeighborhoodAnalyticsForm);
    expect(neighborhoodForm.length).to.equal(0);
    let setting = { key: "location_source", options: [] };
    let protocols = [{...data.protocols[0], ...{ settings: [setting] }}];
    wrapper.setProps({ editOrCreate: "create", data: {...data, ...{ protocols }} });
    wrapper.setState({ protocol: "test protocol"});
    neighborhoodForm = wrapper.find(NeighborhoodAnalyticsForm);
    expect(neighborhoodForm.length).to.equal(1);
    expect(neighborhoodForm.prop("setting")).to.equal(setting);
  });
});

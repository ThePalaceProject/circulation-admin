import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { mount } from "enzyme";

import { PatronAuthServices } from "../PatronAuthServices";
import NeighborhoodAnalyticsForm from "../NeighborhoodAnalyticsForm";

describe("PatronAuthServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  const data = {
    patron_auth_services: [
      {
        id: 2,
        protocol: "test protocol",
        settings: {
          test_setting: "test setting",
        },
        libraries: [
          {
            short_name: "nypl",
            test_library_setting: "test library setting",
          },
        ],
        name: "nypl protocol",
      },
    ],
    protocols: [
      {
        name: "test protocol",
        label: "test protocol label",
        settings: [],
      },
    ],
    allLibraries: [
      {
        short_name: "nypl",
      },
    ],
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
      <PatronAuthServices
        data={data}
        fetchData={fetchData}
        editItem={editItem}
        csrfToken="token"
        isFetching={false}
      />
    );
  });

  it("shows patron auth service list", () => {
    const patronAuthService = wrapper.find("li");
    expect(patronAuthService.length).to.equal(1);
    expect(patronAuthService.at(0).text()).to.contain(
      "nypl protocol: test protocol label"
    );
    const editLink = patronAuthService.at(0).find("a").at(0);
    expect(editLink.props().href).to.equal(
      "/admin/web/config/patronAuth/edit/2"
    );
  });

  it("shows neighborhood analytics panel", () => {
    let neighborhoodForm = wrapper.find(NeighborhoodAnalyticsForm);
    expect(neighborhoodForm.length).to.equal(0);
    const setting = { key: "neighborhood_mode", options: [] };
    const protocols = [{ ...data.protocols[0], ...{ settings: [setting] } }];
    wrapper.setProps({
      editOrCreate: "create",
      data: { ...data, ...{ protocols } },
    });
    wrapper.setState({ protocol: "test protocol" });
    neighborhoodForm = wrapper.find(NeighborhoodAnalyticsForm);
    expect(neighborhoodForm.length).to.equal(1);
    expect(neighborhoodForm.prop("setting")).to.equal(setting);
  });
});

import { expect } from "chai";
import { stub } from "sinon";

import * as React from "react";
import { shallow } from "enzyme";

import { PatronAuthServices } from "../PatronAuthServices";

describe("PatronAuthServices", () => {
  let wrapper;
  let fetchData;
  let editItem;
  let data = {
    patron_auth_services: [{
      id: 2,
      protocol: "test protocol",
      settings: {
        "test_setting": "test setting"
      },
      libraries: [{
        short_name: "nypl",
        test_library_setting: "test library setting"
      }],
      name: "nypl protocol",
    }],
    protocols: [{
      name: "test protocol",
      label: "test protocol label",
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
    let patronAuthService = wrapper.find("li");
    expect(patronAuthService.length).to.equal(1);
    expect(patronAuthService.at(0).text()).to.contain("nypl protocol: test protocol label");
    let editLink = patronAuthService.at(0).find("a");
    expect(editLink.props().href).to.equal("/admin/web/config/patronAuth/edit/2");
  });
});
